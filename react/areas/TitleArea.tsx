import type { FC } from "react";
import React from "react";
import { GridItem, Label, Box, Divider } from "@vtex/admin-ui";
import { useIntl } from "react-intl";

const TitleArea: FC = () => {
  const intl = useIntl();

  return (
    <GridItem area="title">
      <Box csx={{ marginY: 5 }}>
        <Label
          csx={{
            fontSettings: "bold",
            fontSize: 32,
            textAlign: "left",
          }}
        >
          {intl.formatMessage({ id: "admin/app.title" })}
        </Label>
      </Box>
      <Divider />
    </GridItem>
  );
};

export default TitleArea;
