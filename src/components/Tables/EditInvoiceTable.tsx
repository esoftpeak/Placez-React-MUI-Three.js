import React, {
  useState,
  useEffect,
  useRef,
  cloneElement,
  ReactElement,
  CSSProperties,
  ReactNode,
} from 'react';
import { useSelector } from 'react-redux';
import { Box, MenuItem, Paper, Select, SxProps, useTheme } from '@mui/material';

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
} from '@progress/kendo-react-grid';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { BillingRate, Utils } from '../../blue/core/utils';
import { PlacezFixturePlan, PlacezLayoutPlan, Scene } from '../../api';
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
import { editInvoiceTableStyle } from './editInvoiceTableStyle';

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
          style={{ width: '100px' }}
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

const MyTaxRateCell = (props) => {
  if (props.dataItem.isHeader || props.dataItem.isTotalField)
    return <td {...props.tdProps} />;

  const { taxRate } = props.dataItem;
  if (taxRate) {
    const taxPercentage = Math.round(taxRate * 100);
    return (
      <td>
        {Number.isInteger(taxPercentage)
          ? taxPercentage.toFixed(0)
          : taxPercentage.toFixed(2)}
      </td>
    );
  }
  return <td>{'-'}</td>;
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
  onExportPDF?: (cb) => void;
  onExportExcel?: (cb) => void;
  onRowSelect?: (lineItem: InvoiceLineItem) => void;
  selectedId?: number;
  sx?: SxProps<Theme>;
  handleToggleIncludeInInvoice?: (layoutId: string) => void;
  disableActionButtons?: boolean;
}

