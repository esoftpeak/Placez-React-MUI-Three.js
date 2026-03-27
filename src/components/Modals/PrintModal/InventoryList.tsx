import { useState } from 'react';
import { Theme, useTheme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import { Utils } from '../../../blue/core/utils';
import { Grid, GridCellProps, GridColumn } from '@progress/kendo-react-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import { keysOfInvoiceLineItem } from '../../Invoicing/InvoiceLineItemModel';
import CheckboxCell from '../../Tables/Cells/CheckboxCell';
import { SkuType } from '../../../blue/items/asset';
import { tableStyles } from '../../Tables/tableSyles.css'

interface Props {
  inventorySettings: { [name: string]: boolean };
  items: any[];
  hideBorder?: boolean;
}

const localStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      gridGap: '5px',
      color: '#000000 !important',
    },
    selected: {
      transform: 'scale(1.15)',
    },
    input: {
      width: '150px',
    },
    tableCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',

      '& .k-grid-content': {
        backgroundColor: theme.palette.background.default,
        printColorAdjust: 'economy',
        color: '#000000',
        overflowY: 'hidden',
      },
      '& .k-grid': {
        backgroundColor: theme.palette.background.default,
        printColorAdjust: 'economy',
        border: '0 !important',
        color: '#000000',
      },
      '& .k-grid-header-wrap': {
        border: '0 !important',
      },
      '& .k-grid-header': {
        padding: '0 !important',
        borderBottom: '1px solid #000000',
        color: '#000000',
      },
      '& .k-grid-norecords': {
        // display: 'none',
      },
      '& .k-grid td': {
        padding: 5,
        borderBottom: '1px solid #000000',
        color: '#000000',
        textAlign: 'center',
      },
      '& .k-grid th': {
        textAlign: 'center',
        padding: 5,
        color: theme.palette.primary.main,
      },
    },
    tableTitle: {
      alignSelf: 'stretch',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#eeeeee',
    },
    attendee: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      width: '100%',
    },
    attendeeGridItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    entreeGrid: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    entreeCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      margin: '5px',
    },
    entreeName: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    total: {
      alignSelf: 'end',
    },
  })
);

const styles = makeStyles<Theme>(tableStyles);

const InventoryList = (props: Props) => {
  const classes = styles(props);
  // const classes = localStyles(props);
  const { inventorySettings } = props;
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);

  const [sort, setSort] = useState([
    { field: 'group', dir: 'desc' } as SortDescriptor,
  ]);

  const layoutPricing = [];
  console.log(assetsBySku, props.items)
  const assets = props.items.map((item) => {
    return {
      ...assetsBySku[item.assetSku],
      description: assetsBySku[item.assetSku]?.name,
      quantity: item.count,
      group: SkuType[assetsBySku[item.assetSku]?.skuType],
    };
  });
  Object.keys(assets).forEach((key) => {
    layoutPricing.push(assets[key]);
  });
  console.log('layoutPricing', layoutPricing);

  const checkInventoryCell = (props: GridCellProps) => {
    return <CheckboxCell {...props} />;
  };

  const widths = {
    quantity: '80px',
    group: '140px',
    description: '140px',
  };

  const theme = useTheme();

  return (
    <div className={classes.tableCard}>
      <Grid
        className={classes.gridRoot}
        style={{border: props.hideBorder ? 'none' : theme.PlacezBorderStyles.border }}
        sortable={{
          mode: 'multiple',
        }}
        onSortChange={(e) => {
          setSort(e.sort);
        }}
        selectedField="selected"
        data={orderBy(layoutPricing, sort)}
      >
        {/* {inventorySettings.checkbox && (
          <GridColumn cell={checkInventoryCell} width={'60px'} />
        )} */}
        {keysOfInvoiceLineItem
          .filter((key) => inventorySettings[key])
          .filter((key) => key !== 'checkBox')
          .sort((a, b) => (a === 'group' ? -1 : 1))
          .map((metadata) => {
            return (
              <GridColumn
                field={metadata}
                title={Utils.camelToUpperCase(metadata)}
                key={metadata}
              />
            );
          })}
      </Grid>
      {/* <div className={classes.total}>Inventory Total: ${layoutPricing.reduce((acc, metadata) => acc += metadata.total, 0)}</div> */}
    </div>
  );
};

export default InventoryList;
