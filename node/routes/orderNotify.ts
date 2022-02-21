import httpStatus from "http-status-codes";
import { json } from "co-body";
import { EMAG } from "../helpers/EMAGFetch";

import Logger from "../helpers/Logger";
import { VTEX } from "../helpers/VTEXFetch";
import { EmagOrder } from "../typings/orderNotify";
import { getAppSettings } from "../helpers/ConnectorHelper";
import { createVTEXOrder } from "../resolvers/orderNotify";

const LOG_TYPE = "orderNotify";

export async function orderNotify(ctx: Context) {
  const { vtex, req, response, query } = ctx;
  const body = await json(req);
  const orderId = query.order_id;
  try {
    await Logger.createDBLog(
      vtex,
      LOG_TYPE,
      `Order notify for ID ${orderId}`,
      { id: orderId },
      orderId
    );
    let eMAGOrder: EmagOrder = body.eMAGOrder;
    if (!eMAGOrder) {
      eMAGOrder = await EMAG.getOrder(vtex, orderId);
    }
    if (!eMAGOrder) {
      throw {
        code: "Order not found",
        message: `eMAG order with id ${orderId} not found`,
        data: eMAGOrder,
      };
    }
    if (!eMAGOrder.products?.length) {
      throw {
        code: "Products not found",
        message: `eMAG product list is empty`,
        data: eMAGOrder,
      };
    }

    const appSettings = await getAppSettings(vtex);
    const VTEXOrder = await createVTEXOrder(
      vtex,
      appSettings,
      eMAGOrder,
      orderId
    );
    const VTEXResponse = await VTEX.createOrder(vtex, appSettings, [VTEXOrder]);

    if (!VTEXResponse?.length) {
      throw {
        code: "New order error",
        message: "VTEX order created with error",
        data: VTEXResponse,
      };
    }

    if (VTEXResponse[0].orderId.indexOf(appSettings.affiliateId) !== -1) {
      const acknowledge = await EMAG.sendOrderAcknowledge(vtex, orderId);
      if (!acknowledge || acknowledge.isError) {
        throw {
          code: "eMAG acknowledge error",
          message: "eMAG order acknowledge ended with error",
          data: acknowledge,
        };
      }
      VTEX.authorizeFulfillment(vtex, appSettings, VTEXResponse[0].orderId);
    }

    await Logger.createDBLog(
      vtex,
      LOG_TYPE,
      `Order notify ${orderId} ended successfully`,
      { VTEXOrder, VTEXResponse },
      orderId
    );

    response.body = VTEXResponse;
    response.status = httpStatus.OK;
  } catch (error) {
    await Logger.createDBLog(
      vtex,
      LOG_TYPE,
      `Order notify ${orderId} ended with error`,
      error,
      orderId
    );
    response.body = error;
    response.status = httpStatus.BAD_REQUEST;
  }
}
