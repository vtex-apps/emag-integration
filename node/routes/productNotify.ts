import { IOContext } from "@vtex/api";
import { json } from "co-body";
import httpStatus from "http-status-codes";
import { EMAG } from "../helpers/EMAGFetch";

import Logger from "../helpers/Logger";
import { VTEX } from "../helpers/VTEXFetch";
import { createEmagProduct } from "../resolvers/createEmagProduct";
import { VtexEmagProduct } from "../typings/productNotify";

const LOG_TYPE = "productNotify";

export async function productNotify(ctx: Context) {
  const { response, req, vtex } = ctx;
  const body: { IdSku: string; ProductId: number } = await json(req);
  await Logger.createDBLog(
    vtex,
    LOG_TYPE,
    `Product notify for SKU ${body.IdSku}`,
    body,
    body.IdSku
  );

  let dbProduct: VtexEmagProduct = {
    VTEXProductID: body.ProductId,
    VTEXSkuID: body.IdSku,
    syncStatus: "IN_SYNC",
    errorMessages: [],
  };
  dbProduct.id = await updateDBProduct(vtex, dbProduct);

  response.body = { success: true };
  response.status = httpStatus.OK;
  try {
    var { eMAGProduct, extraData } = await createEmagProduct(
      vtex,
      body.IdSku,
      body.ProductId
    );
    dbProduct = { ...dbProduct, ...extraData, eMAGProductID: eMAGProduct.id };
  } catch (error) {
    dbProduct.syncStatus = "VTEX_ERROR";
    return await finishProcess(vtex, dbProduct, eMAGProduct, error);
  }

  try {
    const result = await EMAG.createProduct(vtex, [eMAGProduct]);
    if (result?.isError) {
      dbProduct.syncStatus = "EMAG_UPLOAD_ERROR";
      dbProduct.errorMessages = result.messages;
      return await finishProcess(vtex, dbProduct, eMAGProduct);
    }
  } catch (error) {
    dbProduct.syncStatus = "EMAG_UPLOAD_ERROR";
    return await finishProcess(vtex, dbProduct, eMAGProduct, error);
  }

  try {
    const result = await EMAG.getProduct(vtex, eMAGProduct.id);
    if (
      result?.validation_status?.length &&
      result?.validation_status[0]?.value === 9
    ) {
      dbProduct.syncStatus = "EMAG_SUCCESS";
      dbProduct.eMAGPartNumber = result.part_number_key;
    } else if (
      result?.validation_status?.length &&
      result?.validation_status[0]?.value < 5
    ) {
      dbProduct.syncStatus = "EMAG_PENDING";
      dbProduct.errorMessages = [result?.validation_status[0]?.description];
    } else {
      dbProduct.syncStatus = "EMAG_VALIDATION_ERROR";
      dbProduct.errorMessages = result?.validation_status?.length
        ? result?.validation_status[0]?.errors?.errors
        : [];
    }

    await finishProcess(vtex, dbProduct, eMAGProduct);
  } catch (error) {
    dbProduct.syncStatus = "EMAG_UPLOAD_ERROR";

    await finishProcess(vtex, dbProduct, eMAGProduct, error);
  }
  return { success: true };
}

async function finishProcess(
  vtex: IOContext,
  dbProduct: VtexEmagProduct,
  eMAGProduct: any,
  error?: any
) {
  error?.error && dbProduct.errorMessages.push(error.error);
  error?.errorMessage && dbProduct.errorMessages.push(error.errorMessage);
  error?.status && dbProduct.errorMessages.push(error.status);
  error?.statusText && dbProduct.errorMessages.push(error.statusText);
  error?.data && dbProduct.errorMessages.push(error.data);
  error?.messages && dbProduct.errorMessages.push(error.messages);
  await updateDBProduct(vtex, dbProduct);
  await Logger.createDBLog(
    vtex,
    LOG_TYPE,
    `Product notify done for SKU ${dbProduct.VTEXSkuID} with status ${dbProduct.syncStatus}`,
    { dbProduct, eMAGProduct },
    dbProduct.VTEXSkuID
  );
  return { success: true };
}

async function updateDBProduct(
  vtex: IOContext,
  product: VtexEmagProduct
): Promise<string | undefined> {
  try {
    if (product.id) {
      const updateResponse1 = await VTEX.updateDocument(
        vtex,
        "products",
        product
      );
      return updateResponse1.DocumentId;
    }

    const oldDocument = (await VTEX.getAllDocuments(vtex, "products", {
      where: `VTEXSkuID=${product.VTEXSkuID}`,
      fields: "id,VTEXSkuID",
    })) as VtexEmagProduct[];
    if (!oldDocument?.length) {
      //insert
      const insertResponse = await VTEX.insertDocument(
        vtex,
        "products",
        product
      );
      return insertResponse?.DocumentId;
    }
    // update
    product.id = oldDocument[0].id;
    const updateResponse = (await VTEX.updateDocument(
      vtex,
      "products",
      product
    )) as { DocumentId: string };
    return updateResponse.DocumentId;
  } catch (error) {
    if (error.status === 304 && error.statusText === "Not Modified") {
      return product.id || "";
    }
    throw error;
  }
}
