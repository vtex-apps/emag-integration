import httpStatus from "http-status-codes";
import { VTEX } from "../helpers/VTEXFetch";

export async function getProductNotifications(ctx: Context) {
  const { response, query } = ctx;
  const fields = [
    "createdIn",
    "updatedIn",
    "VTEXProductID",
    "VTEXSkuID",
    "VTEXSkuName",
    "VTEXSkuImage",
    "VTEXCategoryID",
    "eMAGProductID",
    "eMAGProductName",
    "eMAGPartNumber",
    "eMAGCategoryID",
    "syncStatus",
    "errorMessages",
    "type",
  ];
  let where: string = "";
  if (query.filter && query.search) {
    where = `syncStatus=${query.filter} AND (VTEXSkuName=*${query.search}* OR VTEXSkuID=*${query.search}*)`;
  } else if (query.search) {
    where = `VTEXSkuName=*${query.search}* OR VTEXSkuID=*${query.search}*`;
  } else if (query.filter) {
    where = `syncStatus=${query.filter}`;
  }
  response.body = await VTEX.getAllDocuments(
    ctx.vtex,
    "products",
    {
      fields: fields.join(","),
      pagination: query.pagination || "0-500",
      sort: query.sort,
      where: where || undefined,
    },
    true
  );
  response.status = httpStatus.OK;
}
