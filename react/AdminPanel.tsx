import type { FC } from "react";
import React from "react";
import { createSystem, ToastProvider } from "@vtex/admin-ui";

import MainPanel from "./areas/MainPanel";

const [ThemeProvider] = createSystem({
  key: "admin-area",
});
const [SystemProvider] = createSystem({ key: "admin-area" });

const AdminPanel: FC = () => {
  return (
    <SystemProvider>
      <ToastProvider>
        <ThemeProvider> {<MainPanel />} </ThemeProvider>
      </ToastProvider>
    </SystemProvider>
  );
};

export default AdminPanel;
