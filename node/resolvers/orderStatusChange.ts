import { IOContext } from "@vtex/api";
import { EmagOrder, VTEXCreatedOrder } from "../typings/orderNotify";
import Logger from "../helpers/Logger";
import { EMAG } from "../helpers/EMAGFetch";
import { VTEX } from "../helpers/VTEXFetch";

var FormData = require("form-data");

const LOG_TYPE = "orderStatusChange";

export async function orderStatusChangeResolver(
  vtex: IOContext,
  appSettings: AppSettings,
  status: string,
  orderId: string,
  eMAGOrder: EmagOrder,
  VTEXOrder: VTEXCreatedOrder
) {
  try {
    if (status === "invoice") {
      let addedInvoice = false;
      eMAGOrder.status = 4; // Change status to invoiced
      if (VTEXOrder.packageAttachment?.packages?.length) {
        // Check if have a invoiced package
        const invoicePackage = VTEXOrder.packageAttachment.packages.find(
          (item) => item.invoiceUrl
        );
        if (invoicePackage) {
          const invoiceData = {
            name: "Invoice",
            order_id: eMAGOrder.id,
            type: 1,
            url: invoicePackage.invoiceUrl,
          };
          const invoiceResponse = await EMAG.saveInvoiceDocument(vtex, [
            invoiceData,
          ]);
          if (!invoiceResponse || invoiceResponse?.isError) {
            throw {
              code: "Save invoice error",
              data: invoiceResponse,
            };
          }
          await createAndSendAWB(vtex, appSettings, eMAGOrder, VTEXOrder);
          addedInvoice = true;
        }
      }
      if (!addedInvoice) {
        await Logger.createDBLog(
          vtex,
          LOG_TYPE,
          `Invoice not found for order ID ${orderId}`,
          {
            id: orderId,
            status,
            packageAttachment: VTEXOrder.packageAttachment,
          },
          orderId
        );
      }
    } else if (status === "cancel") {
      eMAGOrder.status = 0;
    }

    const eMAGResponse = await EMAG.updateOrder(vtex, [eMAGOrder]);
    if (!eMAGResponse || eMAGResponse?.isError) {
      throw {
        code: "Save status error",
        message: "eMAG order updated with error",
        data: eMAGResponse,
      };
    }
    await Logger.createDBLog(
      vtex,
      LOG_TYPE,
      `Order status change for ID ${orderId} and status ${status} ended successfully`,
      { eMAGOrder, eMAGResponse },
      orderId
    );
  } catch (error) {
    await Logger.createDBLog(
      vtex,
      LOG_TYPE,
      `Order status change for ID ${orderId} and status ${status} ended with error`,
      error,
      orderId
    );
  }
}

async function createAndSendAWB(
  vtex: IOContext,
  appSettings: AppSettings,
  eMAGOrder: EmagOrder,
  VTEXOrder: VTEXCreatedOrder
) {
  const AWB = {
    order_id: eMAGOrder.id,
    sender: {
      name: appSettings.senderName,
      phone1: appSettings.senderPhone,
      locality_id: appSettings.senderLocalityId,
      street: appSettings.senderStreet,
    },
    receiver: {
      name: eMAGOrder.customer.name,
      contact: eMAGOrder.customer.shipping_contact,
      phone1: eMAGOrder.customer.phone_1,
      phone2: eMAGOrder.customer.phone_2,
      legal_entity: eMAGOrder.customer.legal_entity,
      locality_id: eMAGOrder.customer.shipping_locality_id,
      street: eMAGOrder.customer.shipping_street,
    },
    is_oversize: appSettings.oversizedShipping ? 1 : 0,
    envelope_number: 1,
    parcel_number: 1,
    cod: eMAGOrder.payment_mode_id === 1 ? VTEXOrder.value / 100 : 0,
    saturday_delivery: appSettings.saturdayDelivery ? 1 : 0,
    sameday_delivery: appSettings.samedayDelivery ? 1 : 0,
  };
  const eMAGSaveResponse = await EMAG.saveAWB(vtex, AWB);
  const reservationId = eMAGSaveResponse?.results?.reservation_id;
  if (!eMAGSaveResponse || eMAGSaveResponse.isError || !reservationId) {
    throw {
      code: "Save AWB error",
      data: eMAGSaveResponse,
    };
  }
  const emagAWB = await EMAG.readAWB(vtex, reservationId);
  if (!emagAWB) {
    throw {
      code: "Read AWB error",
      data: { emagAWB, eMAGSaveResponse },
    };
  }
  const emagAWBpdf = await EMAG.readAWBpdf(vtex, emagAWB.emag_id);
  if (!emagAWBpdf) {
    throw {
      code: "Read AWB pdf error",
      data: { emagAWB, emagAWBpdf, eMAGSaveResponse },
    };
  }

  const { DocumentId: localAWBid } = await VTEX.insertDocument(
    vtex,
    "AW",
    {
      orderId: String(eMAGOrder.id),
      pdf: "",
    },
    true
  );
  const filename = `AWB-${eMAGOrder.id}.pdf`;
  const awbBuffer = Buffer.from(emagAWBpdf);
  const form = new FormData();
  form.append("pdf", awbBuffer, {
    contentType: "application/pdf",
    filename,
    knownLength: awbBuffer.byteLength,
  });

  await VTEX.saveAttachment(vtex, "AW", localAWBid, "pdf", form);
  const trackingUrl = getAttachmentUrl(vtex, "AW", localAWBid, "pdf", filename);

  const invoicePackage = VTEXOrder.packageAttachment.packages.find(
    (item) => item.invoiceUrl
  );
  const vtexTracking = {
    trackingNumber: emagAWB.awb[0]?.awb_number,
    trackingUrl,
    dispatchedDate: null,
    courier: emagAWB.courier.courier_name,
  };
  const vtexAWB = await VTEX.saveTrackingNumber(
    vtex,
    VTEXOrder.orderId,
    invoicePackage?.invoiceNumber,
    vtexTracking
  );
  await Logger.createDBLog(
    vtex,
    LOG_TYPE,
    `AWB created successfully for order ${eMAGOrder.id}`,
    { reservationId, emagAWB, vtexAWB, sentAWB: AWB },
    String(eMAGOrder.id)
  );
}

function getAttachmentUrl(
  ctx: IOContext,
  entity: string,
  id: string,
  field: string,
  filename: string
) {
  return `https://${ctx.account}.vtexcommercestable.com.br/api/dataentities/${entity}/documents/${id}/${field}/attachments/${filename}`;
}
