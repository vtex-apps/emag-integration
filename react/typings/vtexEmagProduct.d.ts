interface VtexEmagProduct {
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
  syncStatus:
    | "IN_SYNC"
    | "VTEX_ERROR"
    | "EMAG_UPLOAD_ERROR"
    | "EMAG_PENDING"
    | "EMAG_VALIDATION_ERROR"
    | "EMAG_SUCCESS";
  type: "PRODUCT" | "OFFER";
  errorMessages: string[];
  createdIn: string;
  updatedIn: string;
}
