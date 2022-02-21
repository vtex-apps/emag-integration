export interface Schema {
  properties: { [label: string]: { title?: string; type: string } };
  "v-cache": boolean;
  "v-indexed"?: string[];
}

export interface Index {
  name: string;
  multiple: boolean;
  fields: string;
}

export interface Mapping {
  id: string;
  categoryId: string;
  mappedCategoryId: string;
  specifications: {
    specificationName: string;
    specificationId: string;
    mappedSpecificationName: string;
    specificationValues: [
      {
        specificationValue: string;
        mappedSpecificationValue: string;
      }
    ];
  }[];
}
