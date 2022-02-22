import type { FC } from "react";
import React from "react";
import { createSystem } from "@vtex/admin-ui";

import ProductStatusArea from "./areas/ProductStatusArea";

const [ThemeProvider] = createSystem({
  key: "product-status-area",
});

const ProductStatusPanel: FC = () => {
  return <ThemeProvider>{<ProductStatusArea />}</ThemeProvider>;
};

export default ProductStatusPanel;
