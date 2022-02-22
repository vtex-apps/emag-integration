import { json } from "co-body";
import httpStatus from "http-status-codes";
import Logger from "../helpers/Logger";
import { VTEX } from "../helpers/VTEXFetch";

const LOG_TYPE = "mapper";

export async function saveMapping(ctx: Context) {
  const { response, req, vtex } = ctx;
  const body = await json(req);
  await Logger.createDBLog(vtex, LOG_TYPE, "Save mapping", body);
  response.status = httpStatus.OK;
  const res = [];
  for (const category of body.categoryMapping) {
    if (!category.specifications) {
      category.specifications = [];
    }
    const oldDocument = await VTEX.getAllDocuments(vtex, "mapping", {
      where: `categoryId=${category.categoryId}`,
      fields: "id,categoryId",
    });
    if (oldDocument?.length) {
      category.id = oldDocument[0].id;
    }
    let result: any = {};
    try {
      result = await VTEX.updateDocument(vtex, "mapping", category);
    } catch (error) {
      result = { error };
      if (error?.status !== httpStatus.NOT_MODIFIED) {
        response.status = httpStatus.BAD_REQUEST;
      }
    }
    res.push({ categoryId: category.categoryId, ...result });
  }
  await Logger.createDBLog(
    vtex,
    LOG_TYPE,
    `Save mapping done with status code ${response.status}`,
    { res }
  );
  response.body = res;
}

export async function getMapping(ctx: Context) {
  const { response, vtex } = ctx;
  response.body = await VTEX.getAllDocuments(vtex, "mapping", {
    fields: "id,categoryId,mappedCategoryId,specifications",
  });
  response.status = httpStatus.OK;
}

export async function connectorNotification(ctx: Context) {
  const { response, req, vtex } = ctx;
  const body = await json(req);
  await Logger.createDBLog(vtex, LOG_TYPE, "connectorNotification", body);
  response.body = { success: true };
  response.status = httpStatus.OK;
}
