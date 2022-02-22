export interface EmagInvoice {
  name: string;
  order_id: number;
  type: number;
  url: string;
}

export interface EmagAWBBody {
  order_id: number;
  sender: {
    name: string;
    phone1: string;
    locality_id?: number;
    street: string;
  };
  receiver: {
    name: string;
    contact: string;
    phone1: string;
    phone2: string;
    legal_entity: number;
    locality_id: number;
    street: string;
  };
  is_oversize: number;
  envelope_number: number;
  parcel_number: number;
  cod: number;
  saturday_delivery: number;
  sameday_delivery: number;
}

export interface EmagAWB {
  emag_id: number;
  order_id: number;
  awb: [
    {
      emag_id: number;
      awb_number: string;
      awb_barcode: string;
    }
  ];
  courier: {
    courier_account_id: number;
    courier_id: number;
    courier_name: string;
  };
}

export interface VTEXTrackingBody {
  trackingNumber: string;
  trackingUrl: null;
  dispatchedDate: null;
  courier: string;
}

export interface VTEXTrackingResponse {
  date: date;
  orderId: string;
  receipt: string;
}
