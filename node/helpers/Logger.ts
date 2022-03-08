import { IOContext } from "@vtex/api";
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
    return VTEX.getAllDocuments(
      vtex,
      "logs",
      {
        fields: "createdIn,msg,data,type,referenceId",
        pagination: query.pagination || "0-500",
        sort: query.sort || "createdIn DESC",
        where: where || undefined,
      },
      true
    );
  }
}

export default new Logger();
