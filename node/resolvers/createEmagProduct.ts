import { IOContext } from "@vtex/api";
import httpStatus from "http-status-codes";
import { getAppSettings } from "../helpers/ConnectorHelper";
import { EMAG } from "../helpers/EMAGFetch";

import { VTEX } from "../helpers/VTEXFetch";
import {
  emagCharacteristic,
  EmagSentProduct,
  SKU,
  Specification,
  VtexEmagProduct,
  VtexSkuPrice,
  Warehouse,
} from "../typings/productNotify";
import { Mapping } from "../typings/schema";

export async function createEmagProduct(
  vtex: IOContext,
  IdSku: string,
  ProductId: number
): Promise<{
  eMAGProduct: EmagSentProduct;
  extraData: {
    VTEXSkuImage: string | null;
    VTEXSkuName: string;
    eMAGProductName: string;
    eMAGCategoryID: string;
    VTEXCategoryID: string;
    type: string;
  };
}> {
  const sku = await VTEX.getSKU(vtex, IdSku);
  if (!sku) {
    throw {
      status: httpStatus.NOT_FOUND,
      errorMessage: "SKU not found",
    };
  }

  const product: { CategoryId: number } = await VTEX.getProduct(
    vtex,
    ProductId
  );
  if (!product) {
    throw {
      status: httpStatus.NOT_FOUND,
      errorMessage: "Product not found",
    };
  }

  const category = (await VTEX.getAllDocuments(vtex, "mapping", {
    where: `categoryId=${product.CategoryId}`,
    fields: "id,categoryId,mappedCategoryId,specifications",
  })) as Mapping[];
  if (!category.length) {
    throw {
      status: httpStatus.NOT_FOUND,
      errorMessage: "Mapped category not found",
    };
  }

  const vat_id = await getVATRate(vtex, sku);

  const appSettings = await getAppSettings(vtex);
  const stock = await getStocks(vtex, appSettings, IdSku);
  const productName = getProductName(sku, appSettings);
  const id = Number(`${appSettings.valueConcatProductId}${sku.Id}`);
  const { allImages, avatar } = getImages(sku);

  const extraData = {
    VTEXSkuImage: avatar,
    VTEXSkuName: sku.NameComplete,
    eMAGProductName: productName,
    eMAGCategoryID: category[0].mappedCategoryId,
    VTEXCategoryID: category[0].categoryId,
    type: sku.ManufacturerCode ? "OFFER" : "PRODUCT",
  };

  if (!sku.IsActive) {
    return {
      eMAGProduct: {
        id,
        status: 0,
      },
      extraData,
    };
  }

  const price = await getPrice(vtex, appSettings, IdSku);

  const { characteristics, skuSpecs } = getSpecificationsArray(
    sku.SkuSpecifications,
    sku.ProductSpecifications,
    category[0]
  );

  const familyId = await getFamily(
    vtex,
    skuSpecs,
    characteristics,
    category[0]
  );

  const eMAGProduct = {
    id,
    brand: sku.BrandName,
    name: productName,
    description: sku.ProductDescription,
    images: allImages,
    status: sku.IsActive ? 1 : 0,
    vat_id,
    category_id: category[0].mappedCategoryId,
    vendor_category_id: category[0].categoryId,
    characteristics,
    stock: [stock],
    handling_time: [
      {
        value: appSettings.handlingTime || 0,
        warehouse_id: 1,
      },
    ],
    part_number: sku.AlternateIds.RefId || sku.Id,
    part_number_key: sku.ManufacturerCode ? sku.ManufacturerCode : undefined,
    ean: sku.AlternateIds.Ean ? [sku.AlternateIds.Ean] : [],
    ...price,
    family: familyId
      ? {
          id: ProductId,
          name: sku.ProductName,
          family_type_id: familyId,
        }
      : undefined,
  };
  if (!sku.ManufacturerCode) {
    return { eMAGProduct, extraData };
  }

  const oldProduct = (await VTEX.getAllDocuments(vtex, "products", {
    fields: "id,eMAGProductID,eMAGPartNumber",
    where: `VTEXSkuID=${IdSku}`,
  })) as VtexEmagProduct[];
  if (!oldProduct?.length || !oldProduct[0]?.eMAGPartNumber) {
    return { eMAGProduct, extraData };
  }
  return {
    eMAGProduct: {
      id,
      status: sku.IsActive ? 1 : 0,
      vat_id,
      stock: [stock],
      handling_time: [
        {
          value: appSettings.handlingTime || 0,
          warehouse_id: 1,
        },
      ],
      sale_price: price.sale_price,
    },
    extraData,
  };
}

async function getStocks(
  vtex: IOContext,
  appSettings: AppSettings,
  IdSku: string
): Promise<{
  value: number;
  warehouse_id: number;
}> {
  const skuStock = await VTEX.getSKUStock(vtex, IdSku);
  let warehouses: Warehouse[] = skuStock?.balance || [];
  if (appSettings.warehouses) {
    const acceptedWarehouses = appSettings.warehouses.split(",");
    if (acceptedWarehouses.length) {
      warehouses = warehouses.filter(
        (item) => acceptedWarehouses.indexOf(item.warehouseId) > -1
      );
    }
  }
  const result = warehouses.reduce(
    (initial, item) => ({
      value: item.totalQuantity - item.reservedQuantity + initial.value,
      warehouse_id: 1,
    }),
    {
      value: 0,
      warehouse_id: 1,
    }
  );
  if (result.value > 65500) {
    result.value = 65500;
  }
  return result;
}

