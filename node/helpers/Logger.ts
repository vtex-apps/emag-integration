import { IOContext } from "@vtex/api";
import httpStatus from "http-status-codes";
import { VTEX } from "../helpers/VTEXFetch";

class Logger {
  async createDBLog(
    vtex: IOContext,
    type: string,
    msg: string,
    data: object,
    referenceId?: string
  ) {
    const created = new Date().toISOString();
    const dbOObject = { created, type, msg, data, referenceId };
    return await VTEX.insertDocument(vtex, "logs", dbOObject);
  }

  async getPaginatedLogs(vtex: IOContext, query: any) {
    let where: string = "";
    if (query.filter && query.search) {
      where = `type=${query.filter} AND referenceId=*${query.search}*`;
    } else if (query.search) {
      where = `referenceId=*${query.search}*`;
    } else if (query.filter) {
      where = `type=${query.filter}`;
    }
    return Promise.all([
      VTEX.getAllDocuments(vtex, "logs", {
        fields: "createdIn,msg,data,type,referenceId",
        pagination: query.pagination || "0-500",
        sort: query.sort || "createdIn DESC",
        where: where || undefined,
      }),
      VTEX.getAllDocuments(vtex, "logs", {
        fields: "id",
        pagination: "0-1000",
        where: where || undefined,
      }),
    ])
      .then((responses) => ({
        data: {
          results: responses[0],
          totalRecordCount: responses[1]?.length || 0,
        },
        status: httpStatus.OK,
      }))
      .catch((error) => ({
        data: error,
        status: httpStatus.BAD_REQUEST,
      }));
  }
}

export default new Logger();
