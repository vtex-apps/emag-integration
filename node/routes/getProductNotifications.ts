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
  return Promise.all([
    VTEX.getAllDocuments(ctx.vtex, "products", {
      fields: fields.join(","),
      pagination: query.pagination || "0-500",
      sort: query.sort,
      where: where || undefined,
    }),
    VTEX.getAllDocuments(ctx.vtex, "products", {
      fields: "id",
      pagination: "0-3000",
      where: where || undefined,
    }),
  ])
    .then((responses) => {
      const data = {
        results: responses[0],
        totalRecordCount: responses[1]?.length || 0,
      };
      response.body = data;
      response.status = httpStatus.OK;
      return data;
    })
    .catch((error) => {
      response.body = error;
      response.status = httpStatus.BAD_REQUEST;
      return error;
    });
}