async function getPrice(
  vtex: IOContext,
  appSettings: AppSettings,
  IdSku: string
): Promise<{
  max_sale_price: number;
  min_sale_price: number;
  sale_price: number;
  recommended_price: number;
}> {
  const vtexSkuPrice: VtexSkuPrice = await VTEX.getPrice(vtex, appSettings, IdSku);
  if (!vtexSkuPrice) {
    throw {
      IdSku,
      status: httpStatus.NOT_FOUND,
      errorMessage: "Price not found"
    };
  }

  const price = vtexSkuPrice.sellingPrice;
  const listPrice = vtexSkuPrice.listPrice;
  return {
    max_sale_price: parseFloat(
      (price * (appSettings.maxFactor / 100 + 1)).toFixed(2)
    ),
    min_sale_price:
      parseFloat((price * ((100 - appSettings.minFactor) / 100)).toFixed(2)) -
      0.01,
    sale_price: parseFloat(price.toFixed(2)),
    recommended_price: parseFloat(listPrice.toFixed(2)),
  };
}

function getProductName(sku: SKU, appSettings: AppSettings): string {
  let productName = sku.NameComplete;

  if (appSettings.concatBrandInName) {
    productName += `, ${sku.BrandName}`;
  }

  if (
    appSettings.valueConcatProductName &&
    appSettings.valueConcatProductName.trim()
  ) {
    productName += `, ${appSettings.valueConcatProductName}`;
  }
  return productName;
}

async function getVATRate(ctx: IOContext, sku: SKU): Promise<number> {
  const { results } = await EMAG.getVAT(ctx);
  const vtSel = results.find(
    (vat) => parseInt(sku.TaxCode, 10) === vat.vat_rate * 100
  );
  const defaultValue = results.find((vat) => vat.is_default === 1);

  return vtSel?.vat_id || defaultValue?.vat_id || 0;
}

function getImages(sku: SKU): {
  allImages: { display_type: number; url: string }[];
  avatar: string | null;
} {
  const allImages = sku.Images.map((image, index) => ({
    display_type: index === 0 ? 1 : 0,
    url: image.ImageUrl,
  }));
  return {
    allImages,
    avatar: sku.Images?.length ? sku.Images[0].ImageUrl : null,
  };
}

function getSpecificationsArray(
  skuSpecifications: Specification[],
  productSpecifications: Specification[],
  category: Mapping
): { characteristics: emagCharacteristic[]; skuSpecs: emagCharacteristic[] } {
  function parseSpecification(spec: Specification) {
    const specification = category.specifications.find(
      (item) => Number(item.specificationId) === spec.FieldId
    );
    if (specification) {
      const id = Number(
        specification.mappedSpecificationName.split("]")[0].substring(1)
      );
      let value = spec.FieldValues[0];
      if (specification.specificationValues?.length) {
        const mappedSpecValue = specification.specificationValues.find(
          (item) => item.specificationValue === spec.FieldValues[0]
        );
        if (mappedSpecValue?.mappedSpecificationValue) {
          value = mappedSpecValue?.mappedSpecificationValue;
        }
      }
      return { id, value };
    }
    return null;
  }

  const results: emagCharacteristic[] = [];
  const skuSpecs: emagCharacteristic[] = [];
  if (skuSpecifications) {
    skuSpecifications.forEach((item) => {
      const result = parseSpecification(item);
      result && results.push(result);
      result && skuSpecs.push(result);
    });
  }

  if (productSpecifications) {
    productSpecifications.forEach((item) => {
      const result = parseSpecification(item);
      result && results.push(result);
    });
  }

  return { characteristics: results, skuSpecs };
}

async function getFamily(
  vtex: IOContext,
  skuSpecifications: emagCharacteristic[],
  allSpecifications: emagCharacteristic[],
  mappedCategory: Mapping
): Promise<string | null> {
  const emagCategory = await EMAG.getCategory(
    vtex,
    mappedCategory.mappedCategoryId
  );
  if (!emagCategory) {
    throw {
      status: httpStatus.NOT_FOUND,
      errorMessage: `eMAG category ${mappedCategory.mappedCategoryId} not found`,
    };
  }
  const skuSpecificationIds = skuSpecifications.map((item) => item.id);
  const familyTypes = emagCategory.family_types;
  let family;
  let N = skuSpecifications.length;
  while (N > 0) {
    const foundFamily = familyTypes
      .filter((family) => family.characteristics?.length === N)
      .find((family) =>
        family.characteristics.every((characteristic) =>
          skuSpecificationIds.includes(characteristic.characteristic_id)
        )
      );
    if (foundFamily) {
      family = foundFamily;
      break;
    }
    N--;
  }
  if (family) {
    return family.id;
  }
  familyTypes.sort(
    (a, b) => a.characteristics?.length - b.characteristics?.length
  );
  const allSpecificationIds = allSpecifications.map((item) => item.id);

  family = familyTypes.find((family) =>
    family.characteristics.every((characteristic) =>
      allSpecificationIds.includes(characteristic.characteristic_id)
    )
  );
  return family?.id || null;
}
