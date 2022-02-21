export interface Warehouse {
  warehouseId: string;
  warehouseName: string;
  totalQuantity: number;
  reservedQuantity: number;
  hasUnlimitedQuantity: boolean;
}

export interface CartSimulationBody {
  items: [{ id: string; quantity: number; seller: string }];
}

export interface CartSimultationResponse {
  items: [
    {
      quantity: number;
      seller: string;
      price: number;
      listPrice: number;
    }
  ];
  messages: [
    {
      code: string;
      text: string;
      status: string;
      fields: {
        id: string;
      };
    }
  ];
}

export interface SKU {
  Id: number;
  ProductId: number;
  NameComplete: string;
  ComplementName: string;
  ProductName: string;
  ProductDescription: string;
  ProductRefId: string;
  TaxCode: string;
  SkuName: string;
  IsActive: boolean;
  IsTransported: boolean;
  IsInventoried: boolean;
  IsGiftCardRecharge: boolean;
  ImageUrl: string;
  DetailUrl: string;
  CSCIdentification: string;
  BrandId: string;
  BrandName: string;
  IsBrandActive: boolean;
  Dimension: {
    cubicweight: number;
    height: number;
    length: number;
    weight: number;
    width: number;
  };
  RealDimension: {
    realCubicWeight: number;
    realHeight: number;
    realLength: number;
    realWeight: number;
    realWidth: number;
  };
  ManufacturerCode: string;
  IsKit: boolean;
  KitItems: [];
  Services: [];
  Categories: [];
  CategoriesFullPath: [string];
  Attachments: [];
  Collections: [];
  SkuSellers: [
    {
      SellerId: string;
      StockKeepingUnitId: number;
      SellerStockKeepingUnitId: string;
      IsActive: boolean;
      FreightCommissionPercentage: number;
      ProductCommissionPercentage: number;
    }
  ];
  SalesChannels: [number];
  Images: [
    {
      ImageUrl: string;
      ImageName: string;
      FileId: number;
    }
  ];
  Videos: [];
  SkuSpecifications: [];
  ProductSpecifications: [
    {
      FieldId: number;
      FieldName: string;
      FieldValueIds: [];
      FieldValues: [string];
      IsFilter: boolean;
      FieldGroupId: 11;
      FieldGroupName: string;
    }
  ];
  ProductClustersIds: string;
  PositionsInClusters: {};
  ProductClusterNames: {};
  ProductClusterHighlights: {};
  ProductCategoryIds: string;
  IsDirectCategoryActive: boolean;
  ProductGlobalCategoryId: number;
  ProductCategories: {
    [categoryId: string]: string;
  };
  CommercialConditionId: number;
  RewardValue: number;
  AlternateIds: {
    Ean: string;
    RefId: string;
  };
  AlternateIdValues: [string];
  EstimatedDateArrival: string;
  MeasurementUnit: string;
  UnitMultiplier: number;
  InformationSource: string;
  ModalType: string;
  KeyWords: string;
  ReleaseDate: string;
  ProductIsVisible: boolean;
  ShowIfNotAvailable: boolean;
  IsProductActive: boolean;
  ProductFinalScore: number;
}

export interface emagVAT {
  vat_id: number;
  vat_rate: number;
  is_default: number;
}

export interface Specification {
  FieldId: number;
  FieldName: string;
  FieldValues: string[];
}

export interface emagCharacteristic {
  id: number;
  value: string;
}

export interface EmagSavedProduct {
  id: number;
  category_id: number;
  part_number_key: string;
  validation_status: [
    {
      value: number;
      description: string;
      errors: { errors: [] };
    }
  ];
}

export interface EmagSentProduct {
  id: number;
  brand?: string;
  name?: string;
  description?: string;
  images?: { display_type: number; url: string }[];
  status: number;
  vat_id?: number;
  category_id?: string;
  vendor_category_id?: string;
  characteristics?: emagCharacteristic[];
  stock?: {
    value: number;
    warehouse_id: number;
  }[];
  handling_time?: {
    value: number;
    warehouse_id: number;
  }[];
  max_sale_price?: number;
  min_sale_price?: number;
  sale_price?: number;
  recommended_price?: number;
  part_number_key?: string;
  ean?: string[];
}

export interface VtexEmagProduct {
  id?: string;
  VTEXProductID: number;
  VTEXSkuID: string;
  VTEXSkuName?: string;
  VTEXSkuImage?: string | null;
  VTEXCategoryID?: string;
  eMAGProductID?: number;
  eMAGProductName?: string;
  eMAGPartNumber?: string;
  eMAGCategoryID?: string;
  type?: string;
  syncStatus:
    | "IN_SYNC"
    | "VTEX_ERROR"
    | "EMAG_UPLOAD_ERROR"
    | "EMAG_PENDING"
    | "EMAG_VALIDATION_ERROR"
    | "EMAG_SUCCESS";
  errorMessages: string[];
}

export interface EmagCategory {
  id: number;
  parent_id: number;
  family_types: {
    id: string;
    name: string;
    characteristics: {
      characteristic_id: number;
      characteristic_type: number;
      characteristic_family_type_id: number;
      is_foldable: number;
      display_order: number;
    }[];
  }[];
}