const EditInvoiceTable = (props: Props) => {
  const { layouts, sx } = props;

  const theme: Theme = useTheme();
  const styles = makeStyles<Theme>(editInvoiceTableStyle);
  const classes = styles(props);
  const grid = useRef();

  const fakeLineItems: InvoiceLineItem[] = [
    {
      id: 1,
      quantity: 2,
      description: 'Small Chair',
      price: 100,
      priceRateInHours: 1,
      taxRate: 0.08,
      total: 216,
      inEdit: false,
      uuid: crypto.randomUUID(),
    },
    {
      id: 2,
      quantity: 1,
      description: 'Big Chair',
      price: 150,
      priceRateInHours: 1,
      taxRate: 0.08,
      total: 162,
      inEdit: false,
      uuid: crypto.randomUUID(),
    },
    {
      id: 3,
      quantity: 1,
      description: 'Even Smaller Chair',
      price: 80,
      priceRateInHours: 1,
      taxRate: 0.08,
      total: 86.4,
      inEdit: false,
      uuid: crypto.randomUUID(),
    },
  ];

  useEffect(() => {
    setData(fakeLineItems);
  }, []);

  const rowRender = (
    trElement: ReactElement<HTMLTableRowElement>,
    props: GridRowProps
  ) => {
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

    const assetStyle = {};
    const customStyle = {};
    const totalStyle = {
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

    const trProps: any = { style: rowStyle };
    const eventHeaderClassName =
      props.dataItem.style === 'subEventHeader' ? 'subEventHeader-row' : '';

    const childrenWithOverflow = React.Children.map(
      trElement.props.children,
      (child) => {
        if (React.isValidElement(child)) {
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
          return cloneElement(typedChild, { style });
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

    const trStyle = {
      height: '0px',
      color: 'inherit',
    };

    return (
      <>
        {childElement}

        <tr style={trStyle} className="subEventHeader-row" />
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

  const TaxRateCell = (props: GridCellProps) => (
    <MyTaxRateCell {...props} onSetRate={onSetRate} />
  );

  const TotalCell = (props: GridCellProps) => {
    const { dataItem } = props;
    if (!dataItem) return <td>-</td>;

    const total =
      dataItem.quantity && dataItem.price
        ? dataItem.quantity * dataItem.price * (1 + (dataItem.taxRate || 0))
        : 0;

    return <td style={{ fontWeight: 'bold' }}>{formatNumber(total)}</td>;
  };

  const columns = [
    {
      field: 'quantity',
      title: 'Quantity',
      className: classes.overflowEllipsis,
      minShow: 770,
      editor: 'numeric',
      width: '15px',
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
      field: 'description',
      title: 'Description',
      width: '45px',
      className: classes.overflowEllipsis,
    },
    {
      field: 'price',
      title: 'Price',
      className: classes.overflowEllipsis,
      minShow: 770,
      editor: 'numeric',
      width: '20%',
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
      field: 'priceRateInHours',
      title: 'Rate Type',
      cell: RateCell,
      className: classes.overflowEllipsis,
      minShow: 570,
      width: '20%',
    },
    {
      field: 'taxRate',
      title: 'Rate %',
      cell: TaxRateCell,
      className: classes.overflowEllipsis,
      width: '25px',
    },
    {
      field: 'total',
      title: 'Total',
      className: classes.overflowEllipsis,
      minShow: 200,
      editable: false,
      width: '20px',
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
  }, [props]);

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

  const updateLineItems = () => {
    const sceneLineItems = buildSceneLineItems(
      layouts ?? [],
      floorPlans,
      assetsBySku,
      venues
    );

    sceneLineItems.push({
      description: KeyRows.Total,
      isTotalField: true,
      total: rollUpPrice(sceneLineItems),
    });

    setData(
      sceneLineItems.map((item) => ({ ...item, uuid: crypto.randomUUID() }))
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

  const editField = 'inEdit';

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

  const discard = (dataItem: InvoiceLineItem) => {};
  const cancel = (dataItem: InvoiceLineItem) => {
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

  const computeTotals = (lineItems: InvoiceLineItem[]) => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    // These are just example values for now
    const gratuity = subtotal * 0.2; // 20%
    const tax = subtotal * 0.0625; // 6.25%
    const adminFee = subtotal * 0.03; // 3%
    const discount = subtotal * 0.05; // 5%
    const grandTotal = subtotal + gratuity + tax + adminFee - discount;

    return { subtotal, gratuity, tax, adminFee, discount, grandTotal };
  };

  const totals = computeTotals(data);

  const invoiceGrid = (
    <Grid
      sortable
      sort={sort}
      onSortChange={(e) => setSort(e.sort)}
      onItemChange={itemChange}
      className={classes.gridRoot}
      selectedField="selected"
      editField={editField}
      data={orderBy(
        data.map((lineItem) => ({
          ...lineItem,
          selected: props.selectedId && lineItem.id === props.selectedId,
        })),
        sort
      )}
      rowRender={rowRender}
      onRowClick={(e) =>
        props?.onRowSelect?.(
          e.dataItem.id === props.selectedId ? undefined : e.dataItem
        )
      }
    >
      {visibleColumns.map((column, index) => (
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
      ))}
      {props.editable && <GridColumn cell={CommandCell} width="100px" />}
    </Grid>
  );

  return (
    <div>
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

      <Box>
        <Box sx={{ backgroundColor: '#DED3E2' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            fontWeight="bold"
            sx={{ my: 2, ml: 65, mr: 15 }}
          >
            <div>Subtotal</div>
            <div>{formatNumber(totals.subtotal)}</div>
          </Box>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ ml: 65, mr: 15 }}
        >
          <div>Gratuity 20%</div>
          <div>{formatNumber(totals.gratuity)}</div>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ ml: 65, mr: 15 }}
        >
          <div>State Sales Tax 6.25%</div>
          <div>{formatNumber(totals.tax)}</div>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ ml: 65, mr: 15 }}
        >
          <div>Admin Fee 3%</div>
          <div>{formatNumber(totals.adminFee)}</div>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ ml: 65, mr: 15 }}
        >
          <div>Discount 5%</div>
          <div>-{formatNumber(totals.discount)}</div>
        </Box>
        <Box sx={{ backgroundColor: '#DED3E2' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            fontWeight="bold"
            sx={{ my: 2, ml: 65, mr: 15 }}
          >
            <div>Grand Total</div>
            <div>{formatNumber(totals.grandTotal)}</div>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default EditInvoiceTable;
