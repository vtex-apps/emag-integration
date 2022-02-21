import { IOContext } from "@vtex/api";
import axios, { AxiosRequestHeaders } from "axios";
import {
  OrderSimulationBody,
  OrderSimulationResponse,
  VTEXCreatedOrder,
} from "../typings/orderNotify";
import {
  VTEXTrackingBody,
  VTEXTrackingResponse,
} from "../typings/orderStatusChange";
import {
  CartSimulationBody,
  CartSimultationResponse,
  SKU,
  VtexEmagProduct,
  Warehouse,
} from "../typings/productNotify";
import { Index, Mapping, Schema } from "../typings/schema";
import { getAppSettings } from "./ConnectorHelper";

export const VTEX = {
  getHeaders: async (ctx: IOContext) => {
    const settings: AppSettings = await getAppSettings(ctx);
    return {
      "Content-Type": "application/json",
      "Proxy-Authorization": ctx.authToken,
      "X-VTEX-API-AppKey": settings.vtexAppKey,
      "X-VTEX-API-AppToken": settings.vtexAppToken,
      "X-Vtex-Proxy-To": `https://${ctx.account}.vtexcommercestable.com.br`,
    };
  },
  /* -------------------------------------------------------------------------- */
  /*                                Products                                    */
  /* -------------------------------------------------------------------------- */
  getProduct: (
    ctx: IOContext,
    productId: number
  ): Promise<{ CategoryId: number }> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "GET",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/catalog/pvt/product/${productId}`,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  getSKU: (ctx: IOContext, skuId: string): Promise<SKU> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "GET",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  getSKUStock: (
    ctx: IOContext,
    skuId: string
  ): Promise<{ skuId: string; balance: Warehouse[] }> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "GET",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/logistics/pvt/inventory/skus/${skuId}`,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  cartSimulation: (
    ctx: IOContext,
    data: CartSimulationBody
  ): Promise<CartSimultationResponse> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "POST",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/checkout/pub/orderForms/simulation`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  orderSimulation: (
    ctx: IOContext,
    settings: AppSettings,
    data: OrderSimulationBody
  ): Promise<OrderSimulationResponse[]> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "POST",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/fulfillment/pvt/orderForms/simulation?sc=${settings.tradePolicyId}`,
        data,
      })
        .then((response) => {
          resolve(response?.data?.logisticsInfo);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  createOrder: (
    ctx: IOContext,
    settings: AppSettings,
    data: any
  ): Promise<VTEXCreatedOrder[]> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "POST",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/fulfillment/pvt/orders?sc=${settings.tradePolicyId}&affiliateId=${settings.affiliateId}`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  authorizeFulfillment: (
    ctx: IOContext,
    settings: AppSettings,
    orderId: string
  ) => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "POST",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/fulfillment/pvt/orders/${orderId}/fulfill?sc=${settings.tradePolicyId}&affiliateId=${settings.affiliateId}`,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  getOrder: (ctx: IOContext, orderId: string): Promise<VTEXCreatedOrder> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "GET",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}`,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  saveTrackingNumber: (
    ctx: IOContext,
    orderId: string,
    invoiceNumber: string | undefined,
    data: VTEXTrackingBody
  ): Promise<VTEXTrackingResponse> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "PATCH",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/oms/pvt/orders/${orderId}/invoice/${invoiceNumber}`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  /* -------------------------------------------------------------------------- */
  /*                                Master Data                                 */
  /* -------------------------------------------------------------------------- */
  createSchema: (ctx: IOContext, entity: string, data: Schema) => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "PUT",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/schemas/${entity}`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject({
            data: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
          });
        });
    });
  },
  createIndex: (ctx: IOContext, entity: string, data: Index) => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "PUT",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/indices`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject({
            data: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
          });
        });
    });
  },
  insertDocument: (
    ctx: IOContext,
    entity: string,
    data: object
  ): Promise<{ DocumentId: string }> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "POST",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/documents?_schema=${entity}`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject({
            data: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
          });
        });
    });
  },
  updateDocument: (
    ctx: IOContext,
    entity: string,
    data: object
  ): Promise<{ DocumentId: string }> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "PATCH",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/documents?_schema=${entity}`,
        data,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject({
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
          });
        });
    });
  },
  deleteDocument: (
    ctx: IOContext,
    entity: string,
    documentId?: string
  ): Promise<{ DocumentId: string }> => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "DELETE",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/documents/${documentId}`,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject({
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
          });
        });
    });
  },
  getAllDocuments: (
    ctx: IOContext,
    entity: string,
    query?: {
      fields?: string;
      where?: string;
      sort?: string;
      pagination?: string;
    }
  ): Promise<Mapping[] | VtexEmagProduct[]> => {
    return new Promise(async (resolve, reject) => {
      let url = `http://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/search?_schema=${entity}`;
      if (query?.fields) {
        url += `&_fields=${query.fields}`;
      } else {
        url += `&_fields=_all`;
      }
      if (query?.where) {
        url += `&_where=${query.where}`;
      }
      if (query?.sort) {
        url += `&_sort=${query.sort}`;
      }
      const headers: AxiosRequestHeaders = await VTEX.getHeaders(ctx);
      if (query?.pagination) {
        headers["REST-Range"] = `resources=${query?.pagination}`;
      }
      axios({
        headers,
        method: "GET",
        url,
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  createOrderHook: (ctx: IOContext, url: string) => {
    return new Promise(async (resolve, reject) => {
      const headers = await VTEX.getHeaders(ctx);
      axios({
        headers,
        method: "POST",
        url: `http://${ctx.account}.vtexcommercestable.com.br/api/orders/hook/config`,
        data: {
          filter: {
            type: "FromWorkflow",
            status: ["invoice", "cancel"],
          },
          hook: {
            url,
            headers,
          },
        },
      })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject({
            data: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
          });
        });
    });
  },
};
