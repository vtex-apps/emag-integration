import React, { FC, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useIntl } from "react-intl";
import {
  useDataGridState,
  useDataViewState,
  usePaginationState,
  useSearchState,
  useToolbarState,
  Box,
  Button,
  DataGrid,
  DataView,
  DataViewControls,
  Flex,
  FlexSpacer,
  Grid,
  GridItem,
  IconGear,
  IconX,
  Label,
  Pagination,
  Search,
  Tag,
  Toolbar,
  ToolbarItem,
  ToolbarButton,
} from "@vtex/admin-ui";
import { SortOrder } from "@vtex/admin-ui/dist/components/DataGrid/hooks/useDataGridSort";
import ReactJson from "react-json-view";
import DropdownComponent from "../../components/DropdownComponent";
import { parseDate } from "../../utils/dates";

const ITEMS_PER_PAGE = 50;

const LogsArea: FC = () => {
  const intl = useIntl();
  const view = useDataViewState();
  const pagination = usePaginationState({
    pageSize: ITEMS_PER_PAGE,
  });
  const search = useSearchState();
  const toolbar = useToolbarState();
  const [didMount, setDidMount] = useState<boolean>(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentRow, setCurrentRow] = useState<Log | null>();
  const [installPending, setInstallPending] = useState<boolean>(false);
  const [filter, setFilter] = useState<{
    id: string;
    label: string;
  }>({
    id: "",
    label: intl.formatMessage({
      id: "admin/connector.logs.allTypes",
    }),
  });
  const [sort, setSort] = useState<{
    by?: string;
    order: SortOrder;
  }>({ by: "createdIn", order: "DSC" });

  const LOG_TYPES = [
    {
      id: "",
      label: intl.formatMessage({
        id: "admin/connector.logs.allTypes",
      }),
    },
    {
      id: "mapper",
      label: intl.formatMessage({
        id: "admin/connector.logs.mapper",
      }),
    },
    {
      id: "productNotify",
      label: intl.formatMessage({
        id: "admin/connector.logs.productNotify",
      }),
    },
    {
      id: "orderNotify",
      label: intl.formatMessage({
        id: "admin/connector.logs.orderNotify",
      }),
    },
    {
      id: "orderStatusChange",
      label: intl.formatMessage({
        id: "admin/connector.logs.orderStatusChange",
      }),
    },
    {
      id: "install",
      label: intl.formatMessage({
        id: "admin/connector.logs.install",
      }),
    },
  ];

  useEffect(() => {
    if (!didMount) {
      setDidMount(true);
    }
    if (!logs?.length) {
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
    let url = "/logs?usePagination=true";
    let currentPagination;
    if (pagination.currentPage === 1) {
      currentPagination = `0-${ITEMS_PER_PAGE}`;
    } else {
      currentPagination = `${pagination.range[0] - 1}-${pagination.range[1]}`;
    }
    url += `&pagination=${currentPagination}`;
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
        setLogs(response.data?.results);
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
        if (!logs.length) {
          pagination.paginate({
            type: "setTotal",
            total: 0,
          });
        }
        view.setStatus({
          type: "error",
          message: intl.formatMessage({
            id: "admin/connector.logs.error",
          }),
        });
      });
  };

  const install = () => {
    setInstallPending(true);
    axios("/install")
      .then(() => {
        setTimeout(() => {
          if (pagination.currentPage === 1) {
            fetchData();
          } else {
            pagination.paginate({
              type: "reset",
            });
          }
        }, 3000);
      })
      .finally(() => {
        setInstallPending(false);
      });
  };

  const sortReducer = (
    _: any,
    action: { type: SortOrder; columnId?: string }
  ) => {
    const newState = { by: action.columnId, order: action.type };
    setSort(newState);
    return newState;
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "mapper":
        return "orange";
      case "productNotify":
        return "purple";
      case "orderNotify":
        return "cyan";
      case "orderStatusChange":
        return "teal";
      default:
        return "lightBlue";
    }
  };

  const grid = useDataGridState({
    view,
    columns: [
      {
        id: "createdIn",
        header: intl.formatMessage({
          id: "admin/connector.logs.created",
        }),
        compare: () => 0,
        accessor: (item: Log) => parseDate(item.createdIn),
      },
      {
        id: "msg",
        header: intl.formatMessage({
          id: "admin/connector.logs.message",
        }),
      },
      {
        id: "type",
        header: intl.formatMessage({
          id: "admin/connector.logs.type",
        }),
        accessor: (item: Log) => (
          <Tag
            size="small"
            label={
              LOG_TYPES.find((logType) => logType.id === item.type)?.label ||
              item.type ||
              "N/A"
            }
            palette={getBadgeColor(item.type)}
          />
        ),
      },
    ],
    items: logs,
    length: ITEMS_PER_PAGE,
    sort: {
      reducer: sortReducer,
      initialValue: sort,
    },
    onRowClick: (item: Log) => {
      setCurrentRow(item);
    },
    density: "compact",
  });

  return (
    <Box>
      <Grid
        className="grid"
        columnGap="5"
        csx={{ marginY: 2, marginLeft: 5 }}
        templateColumns={currentRow ? "1fr 1fr" : "1fr"}
      >
        <GridItem style={{ height: "95vh" }}>
          <Label
            csx={{
              fontSettings: "bold",
              fontSize: 30,
              textAlign: "left",
            }}
          >
            {intl.formatMessage({
              id: "admin/navigation.logs",
            })}
          </Label>
          <DataView state={view} csx={{ height: "100%" }}>
            <DataViewControls>
              <Search
                id="search"
                placeholder={intl.formatMessage({
                  id: "admin/connector.logs.searchPlaceholder",
                })}
                state={search}
              />
              <Toolbar state={toolbar} aria-label="Toolbar">
                <ToolbarItem>
                  {() => (
                    <DropdownComponent
                      label="Type"
                      items={LOG_TYPES}
                      initialItem={LOG_TYPES[0]}
                      onChange={(value: { id: string; label: string }) => {
                        setFilter(value);
                      }}
                    />
                  )}
                </ToolbarItem>
                <ToolbarButton
                  variant="secondary"
                  icon={<IconGear />}
                  iconPosition="end"
                  loading={installPending}
                  onClick={install}
                >
                  {intl.formatMessage({
                    id: "admin/connector.logs.install",
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
        {currentRow && (
          <GridItem style={{ height: "95vh", overflowY: "scroll" }}>
            <Flex justify="space-between">
              <Label
                csx={{
                  fontSettings: "bold",
                  fontSize: 30,
                  textAlign: "left",
                }}
              >
                {intl.formatMessage({
                  id: "admin/connector.logs.logData",
                })}
              </Label>
              <Button
                icon={<IconX title="Close" size="small" />}
                aria-label="Close"
                size="small"
                variant="danger-tertiary"
                onClick={() => {
                  setCurrentRow(null);
                }}
              />
            </Flex>
            <Box csx={{ marginY: 3 }}>
              {Object.keys(currentRow.data).length ? (
                <ReactJson src={currentRow.data} name={false} />
              ) : (
                intl.formatMessage({
                  id: "admin/connector.logs.noData",
                })
              )}
            </Box>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
};

export default LogsArea;
