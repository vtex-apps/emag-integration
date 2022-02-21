import React, { FC, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useIntl } from "react-intl";
import {
  useDataViewState,
  useDataGridState,
  usePaginationState,
  useSearchState,
  useToolbarState,
  Box,
  DataView,
  DataViewControls,
  DataGrid,
  Flex,
  IconArrowCounterClockwise,
  IconCheckCircle,
  IconClock,
  IconQuestion,
  IconXCircle,
  FlexSpacer,
  Grid,
  GridItem,
  Pagination,
  Search,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarItem,
} from "@vtex/admin-ui";
import { SortOrder } from "@vtex/admin-ui/dist/components/DataGrid/hooks/useDataGridSort";
import StatusDetails from "./StatusDetails";
import DropdownComponent from "../../components/DropdownComponent";
import { parseDate } from "../../utils/dates";

const ITEMS_PER_PAGE = 50;

const ProductStatusArea: FC = () => {
  const intl = useIntl();
  const view = useDataViewState();
  const pagination = usePaginationState({
    pageSize: ITEMS_PER_PAGE,
  });
  const search = useSearchState();
  const toolbar = useToolbarState();
  const [didMount, setDidMount] = useState<boolean>(false);
  const [products, setProducts] = useState<VtexEmagProduct[]>([]);
  const [currentData, setCurrentData] = useState<VtexEmagProduct | null>();
  const [syncPending, setSyncPending] = useState<boolean>(false);
  const [filter, setFilter] = useState<{
    id: string;
    label: string;
  }>({
    id: "",
    label: intl.formatMessage({
      id: "admin/connector.productStatus.allProducts",
    }),
  });
  const [sort, setSort] = useState<{
    by?: string;
    order: SortOrder;
  }>({ by: "updatedIn", order: "DSC" });

  const STATUS_TYPES = [
    {
      id: "",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.allProducts",
      }),
    },
    {
      id: "IN_SYNC",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.IN_SYNC",
      }),
    },
    {
      id: "VTEX_ERROR",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.VTEX_ERROR",
      }),
    },
    {
      id: "EMAG_UPLOAD_ERROR",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.EMAG_UPLOAD_ERROR",
      }),
    },
    {
      id: "EMAG_PENDING",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.EMAG_PENDING",
      }),
    },
    {
      id: "EMAG_VALIDATION_ERROR",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.EMAG_VALIDATION_ERROR",
      }),
    },
    {
      id: "EMAG_SUCCESS",
      label: intl.formatMessage({
        id: "admin/connector.productStatus.EMAG_SUCCESS",
      }),
    },
  ];

  useEffect(() => {
    if (!didMount) {
      setDidMount(true);
    }
    if (!products?.length) {
      view.setStatus({
        type: "loading",
      });
    }
    fetchData();
  }, [pagination.currentPage]);

  useEffect(() => {
    if (!didMount) {
      return;
    }
    if (pagination.currentPage === 1) {
      fetchData();
    } else {
      pagination.paginate({
        type: "reset",
      });
    }
  }, [filter.id, search.debouncedValue, sort.order, sort.by]);

  const fetchData = () => {
    let url = "/vtex/product-notify";
    let currentPagination;
    if (pagination.currentPage === 1) {
      currentPagination = `0-${ITEMS_PER_PAGE}`;
    } else {
      currentPagination = `${pagination.range[0] - 1}-${pagination.range[1]}`;
    }
    url += `?pagination=${currentPagination}`;
    if (search.debouncedValue) {
      url += `&search=${search.debouncedValue}`;
    }
    if (filter.id) {
      url += `&filter=${filter.id}`;
    }
    if (sort.by) {
      url += `&sort=${sort.by} ${sort.order === "ASC" ? "ASC" : "DESC"}`;
    }
    axios(url)
      .then((response: AxiosResponse) => {
        setProducts(response.data?.results);
        if (pagination.total !== response.data?.totalRecordCount) {
          pagination.paginate({
            type: "setTotal",
            total: response.data?.totalRecordCount,
          });
        }
        view.setStatus({
          type: "ready",
        });
      })
      .catch((error: any) => {
        console.log(error);
        if (!products.length) {
          pagination.paginate({
            type: "setTotal",
            total: 0,
          });
        }
        view.setStatus({
          type: "error",
          message: intl.formatMessage({
            id: "admin/connector.productStatus.error",
          }),
        });
      });
  };

  const syncProducts = () => {
    setSyncPending(true);
    axios("/emag/sync-products")
      .then((response: AxiosResponse) => {
        if (
          response?.data?.updatedProducts?.length ||
          Object.keys(response?.data?.duplicatedProducts).length
        ) {
          if (pagination.currentPage === 1) {
            fetchData();
          } else {
            pagination.paginate({
              type: "reset",
            });
          }
        }
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
        setSyncPending(false);
      });
  };

  const onRowClick = (item: VtexEmagProduct) => {
    setCurrentData(item);
  };

  const sortReducer = (
    _: any,
    action: { type: SortOrder; columnId?: string }
  ) => {
    const newState = { by: action.columnId, order: action.type };
    setSort(newState);
    return newState;
  };

  const grid = useDataGridState({
    view,
    columns: [
      {
        id: "VTEXSkuImage",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.VTEXSkuImage",
        }),
        resolver: {
          type: "image",
          preview: {
            display: true,
            size: "regular",
            delay: 0,
          },
        },
      },
      {
        id: "createdIn",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.createdIn",
        }),
        compare: () => 0,
        accessor: (item: VtexEmagProduct) => parseDate(item.createdIn),
      },
      {
        id: "updatedIn",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.updatedIn",
        }),
        compare: () => 0,
        accessor: (item: VtexEmagProduct) => parseDate(item.updatedIn),
      },
      {
        id: "VTEXProductID",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.VTEXProductID",
        }),
        accessor: (item: VtexEmagProduct) => item.VTEXProductID || "N/A",
      },
      {
        id: "VTEXSkuID",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.VTEXSkuID",
        }),
        accessor: (item: VtexEmagProduct) => item.VTEXSkuID || "N/A",
      },
      {
        id: "VTEXSkuName",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.VTEXSkuName",
        }),
        accessor: (item: VtexEmagProduct) => item.VTEXSkuName || "N/A",
      },
      {
        id: "eMAGProductName",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.eMAGProductName",
        }),
        accessor: (item: VtexEmagProduct) => item.eMAGProductName || "N/A",
      },
      {
        id: "eMAGPartNumber",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.eMAGPartNumber",
        }),
        accessor: (item: VtexEmagProduct) => item.eMAGPartNumber || "N/A",
      },
      {
        id: "type",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.productType",
        }),
        accessor: (item: VtexEmagProduct) => {
          if (!item.type) {
            return "N/A";
          }
          const message =
            item.type === "OFFER"
              ? intl.formatMessage({
                  id: "admin/connector.productStatus.offer",
                })
              : intl.formatMessage({
                  id: "admin/connector.productStatus.product",
                });
          return message;
        },
      },
      {
        id: "syncStatus",
        header: intl.formatMessage({
          id: "admin/connector.productStatus.syncStatus",
        }),
        accessor: (item: VtexEmagProduct) => (
          <Flex align="center">
            {getStatusIcon(item.syncStatus)}
            <Text csx={{ marginX: 3 }}>
              {STATUS_TYPES.find(
                (statusType) => statusType.id === item.syncStatus
              )?.label ||
                item.syncStatus ||
                "N/A"}
            </Text>
          </Flex>
        ),
      },
    ],
    items: products,
    length: ITEMS_PER_PAGE,
    sort: {
      reducer: sortReducer,
      initialValue: sort,
    },
    onRowClick: onRowClick,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EMAG_SUCCESS":
        return (
          <Text tone="positive">
            <IconCheckCircle csx={{ color: "green" }} weight="bold" />
          </Text>
        );
      case "VTEX_ERROR":
      case "EMAG_UPLOAD_ERROR":
      case "EMAG_VALIDATION_ERROR":
        return (
          <Text tone="critical">
            <IconXCircle weight="bold" />
          </Text>
        );
      case "EMAG_PENDING":
        return (
          <Text tone="warning">
            <IconClock weight="bold" />
          </Text>
        );
      default:
        return (
          <Text tone="info">
            <IconQuestion weight="bold" />
          </Text>
        );
    }
  };

  return (
    <Box csx={{ padding: 2 }}>
      <Grid
        className="grid"
        columnGap="5"
        templateColumns={currentData ? "3fr 2fr" : "1fr"}
      >
        <GridItem csx={{ height: "97vh" }}>
          <DataView state={view} csx={{ height: "100%" }}>
            <DataViewControls>
              <Search
                id="search"
                placeholder={intl.formatMessage({
                  id: "admin/connector.productStatus.searchPlaceholder",
                })}
                state={search}
              />
              <Toolbar state={toolbar} aria-label="Toolbar">
                <ToolbarItem>
                  {() => (
                    <DropdownComponent
                      label="Status"
                      items={STATUS_TYPES}
                      initialItem={STATUS_TYPES[0]}
                      onChange={(value: { id: string; label: string }) => {
                        setFilter(value);
                      }}
                    />
                  )}
                </ToolbarItem>
                <ToolbarButton
                  variant="secondary"
                  icon={<IconArrowCounterClockwise />}
                  iconPosition="end"
                  loading={syncPending}
                  onClick={syncProducts}
                >
                  {intl.formatMessage({
                    id: "admin/connector.productStatus.sync",
                  })}
                </ToolbarButton>
              </Toolbar>
              <FlexSpacer />
              <Pagination
                state={pagination}
                preposition="of"
                subject="results"
                prevLabel="Previous"
                nextLabel="Next"
                csx={{ marginX: 2 }}
              />
            </DataViewControls>
            <DataGrid state={grid} />
          </DataView>
        </GridItem>
        {currentData && (
          <StatusDetails
            data={currentData}
            clearData={() => setCurrentData(null)}
          />
        )}
      </Grid>
    </Box>
  );
};

export default ProductStatusArea;
