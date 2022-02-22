import { Schema } from "../typings/schema";

export const MappingSchema: Schema = {
  properties: {
    categoryId: {
      title: "VTEX Category ID",
      type: "string",
    },
    mappedCategoryId: {
      title: "eMAG Category ID",
      type: "string",
    },
    specifications: {
      title: "specifications",
      type: "array",
    },
  },
  "v-cache": false,
  "v-indexed": ["categoryId", "mappedCategoryId"],
};

export const LogSchema: Schema = {
  properties: {
    created: {
      type: "string",
    },
    type: {
      type: "string",
    },
    referenceId: {
      type: "string",
    },
    msg: {
      type: "string",
    },
    data: {
      type: "object",
    },
  },
  "v-cache": false,
  "v-indexed": ["created", "type", "referenceId"],
};

export const ProductsSchema: Schema = {
  properties: {
    VTEXProductID: {
      title: "VTEX Product ID",
      type: "integer",
    },
    VTEXSkuID: {
      title: "VTEX SKU ID",
      type: "string",
    },
    VTEXSkuName: {
      title: "VTEX SKU Name",
      type: "string",
    },
    VTEXSkuImage: {
      title: "VTEX SKU Image",
      type: "string",
    },
    VTEXCategoryID: {
      title: "VTEX Category Id",
      type: "string",
    },
    eMAGProductID: {
      title: "eMAG Product Id",
      type: "integer",
    },
    eMAGProductName: {
      title: "eMAG Product Name",
      type: "string",
    },
    eMAGPartNumber: {
      title: "eMAG Part Number",
      type: "string",
    },
    eMAGCategoryID: {
      title: "eMAG Category Id",
      type: "string",
    },
    type: {
      title: "Product Type",
      type: "string",
    },
    syncStatus: {
      title: "Sync Status",
      type: "string",
    },
    errorMessages: {
      type: "array",
    },
  },
  "v-cache": false,
  "v-indexed": [
    "VTEXProductID",
    "VTEXSkuID",
    "VTEXSkuName",
    "eMAGProductID",
    "eMAGProductName",
    "syncStatus",
    "type",
  ],
};
