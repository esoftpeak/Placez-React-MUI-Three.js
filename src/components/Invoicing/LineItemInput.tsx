import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { PlacezLayoutPlan } from '../../api';
import { InvoiceLineItem } from './InvoiceLineItemModel';
import {
  AddCircleOutline,
  DeleteOutline,
  Refresh,
  SaveOutlined,
} from '@mui/icons-material';
import { Utils, BillingRate, billingRate } from '../../blue/core/utils';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import PlacezCurrency from '../PlacezUIComponents/PlacezCurrency';
import { taxCategories } from './InvoiceModel';
import PlacezSelector from '../PlacezUIComponents/PlacezSelector';
import { selectText } from '../../utils/utilityFunctions';

interface Props {
  layout: PlacezLayoutPlan;
  updateLayout?: (layout: PlacezLayoutPlan) => void;
  taxRate?: number;
  selectedLineItem?: InvoiceLineItem;
  changed?: boolean;
  setChanged?: (changed: boolean) => void;
}

const DefaultLineItem: InvoiceLineItem = {
  id: 0,
  guid: undefined,
  description: 'New Line Item',
  quantity: 1,
  price: 0,
  priceRateInHours: BillingRate.FlatRate,
  notes: '',
  taxRate: 0,
};

const LineItemInput = (props: Props) => {
  const { layout, changed, setChanged } = props;
  DefaultLineItem.taxRate = props.taxRate;
  const [selectedLineItem, setSelectedLineItem] = useState<InvoiceLineItem>(
    props.selectedLineItem ?? DefaultLineItem
  );

  useEffect(() => {
    resetSelectedLineItem();
  }, [props.selectedLineItem]);

  const resetSelectedLineItem = () => {
    setSelectedLineItem(props.selectedLineItem ?? DefaultLineItem);
    setChanged(false);
  };

  const handleDetailChange = (prop) => (e) => {
    const value = e.target.value;
    if (selectedLineItem.id) {
      setChanged(true);
    }
    setSelectedLineItem({
      ...selectedLineItem,
      [prop]: value,
    });
  };

  const handlePriceChange = (value) => {
    if (selectedLineItem.id) {
      setChanged(true);
    }
    setSelectedLineItem({
      ...selectedLineItem,
      price: value,
    });
  };

  const onSetRate = (v: number) => {
    if (selectedLineItem.id) {
      setChanged(true);
    }
    setSelectedLineItem({
      ...selectedLineItem,
      priceRateInHours: parseInt(BillingRate[v]),
    });
  };

  const matchesSelectedItem = (item: InvoiceLineItem) => {
    return selectedLineItem.id
      ? item.guid === selectedLineItem.guid
      : item.id === selectedLineItem.id;
  };

  const handleUpdateLineItem = () => {
    const updatedLineItems = [
      ...(layout.invoiceLineItems?.filter(
        (item) => !matchesSelectedItem(item)
      ) || []),
      selectedLineItem,
    ];

    props.updateLayout({
      ...layout,
      invoiceLineItems: updatedLineItems,
    });

    setChanged(false);
  };

  const handleAddLineItem = () => {
    const newLineItem = {
      ...selectedLineItem,
      guid: Utils.guid(),
    };

    const updatedLineItems = [
      ...(layout.invoiceLineItems?.filter((item) => {
        if (item.guid) {
          return item.guid !== selectedLineItem.guid;
        }
        return item.id !== selectedLineItem.id;
      }) || []),
      newLineItem,
    ];

    props.updateLayout({
      ...layout,
      invoiceLineItems: updatedLineItems,
    });
  };

  const handleRemoveLineItem = () => {
    const updatedLineItems =
      layout.invoiceLineItems?.filter((item) => {
        if (item.guid) {
          return item.guid !== selectedLineItem.guid;
        }
        return item.id !== selectedLineItem.id;
      }) || [];

    props.updateLayout({
      ...layout,
      invoiceLineItems: updatedLineItems,
    });

    setSelectedLineItem(DefaultLineItem);
    setChanged(false);
  };

  const theme = useTheme();

  return (
    <div
      style={{
        display: 'grid',
        margin: '24px',
        marginRight: '35px',
        ...theme.PlacezBorderStyles,
        gridTemplateColumns: '300px 150px 150px 150px 150px 62px',
        gridGap: '20px',
        padding: '20px',
      }}
    >
      <PlacezTextField
        required
        id="outlined-required"
        label="Description"
        defaultValue="New Line Item"
        value={selectedLineItem?.description}
        onChange={handleDetailChange('description')}
        onFocus={selectText}
      />
      <PlacezCurrency
        required
        id="outlined-required"
        placeholder="Price"
        label="Price"
        inputProps={{ style: { direction: 'ltr', textAlign: 'left' } }}
        style={{ alignSelf: 'baseline' }}
        value={selectedLineItem?.price}
        onValueChange={handlePriceChange}
        onFocus={selectText}
      />
      <PlacezTextField
        id="outlined-required"
        label="Quantity"
        value={selectedLineItem?.quantity}
        onChange={handleDetailChange('quantity')}
      />
      <PlacezSelector
        label="Rate"
        onChange={handleDetailChange('priceRateInHours')}
        options={billingRate}
        value={selectedLineItem?.priceRateInHours}
      />
      <PlacezSelector
        onChange={handleDetailChange('taxRate')}
        label="Tax"
        options={taxCategories}
        value={selectedLineItem?.taxRate}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {!selectedLineItem.id && (
          <Tooltip title="Add Line Item">
            <IconButton
              aria-label="Add Line Item"
              color="primary"
              onClick={handleAddLineItem}
            >
              <AddCircleOutline fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {selectedLineItem.id && (
          <Tooltip title="Update Line Item">
            <IconButton
              aria-label="Update Line Item"
              disabled={!changed}
              color="primary"
              onClick={handleUpdateLineItem}
            >
              <SaveOutlined fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {selectedLineItem.id && !changed && (
          <Tooltip title="Remove Line Item">
            <IconButton
              aria-label="Remove Line Item"
              color="primary"
              onClick={handleRemoveLineItem}
            >
              <DeleteOutline fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {selectedLineItem.id && changed && (
          <Tooltip title="Cancel">
            <IconButton
              aria-label="Cancel"
              color="primary"
              onClick={() => resetSelectedLineItem()}
            >
              <Refresh fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default LineItemInput;
