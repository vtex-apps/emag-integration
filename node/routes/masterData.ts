import httpStatus from "http-status-codes";
import { json } from "co-body";

import { VTEX } from "../helpers/VTEXFetch";
import Logger from "../helpers/Logger";

export async function createNewDocument(ctx: Context) {
  const { response, req, query } = ctx;
  if (!query.entity) {
    response.status = httpStatus.BAD_REQUEST;
    response.body = {
      message: "entity is required",
    };
    return;
  }
  const data = await json(req);
  response.body = await VTEX.insertDocument(ctx.vtex, query.entity, data);
  response.status = httpStatus.OK;
}

export async function getAllDocuments(ctx: Context) {
  const { response, query } = ctx;
  if (!query.entity) {
    response.status = httpStatus.BAD_REQUEST;
    response.body = {
      message: "entity is required",
    };
    return;
  }
  response.body = await VTEX.getAllDocuments(
    ctx.vtex,
    query.entity,
    query.fields
  );
  response.status = httpStatus.OK;
}

export async function readDBLogs(ctx: Context) {
  const { response, vtex, query } = ctx;
  if (!query?.usePagination) {
    response.body = await VTEX.getAllDocuments(vtex, "logs", {
      fields: "created,msg,data,type,referenceId",
      where: "created is not null",
      sort: "createdIn DESC",
      pagination: "0-500",
    });
    response.status = httpStatus.OK;
    return;
  }
  const { data, status } = await Logger.getPaginatedLogs(vtex, query);
  response.body = data;
  response.status = status;
}
