import { IOContext } from "@vtex/api";
import axios from "axios";
import { EmagOrder } from "../typings/orderNotify";
import {
  EmagAWB,
  EmagAWBBody,
  EmagInvoice,
} from "../typings/orderStatusChange";
import {
  EmagCategory,
  EmagSavedProduct,
  emagVAT,
} from "../typings/productNotify";
import { getAppSettings } from "./ConnectorHelper";

const getBase64Auth = (username: string, password: string) => {
  return Buffer.from(`${username}:${password}`).toString("Base64");
};

export const EMAG = {
  getConfig: async (ctx: IOContext) => {
    const settings: AppSettings = await getAppSettings(ctx);
    return {
      headers: {
        "Content-Type": "application/json",
        "Proxy-Authorization": ctx.authToken,
        "X-Vtex-Proxy-To": `https://marketplace-api.emag.ro/api-3`,
      },
      auth: {
        username: settings?.username,
        password: settings?.password,
      },
      hash: getBase64Auth(settings?.username, settings?.password),
    };
  },
  getVAT: async (ctx: IOContext): Promise<{ results: emagVAT[] }> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/vat/read?auth=${config.hash}`,
        auth: config.auth,
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  createProduct: async (
    ctx: IOContext,
    data: any
  ): Promise<{ isError: boolean; messages: string[] }> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/product_offer/save?auth=${config.hash}`,
        auth: config.auth,
        data,
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  getProduct: async (ctx: IOContext, id: number): Promise<EmagSavedProduct> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/product_offer/read?auth=${config.hash}`,
        auth: config.auth,
        data: { id },
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data?.results[0]);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  getOrder: async (ctx: IOContext, id: number): Promise<EmagOrder> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/order/read?auth=${config.hash}`,
        auth: config.auth,
        data: { id },
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data?.results[0]);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  sendOrderAcknowledge: async (
    ctx: IOContext,
    id: number
  ): Promise<{ isError: boolean }> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/order/acknowledge/${id}?auth=${config.hash}`,
        auth: config.auth,
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  saveInvoiceDocument: async (
    ctx: IOContext,
    data: EmagInvoice[]
  ): Promise<{ isError: boolean }> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/order/attachments/save?auth=${config.hash}`,
        auth: config.auth,
        data,
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  updateOrder: async (
    ctx: IOContext,
    data: EmagOrder[]
  ): Promise<{ isError: boolean }> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/order/save?auth=${config.hash}`,
        auth: config.auth,
        data,
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  getCategory: async (
    ctx: IOContext,
    categoryId: string
  ): Promise<EmagCategory> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/category/read?auth=${config.hash}`,
        auth: config.auth,
        data: { id: categoryId },
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data?.results[0]);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  saveAWB: async (
    ctx: IOContext,
    data: EmagAWBBody
  ): Promise<{
    isError: boolean;
    messages: string[];
    results: { reservation_id: number };
  }> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/awb/save?auth=${config.hash}`,
        auth: config.auth,
        data,
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  readAWB: async (ctx: IOContext, reservation_id: number): Promise<EmagAWB> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/awb/read?auth=${config.hash}`,
        auth: config.auth,
        data: { reservation_id },
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data?.results);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
  readAWBpdf: async (ctx: IOContext, emag_id: number): Promise<EmagAWB> => {
    return new Promise(async (resolve, reject) => {
      const config = await EMAG.getConfig(ctx);
      axios({
        headers: config.headers,
        method: "POST",
        url: `http://marketplace-api.emag.ro/api-3/awb/read_pdf?auth=${config.hash}&wb_format=a4&emag_id=${emag_id}`,
        auth: config.auth,
        responseType: "arraybuffer",
      })
        .then((response) => {
          if (response?.data?.isError) return reject(response?.data);
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error?.response?.data);
        });
    });
  },
};
