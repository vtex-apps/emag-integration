import httpStatus from "http-status-codes";
import Logger from "../helpers/Logger";

export async function readDBLogs(ctx: Context) {
  const { response, vtex, query } = ctx;
  response.body = await Logger.getPaginatedLogs(vtex, query);
  response.status = httpStatus.OK;
}
