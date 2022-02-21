import httpStatus from "http-status-codes";
import { VTEX } from "../helpers/VTEXFetch";
import {
  syncEmagProductsResolver,
  verifyDuplicates,
} from "../resolvers/syncEmagProducts";
import { VtexEmagProduct } from "../typings/productNotify";

export async function syncEmagProducts(ctx: Context) {
  const { response, vtex } = ctx;
  const dbProducts = (await VTEX.getAllDocuments(vtex, "products", {
    fields: "id,eMAGProductID,VTEXSkuID,syncStatus",
    where: "syncStatus='EMAG_PENDING'",
  })) as VtexEmagProduct[];
  const duplicatedProducts = await verifyDuplicates(vtex);
  const syncResponse = await syncEmagProductsResolver(vtex, dbProducts);
  response.body = { ...syncResponse, duplicatedProducts };
  response.status = httpStatus.OK;
}
