export interface EmagOrder {
  vendor_name: string;
  id: number;
  type: number;
  parent_id: null;
  date: string;
  payment_mode: string;
  detailed_payment_method: string;
  payment_mode_id: number;
  delivery_mode: string;
  observation: null;
  status: number;
  payment_status: number;
  customer: {
    id: number;
    mkt_id: number;
    name: string;
    company: string;
    gender: string;
    phone_1: string;
    phone_2: string;
    phone_3: string;
    registration_number: string;
    code: string;
    email: string;
    billing_name: string;
    billing_phone: string;
    billing_country: string;
    billing_suburb: string;
    billing_city: string;
    billing_locality_id: number;
    billing_street: string;
    billing_postal_code: string;
    shipping_country: string;
    shipping_suburb: string;
    shipping_city: string;
    shipping_locality_id: number;
    shipping_postal_code: string;
    shipping_contact: string;
    shipping_phone: string;
    created: string;
    modified: string;
    bank: string;
    iban: string;
    legal_entity: number;
    fax: null;
    is_vat_payer: number;
    liable_person: string;
    shipping_street: string;
  };
  products: EmagOrderProduct[];
  shipping_tax: number;
  attachments: [
    {
      name: string;
      url: string;
      visibility: string;
      type: number;
      force_download: string;
    }
  ];
  cashed_co: null;
  cashed_cod: number;
  cancellation_request: null;
  has_editable_products: number;
  refunded_amount: string;
  is_complete: number;
  refund_status: null;
  maximum_date_for_shipment: string;
  late_shipment: number;
  emag_club: number;
  finalization_date: string;
  weekend_delivery: number;
}

export interface EmagOrderProduct {
  ext_part_number: string;
  part_number_key: string;
  retained_amount: number;
  sale_price: string;
  created: string;
  modified: string;
  original_price: string;
  id: number;
  product_id: number;
  part_number: string;
  currency: string;
  mkt_id: number;
  name: string;
  quantity: number;
  vat: string;
  status: number;
  initial_qty: number;
  storno_qty: number;
  reversible_vat_charging: number;
}

export interface OrderSimulationBody {
  items: {
    id: string;
    quantity: number;
    seller: string;
  }[];
  postalCode: string;
  country: string;
}

export interface OrderSimulationResponse {
  itemIndex: number;
  stockBalance: number;
  quantity: number;
  shipsTo: string[];
  slas: [
    {
      id: string;
      deliveryChannel: string;
      name: string;
      deliveryIds: [
        {
          courierId: string;
          warehouseId: string;
          dockId: string;
          courierName: string;
          quantity: number;
          accountCarrierName: string;
        }
      ];
      shippingEstimate: string;
      dockEstimate: string;
      availableDeliveryWindows: {
        startDateUtc: string;
        endDateUtc: string;
        price: 0;
      }[];
      price: number;
      pickupStoreInfo: {
        isPickupStore: false;
      };
      polygonName: string;
      transitTime: string;
    }
  ];
  deliveryChannels: [
    {
      id: string;
      stockBalance: number;
    }
  ];
}

export interface VTEXOrderProduct {
  attachments: [];
  bundleItems: [];
  commission: number;
  freightCommission: number;
  id: string;
  isGift: boolean;
  itemAttachment: {
    content: {};
    name: null;
  };
  measurementUnit: null;
  price: number;
  quantity: number;
  seller: string;
  unitMultiplier: number;
}

export interface VTEXCreatedOrder {
  origin: string;
  affiliateId: string;
  salesChannel: string;
  orderId: string;
  packageAttachment: {
    packages: {
      invoiceUrl: string;
      invoiceNumber: string;
      invoiceValue: number;
    }[];
  };
  value: number;
}
