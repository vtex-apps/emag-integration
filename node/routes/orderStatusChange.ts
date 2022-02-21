import httpStatus from "http-status-codes";
import { json } from "co-body";

import Logger from "../helpers/Logger";
import { VTEX } from "../helpers/VTEXFetch";
import { getAppSettings } from "../helpers/ConnectorHelper";
import { EMAG } from "../helpers/EMAGFetch";
import { EmagOrder } from "../typings/orderNotify";
import { orderStatusChangeResolver } from "../resolvers/orderStatusChange";

const LOG_TYPE = "orderStatusChange";

export async function orderStatusChange(ctx: Context) {
  const { vtex, req, response } = ctx;
  const body = await json(req);
  if (body.hookConfig === "ping") {
    response.body = { success: true };
    response.status = httpStatus.OK;
    return;
  }

  const VTEXOrderId = body.OrderId;
  const orderId = VTEXOrderId.split("-")[1];
  const status = body.State;

  const appSettings = await getAppSettings(vtex);
  const VTEXOrder = await VTEX.getOrder(vtex, VTEXOrderId);
  if (
    VTEXOrder.origin !== "Fulfillment" ||
    VTEXOrder.affiliateId !== appSettings.affiliateId ||
    VTEXOrder.salesChannel !== appSettings.tradePolicyId
  ) {
    response.body = { success: true };
    response.status = httpStatus.OK;
    return;
  }

  await Logger.createDBLog(
    vtex,
    LOG_TYPE,
    `Order status change for ID ${orderId}. New status is ${status}`,
    { id: orderId, status, VTEXOrderId },
    orderId
  );

  let eMAGOrder: EmagOrder = body.eMAGOrder;
  if (!eMAGOrder) {
    eMAGOrder = await EMAG.getOrder(vtex, orderId);
  }

  if (!eMAGOrder) {
    await Logger.createDBLog(
      vtex,
      LOG_TYPE,
      `Order status change for ID ${orderId} and status ${status} ended with error`,
      {
        code: "Order not found",
        message: `eMAG order with id ${orderId} not found`,
        data: eMAGOrder,
      },
      orderId
    );
  }
  orderStatusChangeResolver(
    vtex,
    appSettings,
    status,
    orderId,
    eMAGOrder,
    VTEXOrder
  );

  response.body = { success: true };
  response.status = httpStatus.OK;
}
