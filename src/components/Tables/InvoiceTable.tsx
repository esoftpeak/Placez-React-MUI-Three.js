import React, {
  useState,
  useEffect,
  useRef,
  cloneElement,
  ReactElement,
  CSSProperties,
  ReactNode,
  useCallback,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SxProps,
  Tooltip,
  useTheme,
} from '@mui/material';

import { makeStyles } from '@mui/styles';

import { Theme } from '@mui/material';

// Components
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';

import {
  Grid,
  GridColumn,
  GridItemChangeEvent,
  GridCellProps,
  GridRowProps,
  GridToolbar,
} from '@progress/kendo-react-grid';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { BillingRate, Utils } from '../../blue/core/utils';
import {
  PlacezFixturePlan,
  PlacezLayoutPlan,
  Scene,
  placezApi,
} from '../../api';
import { InvoiceLineItem } from '../Invoicing/InvoiceLineItemModel';
import { ReduxState } from '../../reducers';
import { MyCommandCell } from './InlineEditableGrid/myCommandCell';
import {
  KeyRows,
  buildSceneLineItems,
  calcTotal,
} from '../../utils/InvoiceUtils';
import { computeSceneDuration } from '../../utils/SceneUtils';
import { formatNumber } from '../../utils/formatNumber';
import { invoiceTableStyle } from './invoiceTableStyle';
import { CustomSwitch } from '../common/switch';
import PlacezIconButton from '../PlacezUIComponents/PlacezIconButton';
import LineItemInput from '../Modals/EditInvoiceModal/LineItemInput';
import {
  DeleteOutlined,
  FavoriteBorder,
  Favorite,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

const MyRateCell = (props) => {
  if (props.dataItem.isHeader || props.dataItem.isTotalField)
    return <td {...props.tdProps} />;

  const { priceRateInHours } = props.dataItem;
  const { dataItem } = props;

  const rate = BillingRate[priceRateInHours];
  return (
    <td style={{ pointerEvents: 'auto' }} title={dataItem.inEdit ? '' : rate}>
      {dataItem.inEdit ? (
        <Select
          id="placeSelect"
          value={BillingRate[rate]}
          style={{
            width: '100px',
          }}
          onChange={props.onSetRate(dataItem)}
        >
          {Object.values(BillingRate)
            .filter((v) => isNaN(Number(v)))
            .map((rate) => (
              <MenuItem value={BillingRate[rate]}>{rate}</MenuItem>
            ))}
        </Select>
      ) : (
        rate || '-'
      )}
    </td>
  );
};

const MyTaxRateCell = (props: any) => {
  if (props.dataItem.isHeader || props.dataItem.isTotalField)
    return <td {...props.tdProps} />;

  const { taxRate, layoutId } = props.dataItem;
  const {
    dataItem,
    onDeleteLineItem,
    customfavoriteLineItems,
    invisibleItems,
    setInvisibleItems,
  } = props;

  const [isFavorite, setIsFavorite] = useState(false);

  const [isInvisible, setIsInvisible] = useState(!!invisibleItems[dataItem.id]);

  useEffect(() => {
    setIsInvisible(!!invisibleItems[dataItem.id]);
  }, [invisibleItems, dataItem.id]);

  const toggleVisibility = () => {
    const newVisibility = !isInvisible;
    setIsInvisible(newVisibility);
    setInvisibleItems((prev) => ({
      ...prev,
      [dataItem.id]: newVisibility,
    }));
  };

  useEffect(() => {
    if (!customfavoriteLineItems || !dataItem?.description) return;

    const isFav = customfavoriteLineItems.some(
      (item) =>
        item.description === dataItem.description &&
        item.notes === dataItem.notes
    );

    setIsFavorite(isFav);
  }, [customfavoriteLineItems, dataItem]);

  const taxPercentage = Math.round((taxRate ?? 0) * 100);
  const formattedTax = Number.isInteger(taxPercentage)
    ? taxPercentage.toFixed(0)
    : taxPercentage.toFixed(2);

  const showActions = !layoutId;
  return (
    <td
      style={{
        pointerEvents: 'auto',
        minWidth: '160px',
        padding: '0 8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '100px',
        }}
      >
        <span style={{ minWidth: '20px' }}>{taxRate ? formattedTax : '-'}</span>
        {/* Hide buttons for now */}
        {false && (
          <div style={{ display: 'flex', gap: '2px' }}>
            <Tooltip title="Visibility">
              <IconButton
                aria-label="Visibility"
                color="primary"
                sx={{ p: '2px' }}
                onClick={toggleVisibility}
              >
                {!isInvisible ? (
                  <VisibilityOff fontSize="small" sx={{ color: 'gray' }} />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {isFavorite ? (
              <Tooltip title="Unfavorite">
                <IconButton
                  aria-label="Unfavorite"
                  color="primary"
                  onClick={async () => {
                    const item = customfavoriteLineItems.find(
                      (item) =>
                        item.description === dataItem.description &&
                        item.notes === dataItem.notes
                    );

                    await placezApi.deleteFavoriteInvoiceLineItem(item);
                    setIsFavorite(false);
                    props.refreshFavorites?.();
                  }}
                  sx={{ p: '2px' }}
                >
                  <Favorite fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Favorite">
                <IconButton
                  aria-label="Favorite"
                  color="primary"
                  onClick={async () => {
                    await placezApi.createFavoriteInvoiceLineItem(dataItem);
                    setIsFavorite(true);
                  }}
                  sx={{ p: '2px' }}
                >
                  <FavoriteBorder fontSize="small" sx={{ color: 'gray' }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Delete">
              <IconButton
                aria-label="Delete"
                color="primary"
                onClick={() => onDeleteLineItem(dataItem)}
                sx={{ p: '2px' }}
              >
                <DeleteOutlined fontSize="small" sx={{ color: 'gray' }} />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    </td>
  );
};

export const rollUpPrice = (invoiceLineItems: InvoiceLineItem[]): number => {
  const totalPrice = invoiceLineItems.reduce(
    (sum, item) => (item.total !== undefined ? sum + item.total : sum),
    0
  );
  return cleanUpDecimal(totalPrice);
};
const cleanUpDecimal = (number): number => {
  return parseFloat(number.toFixed(2));
};

interface Props {
  layouts?: PlacezLayoutPlan[];
  floorPlans: PlacezFixturePlan[];
  scene: Scene;
  editable?: boolean;
  editMode?: boolean;
  onExportPDF?: (cb) => void;
  onExportExcel?: (cb) => void;
  onRowSelect?: (lineItem: InvoiceLineItem) => void;
  selectedId?: number;
  sx?: SxProps<Theme>;
  handleToggleIncludeInInvoice?: (layoutId: string) => void;
  disableActionButtons?: boolean;
}

const InvoiceTable = (props: Props) => {
  const { layouts, sx } = props;

  const theme: Theme = useTheme();
  const [isShowHideList, setIsShowHideList] = useState(false);
  const [invisibleItems, setInvisibleItems] = useState<Record<string, boolean>>(
    {}
  );
  const [changed, setChanged] = useState(false);
  const [customfavoriteLineItems, setCustomFavoriteLineItems] = useState();
  const [hoveredRow, setHoveredRow] = useState<InvoiceLineItem | undefined>();
  const [selectedLineItem, setSelectedLineItem] = useState<
    InvoiceLineItem | undefined
  >();
  const [idList, setIdList] = useState<string[]>([]);
  const styles = makeStyles<Theme>(invoiceTableStyle);
  const editMode = props.editMode;
  const classes = styles(props);
  const grid = useRef();

  const fetchFavoriteLineItems = async () => {
    try {
      const response = await placezApi.getFavoriteInvoiceLineItems();
      setCustomFavoriteLineItems(response.parsedBody);
    } catch (error) {
      console.error('Failed to fetch favorite invoice line items:', error);
    }
  };

  useEffect(() => {
    fetchFavoriteLineItems();
  }, []);

  const handleDeleteLineItem = async (item: InvoiceLineItem) => {
    try {
      if (!item?.id) return;
      await placezApi.deleteCustomInvoiceLineItem(item);
      await updateLineItems(); // refresh table data
    } catch (error) {
      console.error('Failed to delete line item', error);
    }
  };

  const rowRender = (
    trElement: ReactElement<HTMLTableRowElement>,
    props: GridRowProps
  ) => {
    if (invisibleItems[props.dataItem.id] === true && !editMode) {
      return null; // Do not render anything for this row
    }

    const backgroundColor = (() => {
      if (!props.dataItem.hideInInvoice) {
        return `${theme.palette.primary.main}33`;
      }
      if (theme.palette.mode === 'light') {
        return `${theme.palette.secondary.main}`;
      }
      return `${theme.palette.secondary.main}50`;
    })();

    const themeStyle = {
      backgroundColor,
      fontSize: '16px',
      whiteSpace: 'nowrap',
      overflow: 'auto !important',
    };

    const assetStyle = {
      // fontWeight: 'bold',
    };
    const customStyle = {
      // fontWeight: 'bold',
    };
    const totalStyle = {
      // backgroundColor: `${theme.palette.primary.main}33`,
      fontWeight: 'bold',
      fontSize: '20px',
      whiteSpace: 'nowrap',
    };

    let rowStyle = {};
    if (props.dataItem.description) {
      if (props.dataItem.style === 'subEventHeader') {
        rowStyle = themeStyle;
      }
      if (props.dataItem.description.search(KeyRows.Assets) !== -1) {
        rowStyle = assetStyle;
      }
      if (props.dataItem.description.search(KeyRows.CustomLineItems) !== -1) {
        rowStyle = customStyle;
      }
      if (props.dataItem.description.search(KeyRows.Total) !== -1) {
        rowStyle = totalStyle;
      }
    }

    const isSelectedRow =
      selectedLineItem && props.dataItem.id === selectedLineItem.id;
    const finalRowStyle = isSelectedRow
      ? { ...rowStyle, backgroundColor: theme.palette.primary.main + '1A' }
      : rowStyle;

    const trProps: any = { style: finalRowStyle };
    const eventHeaderClassName =
      props.dataItem.style === 'subEventHeader' ? 'subEventHeader-row' : '';
    // Set overflow style on all children
    const childrenWithOverflow = React.Children.map(
      trElement.props.children,
      (child) => {
        if (React.isValidElement(child)) {
          // Type assertion to ReactElement
          const typedChild = child as ReactElement<{ style?: CSSProperties }>;
          let style = {};

          if (props.dataItem.style === 'subEventHeader') {
            style = {
              ...typedChild.props?.style,
              height: '15px',
              overflow: 'visible',
            };
          } else {
            style = {
              ...typedChild.props?.style,
              height: '56px',
              overflow: 'hidden',
            };
          }
          return cloneElement(typedChild, {
            style,
          });
        }
        return child;
      }
    );

    const childElement = cloneElement(
      trElement,
      {
        ...trProps,
        className:
          `${trElement.props.className || ''} ${eventHeaderClassName}`.trim(),
      },
      childrenWithOverflow as ReactNode
    );

    const isVisibleTopRow =
      (props.dataItem.style === 'subEventHeader' &&
        props.absoluteRowIndex !== 0) ||
      props.dataItem.isTotalField;
    const isVisibleBottomRow =
      props.dataItem.style === 'subEventHeader' &&
      !props.dataItem.hideInInvoice;

    const trStyle = {
      height: '15px',
      color: 'inherit',
    };

    return (
      <>
        {isVisibleTopRow && (
          <tr style={trStyle} className="subEventHeader-row" />
        )}
        {childElement}
        {isVisibleBottomRow && (
          <tr style={trStyle} className="subEventHeader-row" />
        )}
      </>
    );
  };

  const CommandCell = (props: GridCellProps) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={remove}
      add={add}
      discard={discard}
      update={update}
      cancel={cancel}
      editField={editField}
    />
  );

  const onSetRate =
    (dataItem: InvoiceLineItem) =>
    (event: React.ChangeEvent<{ value: number }>) => {
      const newData = data.map((item) =>
        item.id === dataItem.id
          ? { ...item, priceRateInHours: event.target.value, inEdit: true }
          : item
      );

      setData(newData);
    };

  const RateCell = (props: GridCellProps) => (
    <MyRateCell {...props} onSetRate={onSetRate} />
  );

  const TaxRateCell = (
    props: GridCellProps & {
      onDeleteLineItem: (item: InvoiceLineItem) => void;
      customfavoriteLineItems: InvoiceLineItem[];
      editMode: boolean;
      refreshFavorites?: () => void;
    }
  ) => (
    <MyTaxRateCell
      {...props}
      customfavoriteLineItems={customfavoriteLineItems}
      onDeleteLineItem={props.onDeleteLineItem}
      invisibleItems={invisibleItems}
      setInvisibleItems={setInvisibleItems}
      editMode={props.editMode}
      refreshFavorites={fetchFavoriteLineItems}
    />
  );

  const TotalCell = useCallback(
    (cellProps) => {
      const { dataItem } = cellProps;
      const isHeaderRow = dataItem.style === 'subEventHeader';
      const isCustomLineItemHeader =
        dataItem.description?.includes('Custom Line Items');

      if (props?.disableActionButtons && isHeaderRow)
        return <td className="k-grid-cell-non-selectable" />;
      if (isHeaderRow && !isCustomLineItemHeader) {
        return (
          <td className="k-grid-cell-non-selectable">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginRight: '10px',
                height: '100%',
              }}
            >
              <Tooltip
                title={
                  (dataItem.hideInInvoice ? 'Include ' : 'Exclude ') +
                  'in Event Invoice'
                }
              >
                <CustomSwitch
                  size="small"
                  checked={!dataItem.hideInInvoice}
                  onChange={(e) => {
                    if (
                      props.handleToggleIncludeInInvoice &&
                      dataItem.layoutId
                    ) {
                      props.handleToggleIncludeInInvoice(dataItem.layoutId);
                    }
                  }}
                  sx={{
                    pointerEvents: 'auto',
                    position: 'relative',
                  }}
                />
              </Tooltip>
            </Box>
          </td>
        );
      }

      return (
        <td
          className="k-grid-cell-non-selectable"
          style={{
            background: isCustomLineItemHeader
              ? undefined
              : `${theme.palette.primary.main}33`,
            fontWeight: 'bold',
            pointerEvents: isCustomLineItemHeader ? undefined : 'auto',
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0px 1px',
              margin: '0px 5px',
            }}
          >
            {!isCustomLineItemHeader &&
              (dataItem.total ? formatNumber(dataItem.total) : '-')}
            {!dataItem.total && isShowHideList && (
              <PlacezIconButton
                sx={{
                  pointerEvents: 'auto',
                  position: 'relative',
                  transform: 'scale(0.9)',
                  margin: 0,
                  marginLeft: 1,
                }}
                onClick={() => {
                  setIdList?.((prevState: string[]) => {
                    if (prevState.includes(dataItem.uuid)) {
                      return prevState.filter((uuid) => uuid !== dataItem.uuid);
                    }
                    return [...prevState, dataItem.uuid];
                  });
                }}
              >
                {idList?.includes(dataItem.uuid) ? (
                  <VisibilityOff />
                ) : (
                  <Visibility color="primary" />
                )}
              </PlacezIconButton>
            )}
          </Box>
        </td>
      );
    },
    [props, idList, isShowHideList]
  );

  const columns = [
    {
      field: 'description',
      title: 'Description',
      width: '35%',
      className: classes.overflowEllipsis,
      cell: (props: any) => {
        return (
          <td
            {...props.tdProps}
            style={{ pointerEvents: 'auto', height: '100%' }}
          >
            {props.dataItem.description ? props.dataItem.description : '-'}
          </td>
        );
      },
    },
    {
      field: 'price',
      title: 'Price',
      className: classes.overflowEllipsis,
      minShow: 770,
      editor: 'numeric',
      width: '15%',
      cell: (props: any) => {
        if (props.dataItem.isHeader || props.dataItem.isTotalField)
          return <td {...props.tdProps} />;

        return (
          <td
            {...props.tdProps}
            title={formatNumber(props.dataItem.price)}
            style={{ pointerEvents: 'auto' }}
          >
            {formatNumber(props.dataItem.price)}
          </td>
        );
      },
    },
    {
      field: 'quantity',
      title: 'Count',
      className: classes.overflowEllipsis,
      minShow: 770,
      editor: 'numeric',
      width: '15%',
      cell: (props: any) => {
        if (props.dataItem.isHeader || props.dataItem.isTotalField)
          return <td {...props.tdProps} />;

        return (
          <td
            {...props.tdProps}
            title={props.dataItem.quantity}
            style={{ pointerEvents: 'auto' }}
          >
            {props.dataItem.quantity || '-'}
          </td>
        );
      },
    },
    {
      field: 'priceRateInHours',
      title: 'Rate',
      cell: RateCell,
      className: classes.overflowEllipsis,
      minShow: 570,
      width: '15%',
    },
    /*
    {
      field: 'taxRate',
      title: 'Tax %',
      cell: (props) => (
        <TaxRateCell {...props} onDeleteLineItem={handleDeleteLineItem} />
      ),
      className: classes.overflowEllipsis,
      width: '10%',
    },
    */
    // { field: 'notes', title: 'Notes', className: classes.overflowEllipsis, minShow: 440 },
    {
      field: 'total',
      title: 'Total',
      className: classes.overflowEllipsis,
      minShow: 200,
      editable: false,
      width: '22px',
      cell: TotalCell,
    },
  ];

  const [sort, setSort] = useState<SortDescriptor[]>([]);

  const [visibleColumns, setVisibleColumns] = useState<any[]>(columns);
  const [data, setData] = useState<InvoiceLineItem[]>([]);
  const [computedLayoutLineItems, setComputedLayoutLineItems] = useState<{
    [layoutId: string]: InvoiceLineItem[];
  }>({});
  const [layoutLineItems, setLayoutLineItems] = useState<{
    [layoutId: string]: InvoiceLineItem[];
  }>({});
  const { floorPlans, scene } = props;
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const venues = useSelector((state: ReduxState) => state.place.places);

  useEffect(() => {
    setVisibleColumns(columns);
  }, [props, idList, isShowHideList]);

  const checkColumnMaxWidth = () => {
    if (grid.current) {
      const currentVisibleColumns =
        columns?.filter(
          (item) =>
            !item.minShow || item.minShow <= (grid?.current as any)?.offsetWidth
        ) ?? columns;
      if (currentVisibleColumns.length >= visibleColumns.length) {
        setVisibleColumns(currentVisibleColumns);
      }
    }
  };

  useEffect(() => {
    grid.current = document.querySelector(`.${CSS.escape(classes.gridRoot)}`);
    window.addEventListener('resize', checkColumnMaxWidth);
    checkColumnMaxWidth();
    return () => {
      window.removeEventListener('resize', checkColumnMaxWidth);
    };
  }, []);

  const updateLineItems = async () => {
    // Get custom line items associated with scene
    const response = await placezApi.getCustomInvoiceLineItemByScene(scene.id);

    const parsed = response?.parsedBody;
    const customLineItems = Array.isArray(parsed) ? parsed : [];

    const sceneLineItems = buildSceneLineItems(
      layouts ?? [],
      floorPlans,
      assetsBySku,
      venues
    );

    // Add total row
    sceneLineItems.push({
      description: KeyRows.Total,
      isTotalField: true,
      total:
        rollUpPrice(sceneLineItems) +
        customLineItems.reduce((acc, item) => acc + item.total, 0),
    });

    const customItemsHeader = {
      description: 'Custom Line Items',
      hideInInvoice: false,
      isHeader: true,
      layoutId: '',
      style: 'subEventHeader',
      total: undefined,
    };

    const finalLineItems = [
      customItemsHeader,
      ...customLineItems,
      ...sceneLineItems,
    ];
    setData(
      finalLineItems.map((item) => ({
        ...item,
        uuid: crypto.randomUUID(),
      }))
    );
  };

  useEffect(() => {
    if (
      !Utils.isLargeObjectEmpty(assetsBySku) &&
      layouts?.length &&
      floorPlans?.length
    )
      updateLineItems();
  }, [layouts, floorPlans, scene, props.selectedId, assetsBySku]);

  const updateLayout = (updatedLineItem: InvoiceLineItem) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.uuid === updatedLineItem.uuid
          ? { ...item, ...updatedLineItem }
          : item
      )
    );
  };

  const selectedLayout = layouts?.find(
    (layout) => layout.id === selectedLineItem?.layoutId
  );

  const editField = 'inEdit';

  // modify the data in the store, db etc
  const remove = (dataItem: InvoiceLineItem) => {
    const newLayoutsLineItems = JSON.parse(JSON.stringify(layoutLineItems));

    const layoutId = Object.keys(layoutLineItems).find((layoutId: string) => {
      return layoutLineItems[layoutId].find(
        (invoiceLineItem: InvoiceLineItem) => {
          return invoiceLineItem.id === dataItem.id;
        }
      );
    });

    newLayoutsLineItems[layoutId] = layoutLineItems[layoutId].filter(
      (invoiceLineItem: InvoiceLineItem) => {
        return invoiceLineItem.id !== dataItem.id;
      }
    );
    setLayoutLineItems(newLayoutsLineItems);
  };

  const add = (dataItem: InvoiceLineItem) => {
    dataItem.inEdit = true;
    // const newData = insertItem(data)(dataItem);
    // setData(newData);
  };

  const addInvoiceLineItem = (
    layoutId: string,
    invoiceLineItem: InvoiceLineItem
  ) => {
    const newLayoutsLineItems = JSON.parse(JSON.stringify(layoutLineItems));
    const newLineItem = {
      ...invoiceLineItem,
      total: calcTotal(
        invoiceLineItem,
        computeSceneDuration(layouts),
        invoiceLineItem.taxRate
      ),
    };
    if (newLayoutsLineItems[layoutId]) {
      newLayoutsLineItems[layoutId].push(newLineItem);
    } else {
      newLayoutsLineItems[layoutId] = [newLineItem];
    }
    setLayoutLineItems(newLayoutsLineItems);
  };

  const update = (dataItem: InvoiceLineItem) => {
    const newLayoutsLineItems = JSON.parse(JSON.stringify(layoutLineItems));

    const layoutId = Object.keys(layoutLineItems).find((layoutId: string) => {
      return layoutLineItems[layoutId].find(
        (invoiceLineItem: InvoiceLineItem) => {
          return invoiceLineItem.id === dataItem.id;
        }
      );
    });

    newLayoutsLineItems[layoutId] = layoutLineItems[layoutId].map(
      (invoiceLineItem: InvoiceLineItem) => {
        if (dataItem.id === invoiceLineItem.id) {
          const newDataItem = dataItem;
          newDataItem.inEdit = false;
          newDataItem.total = calcTotal(
            dataItem,
            computeSceneDuration(layouts),
            dataItem.taxRate
          );
          return newDataItem;
        }
        return invoiceLineItem;
      }
    );
    setLayoutLineItems(newLayoutsLineItems);
  };

  // Local state operations
  const discard = (dataItem: InvoiceLineItem) => {};

  const cancel = (dataItem: InvoiceLineItem) => {
    // this forces rerender
    setComputedLayoutLineItems({ ...computedLayoutLineItems });
  };

  const enterEdit = (dataItem: InvoiceLineItem) => {
    const newData = data.map((item) =>
      item.id === dataItem.id ? { ...item, inEdit: true } : item
    );
    setData(newData);
  };

  const itemChange = (event: GridItemChangeEvent) => {
    const field = event.field || '';
    const newData = data.map((item) =>
      item.id === event.dataItem.id ? { ...item, [field]: event.value } : item
    );

    setData(newData);
  };

  let gridExcelExport: ExcelExport | null;
  const exportExcel = () => {
    if (gridExcelExport !== null) {
      gridExcelExport.save();
    }
  };

  let gridPDFExport: GridPDFExport | null;
  const exportPDF = () => {
    if (gridPDFExport !== null) {
      gridPDFExport.save();
    }
  };

  useEffect(() => {
    if (props.onExportExcel && gridExcelExport !== null) {
      props.onExportExcel(() => gridExcelExport?.save.bind(gridExcelExport));
    }
    if (props.onExportPDF && gridPDFExport !== null) {
      props.onExportPDF(() => gridPDFExport?.save.bind(gridPDFExport));
    }
  }, [gridExcelExport, gridPDFExport]);

  const invoiceGrid = (
    <div className={classes.gridRoot}>
      {props.editMode && (
        <div style={{ width: '100%', padding: 0, pointerEvents: 'auto' }}>
          <LineItemInput
            layout={selectedLayout}
            updateLineItems={updateLineItems}
            deleteLineItem={handleDeleteLineItem}
            selectedLineItem={selectedLineItem || undefined}
            changed={changed}
            setChanged={setChanged}
            favoriteLineItems={customfavoriteLineItems}
            refreshFavorites={fetchFavoriteLineItems}
          />
        </div>
      )}
      <Grid
        key={hoveredRow?.id ?? 'no-hover'}
        sortable
        sort={sort}
        style={{ margin: '0', border: 'none' }}
        onSortChange={(e) => {
          setSort(e.sort);
        }}
        onItemChange={itemChange}
        selectedField="selected"
        editField={editField}
        data={orderBy(
          data
            .map((lineItem) => ({
              ...lineItem,
              selected: props.selectedId && lineItem.id === props.selectedId,
            }))
            .filter(({ uuid }) => isShowHideList || !idList?.includes(uuid)),
          sort
        )}
        rowRender={rowRender}
        onRowClick={(e) => {
          const item = e.dataItem;

          const sceneLineItems = buildSceneLineItems(
            layouts ?? [],
            floorPlans,
            assetsBySku,
            venues
          );

          const regularLineItemIds = new Set(
            sceneLineItems.map((item) => item.id)
          );

          // If in edit mode and it's a regular (non-custom) line item, prevent selection
          if (
            props.editMode &&
            regularLineItemIds.has(item.id) &&
            item.layoutId
          ) {
            return;
          }

          const isSelected =
            item.uuid === selectedLineItem?.uuid &&
            item.id === selectedLineItem?.id;

          const newSelection = isSelected ? undefined : item;
          setSelectedLineItem(newSelection);
          props?.onRowSelect?.(newSelection);
        }}
      >
        {props.disableActionButtons && (
          <GridToolbar>
            <PlacezIconButton
              sx={{
                pointerEvents: 'auto',
                position: 'relative',
                transform: 'scale(0.9)',
                margin: 0,
                marginLeft: 1,
              }}
              onClick={() => setIsShowHideList(!isShowHideList)}
            >
              <VisibilityOff
                color={isShowHideList ? 'primary' : 'secondary'}
                style={{ color: !isShowHideList ? '#808080' : null }}
              />
              {/*<Visibility color="primary" />*/}
            </PlacezIconButton>
          </GridToolbar>
        )}
        {visibleColumns.map((column, index) => {
          return (
            <GridColumn
              field={column.field}
              title={column.title}
              cell={column.cell}
              key={index}
              className={column.className}
              width={column.width}
              editor={column.editor}
              editable={column.editable}
              format={column.format}
            />
          );
        })}
        {props.editable && <GridColumn cell={CommandCell} width="100px" />}
      </Grid>
    </div>
  );

  return (
    <Box sx={{ ...sx, width: '100%', overflow: 'auto' }}>
      <Paper
        className={classes.gridContainer}
        style={{ width: '100%', minWidth: '600px' }}
      >
        <GridPDFExport ref={(pdfExport) => (gridPDFExport = pdfExport)}>
          {invoiceGrid}
        </GridPDFExport>
        <ExcelExport
          data={data}
          ref={(excelExport) => (gridExcelExport = excelExport)}
        >
          {invoiceGrid}
        </ExcelExport>
      </Paper>
    </Box>
  );
};

export default InvoiceTable;
