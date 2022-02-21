import React, { FC } from "react";
import { useIntl } from "react-intl";
import {
  Anchor,
  Box,
  Button,
  Divider,
  Flex,
  GridItem,
  IconArrowUpRight,
  IconX,
  Label,
  Text,
} from "@vtex/admin-ui";
import ReactJson from "react-json-view";

interface StatusDetailsProps {
  data: VtexEmagProduct;
  clearData: () => void;
}

const StatusDetails: FC<StatusDetailsProps> = ({ data, clearData }) => {
  const intl = useIntl();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EMAG_SUCCESS":
        return "positive";
      case "VTEX_ERROR":
      case "EMAG_UPLOAD_ERROR":
      case "EMAG_VALIDATION_ERROR":
        return "critical";
      case "EMAG_PENDING":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <GridItem
      csx={{
        height: "97vh",
        overflowY: "scroll",
      }}
    >
      <Box
        csx={{
          marginY: 40,
          marginRight: 5,
        }}
      >
        <Flex justify="space-between">
          <Label
            csx={{
              fontSize: 25,
              textAlign: "left",
            }}
          >
            {intl.formatMessage({
              id: "admin/connector.statusDetails.title",
            })}
            :{" "}
            <Text tone="info" csx={{ fontSize: 25 }}>
              {data.eMAGProductName}
            </Text>
          </Label>
          <Button
            icon={<IconX title="Close" size="small" />}
            aria-label="Close"
            size="small"
            variant="danger-tertiary"
            onClick={clearData}
          />
        </Flex>
        <Box csx={{ marginY: 8 }}>
          <Box>
            <Text csx={{ fontSize: 18 }}>
              {intl.formatMessage({
                id: "admin/connector.statusDetails.status",
              })}
              :
            </Text>{" "}
            <Text csx={{ fontSize: 18 }} tone={getStatusColor(data.syncStatus)}>
              {data.syncStatus}
            </Text>
            <Divider csx={{ marginY: 3 }} />
          </Box>
          <Box>
            <Text as="p" csx={{ fontSize: 18 }}>
              {intl.formatMessage({
                id: "admin/connector.statusDetails.vtexCategory",
              })}
              : {data.VTEXCategoryID || "N/A"}
            </Text>
            <Text as="p" csx={{ fontSize: 18 }}>
              {intl.formatMessage({
                id: "admin/connector.statusDetails.emagCategory",
              })}
              : {data.eMAGCategoryID || "N/A"}
            </Text>
            <Divider csx={{ marginY: 3 }} />
          </Box>
          {data.VTEXSkuID && (
            <Box>
              <Text csx={{ fontSize: 18 }}>
                {intl.formatMessage({
                  id: "admin/connector.statusDetails.vtexUrl",
                })}
                :
              </Text>{" "}
              <Anchor
                csx={{ fontSize: 18 }}
                href={`${window.location.origin}/admin/Site/SkuForm.aspx?IdSku=${data.VTEXSkuID}`}
                target="_blank"
              >
                link
                <IconArrowUpRight size="small" />
              </Anchor>
            </Box>
          )}
          {data.eMAGPartNumber && (
            <Box csx={{ marginY: 1 }}>
              <Text csx={{ fontSize: 18 }}>
                {intl.formatMessage({
                  id: "admin/connector.statusDetails.emagUrl",
                })}
                :
              </Text>{" "}
              <Anchor
                csx={{ fontSize: 18 }}
                href={`https://www.emag.ro/preview/pd/${data.eMAGPartNumber}`}
                target="_blank"
              >
                link
                <IconArrowUpRight size="small" />
              </Anchor>
            </Box>
          )}
          {(data.VTEXSkuID || data.eMAGPartNumber) && (
            <Divider csx={{ marginY: 3 }} />
          )}
          {data.errorMessages?.length ? (
            <>
              <Text csx={{ fontSize: 18, marginY: 2 }}>
                {intl.formatMessage({
                  id: "admin/connector.statusDetails.errorData",
                })}
                :
              </Text>
              <ReactJson src={data.errorMessages} name={false} />
            </>
          ) : null}
        </Box>
      </Box>
    </GridItem>
  );
};

export default StatusDetails;
