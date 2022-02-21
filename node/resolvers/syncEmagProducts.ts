import { IOContext } from "@vtex/api";
import { EMAG } from "../helpers/EMAGFetch";
import { VTEX } from "../helpers/VTEXFetch";
import { VtexEmagProduct } from "../typings/productNotify";

export async function syncEmagProductsResolver(
  vtex: IOContext,
  dbProducts: VtexEmagProduct[]
) {
  const updatedProducts = [];
  const verifiedProducts = [];
  for (const product of dbProducts) {
    try {
      verifiedProducts.push({
        VTEXSkuID: product.VTEXSkuID,
        eMAGProductID: product.eMAGProductID,
      });
      if (product.id && product.eMAGProductID) {
        const eMAGproduct = await EMAG.getProduct(vtex, product.eMAGProductID);
        const newPoduct: {
          id: string;
          syncStatus: string;
          errorMessages: string[];
          eMAGPartNumber?: string;
        } = {
          id: product.id,
          syncStatus: product.syncStatus,
          errorMessages: product.errorMessages,
        };
        if (eMAGproduct.validation_status[0]?.value === 9) {
          newPoduct.syncStatus = "EMAG_SUCCESS";
          newPoduct.eMAGPartNumber = eMAGproduct.part_number_key;
        } else if (eMAGproduct?.validation_status[0]?.value < 5) {
          newPoduct.syncStatus = "EMAG_PENDING";
          newPoduct.errorMessages = [
            eMAGproduct.validation_status[0]?.description,
          ];
        } else {
          newPoduct.syncStatus = "EMAG_VALIDATION_ERROR";
          newPoduct.errorMessages =
            eMAGproduct.validation_status[0]?.errors?.errors;
        }
        if (newPoduct.syncStatus !== product.syncStatus) {
          const updateResponse = await VTEX.updateDocument(
            vtex,
            "products",
            newPoduct
          );
          updatedProducts.push({
            VTEXSkuID: product.VTEXSkuID,
            eMAGProductID: product.eMAGProductID,
            DocumentId: updateResponse.DocumentId,
          });
        } else {
          await new Promise((resolve) => setTimeout(() => resolve(true), 300));
        }
      }
    } catch (error) {}
  }
  return { updatedProducts, verifiedProducts };
}

export async function verifyDuplicates(vtex: IOContext) {
  const dbProducts = (await VTEX.getAllDocuments(vtex, "products", {
    fields: "id,eMAGProductID,VTEXSkuID,updatedIn,createdIn",
    sort: "updatedIn DESC",
  })) as VtexEmagProduct[];
  const verifiedProducts: { [VTEXSkuID: string]: VtexEmagProduct[] } = {};
  dbProducts.forEach((dbProduct: VtexEmagProduct) => {
    const VTEXSkuID = dbProduct.VTEXSkuID;
    if (verifiedProducts[VTEXSkuID]) {
      verifiedProducts[VTEXSkuID].push(dbProduct);
    } else {
      verifiedProducts[VTEXSkuID] = [dbProduct];
    }
  });
  const duplicatedProducts: {
    [VTEXSkuID: string]: { deleted: number; found: number };
  } = {};
  Object.keys(verifiedProducts).forEach(async (VTEXSkuID: string) => {
    const array = verifiedProducts[VTEXSkuID];
    if (array.length > 1) {
      let deleted = 0;
      for (let i = 1; i < array.length; i++) {
        try {
          await VTEX.deleteDocument(vtex, "products", array[i].id);
          deleted++;
        } catch (error) {}
      }
      duplicatedProducts[VTEXSkuID] = { deleted, found: array.length };
    }
  });
  return duplicatedProducts;
}
