import httpStatus from "http-status-codes";
import { getAppSettings } from "../helpers/ConnectorHelper";
import Logger from "../helpers/Logger";
import { LogSchema, MappingSchema, ProductsSchema } from "../helpers/Schemas";
import { VTEX } from "../helpers/VTEXFetch";

interface InstallResponse {
  type?: string;
  success?: boolean;
  response?: any;
  error?: any;
  url?: string;
}

enum SchemaTypes {
  LOGS = "logs",
  MAPPING = "mapping",
  PRODUCTS = "products",
}

export async function install(ctx: Context) {
  const { response, vtex } = ctx;
  const result1: InstallResponse = { type: SchemaTypes.LOGS };
  try {
    result1.response = await VTEX.createSchema(
      vtex,
      SchemaTypes.LOGS,
      LogSchema
    );
  } catch (error) {
    result1.error = error;
  }
  const result2: InstallResponse = { type: SchemaTypes.MAPPING };
  try {
    result2.response = await VTEX.createSchema(
      vtex,
      SchemaTypes.MAPPING,
      MappingSchema
    );
  } catch (error) {
    result2.error = { error };
  }
  const result2Index: InstallResponse = { type: SchemaTypes.MAPPING };
  try {
    result2Index.response = await VTEX.createIndex(vtex, SchemaTypes.MAPPING, {
      name: "mappingIndex",
      multiple: false,
      fields: "categoryId",
    });
  } catch (error) {
    result2Index.error = { error };
  }
  const result3: InstallResponse = { type: SchemaTypes.PRODUCTS };
  try {
    result3.response = await VTEX.createSchema(
      vtex,
      SchemaTypes.PRODUCTS,
      ProductsSchema
    );
  } catch (error) {
    result3.error = { error };
  }
  const result3Index: InstallResponse = { type: SchemaTypes.PRODUCTS };
  try {
    result3Index.response = await VTEX.createIndex(vtex, SchemaTypes.PRODUCTS, {
      name: "productsIndex",
      multiple: false,
      fields: "VTEXSkuID",
    });
  } catch (error) {
    result3Index.error = { error };
  }
  const orderHook: InstallResponse = {};
  try {
    const appSettings = await getAppSettings(vtex);
    const url =
      (appSettings.domain ? appSettings.domain : `https://${vtex.host}`) +
      `/emag/order-status-change`;
    orderHook.url = url;
    orderHook.response = await VTEX.createOrderHook(vtex, url);
    orderHook.success = true;
  } catch (error) {
    orderHook.success = false;
    orderHook.error = error;
  }
  const data = {
    schemas: [result1, result2, result3],
    indices: [result2Index, result3Index],
    orderHook,
  };
  await Logger.createDBLog(vtex, "install", `App installed successfully`, data);
  response.body = data;
  response.status = httpStatus.OK;
}
