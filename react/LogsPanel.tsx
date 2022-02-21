import type { FC } from "react";
import React from "react";
import { createSystem } from "@vtex/admin-ui";

import LogsArea from "./areas/LogsArea";

const [ThemeProvider] = createSystem({
  key: "logs-area",
});

const LogsPanel: FC = () => {
  return <ThemeProvider>{<LogsArea />}</ThemeProvider>;
};

export default LogsPanel;
