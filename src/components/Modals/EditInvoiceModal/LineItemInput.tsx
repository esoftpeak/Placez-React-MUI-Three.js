import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { placezApi, PlacezLayoutPlan } from '../../../api';
import { InvoiceLineItem } from './InvoiceLineItemModel';
import {
  DeleteOutlined,
  Favorite,
  FavoriteBorder,
  SaveOutlined,
} from '@mui/icons-material';
import { Utils, BillingRate, billingRate } from '../../../blue/core/utils';
import PlacezTextField from '../../PlacezUIComponents/PlacezTextField';
import PlacezCurrency from '../../PlacezUIComponents/PlacezCurrency';
import PlacezSelector from '../../PlacezUIComponents/PlacezSelector';
import FavoriteItemSelector from './FavoriteItemSelector';

interface Props {
  layout: PlacezLayoutPlan;
  updateLineItems?: () => void;
  selectedLineItem?: InvoiceLineItem;
  deleteLineItem: (item: InvoiceLineItem) => void;
  changed?: boolean;
  setChanged?: (changed: boolean) => void;
  favoriteLineItems?: InvoiceLineItem[];
  refreshFavorites?: () => void;
}

const DefaultLineItem: InvoiceLineItem = {
  guid: undefined,
  description: '',
  quantity: undefined,
  price: null,
  priceRateInHours: undefined,
  notes: '',
};

const LineItemInput = (props: Props) => {
  const { layout, changed, setChanged, updateLineItems } = props;
  const params = useParams();
  const layoutId = Utils.guid();
  const eventId = params.id;
  const [selectedLineItem, setSelectedLineItem] = useState<InvoiceLineItem>(
    props.selectedLineItem ?? DefaultLineItem
  );

  const descriptionOptions = [
    // Add the selected item if it doesn't exist in favoriteLineItems
    ...(props.favoriteLineItems ?? []),

    // Only add if selectedLineItem is NOT in favoriteLineItems by id
    ...(selectedLineItem?.id &&
    !(props.favoriteLineItems ?? [])?.some(
      (item) => item.id === selectedLineItem.id
    )
      ? [selectedLineItem]
      : []),
  ].map((item) => ({
    label: item?.description,
    value: item?.id?.toString(),
  }));

  useEffect(() => {
    resetSelectedLineItem();
  }, [props.selectedLineItem]);

  const resetSelectedLineItem = () => {
    setSelectedLineItem(props.selectedLineItem ?? DefaultLineItem);
    setChanged(false);
  };

  const handleDetailChange = (prop) => (e) => {
    const value = e.target.value;
    if (selectedLineItem?.id) {
      setChanged(true);
    }
    setSelectedLineItem({
      ...selectedLineItem,
      [prop]: value,
    });
  };

  const handlePriceChange = (value) => {
    if (selectedLineItem?.id) {
      setChanged(true);
    }
    setSelectedLineItem({
      ...selectedLineItem,
      price: value,
    });
  };

  const onSetRate = (v: number) => {
    if (selectedLineItem?.id) {
      setChanged(true);
    }
    setSelectedLineItem({
      ...selectedLineItem,
      priceRateInHours: parseInt(BillingRate[v]),
    });
  };

  const matchesSelectedItem = (item: InvoiceLineItem) => {
    return selectedLineItem?.id
      ? item.guid === selectedLineItem?.guid
      : item.id === selectedLineItem?.id;
  };

  const handleUpdateLineItem = () => {
    const updatedLineItems = [
      ...(layout.invoiceLineItems?.filter(
        (item) => !matchesSelectedItem(item)
      ) || []),
      selectedLineItem,
    ];

    setChanged(false);
  };

  const handleAddLineItem = async () => {
    // Sanitize and compute total
    const price = Number(selectedLineItem?.price) || 0;
    const quantity = Number(selectedLineItem?.quantity) || 1;
    const rate = selectedLineItem?.priceRateInHours;
    const total = price * quantity;

    if (selectedLineItem?.id) {
      const updatedLineItem = {
        ...selectedLineItem,
        price,
        quantity,
        priceRateInHours: rate,
        total,
        lastModifiedUtcDateTime: new Date().toISOString(),
        deleted: true, // placeholder
        layoutId,
        sceneId: eventId,
        isFavorite: true, // placeholder
        notes: 'string', // placeholder
        sortOrder: 0, // placeholder
      };
      await placezApi.updateCustomInvoiceLineItem(updatedLineItem);
      // props.updateLayout(updatedLineItem);
      setSelectedLineItem(updatedLineItem);
      setChanged(false);
    } else {
      const newLineItem = {
        ...selectedLineItem,
        price,
        quantity,
        priceRateInHours: rate,
        total,
        createdUtcDateTime: new Date().toISOString(),
        lastModifiedUtcDateTime: new Date().toISOString(),
        deleted: true, // placeholder
        layoutId,
        sceneId: eventId,
        isFavorite: true, // placeholder
        notes: 'string', // placeholder
        sortOrder: 0, // placeholder
      };
      await placezApi.createCustomInvoiceLineItem(newLineItem);
      // props.updateLayout(newLineItem);
      setSelectedLineItem(newLineItem);
      setChanged(false);
    }
    updateLineItems();
  };

  const handleRemoveLineItem = () => {
    const updatedLineItems =
      layout.invoiceLineItems?.filter((item) => {
        if (item.guid) {
          return item.guid !== selectedLineItem?.guid;
        }
        return item.id !== selectedLineItem?.id;
      }) || [];

    setSelectedLineItem(DefaultLineItem);
    setChanged(false);
  };

  const isSaveDisabled = () => {
    const { quantity, description, price, priceRateInHours } = selectedLineItem;

    // Check quantity and description filled
    const hasQuantity =
      quantity !== undefined && quantity !== null && Number(quantity) > 0;
    const hasDescription =
      description !== undefined &&
      description !== null &&
      description.trim() !== '';

    // Calculate total
    const total =
      Number(selectedLineItem?.price) * Number(selectedLineItem?.quantity);

    // Check price and rate filled
    const hasPriceAndRate =
      price !== undefined &&
      price !== null &&
      priceRateInHours !== undefined &&
      priceRateInHours !== null;

    // Check total filled
    const hasTotal = total >= 0;

    return !(hasQuantity && hasDescription && (hasPriceAndRate || hasTotal));
  };

  const theme = useTheme();

  const containerBorderColor =
    theme.palette.mode === 'dark' ? theme.palette.divider : '#E0D8E4';
  const containerBgColor =
    theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff';

  const actionPillBg =
    theme.palette.mode === 'dark'
      ? theme.palette.action.selected
      : '#E0D8E4';

  const actionPillBorder =
    theme.palette.mode === 'dark'
      ? `1px solid ${theme.palette.divider}`
      : 'none';

  return (
    <div
      style={{
        border: `1px solid ${containerBorderColor}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: containerBgColor,
      }}
    >
      <div
        style={{
          display: 'grid',
          width: '100%',
          marginRight: '0px',
          gridTemplateColumns: '1fr 3fr 1fr 1fr 1.75fr 0.5fr',
          gridGap: '20px',
        }}
      >
        <PlacezTextField
          id="outlined-required"
          label="Quantity"
          value={selectedLineItem?.quantity ?? ''}
          onChange={handleDetailChange('quantity')}
          required
        />

        {(!props.favoriteLineItems || props.favoriteLineItems.length === 0) && (
          <PlacezTextField
            required
            id="outlined-required"
            label="Description"
            defaultValue=""
            value={selectedLineItem?.description}
            onChange={handleDetailChange('description')}
          />
        )}

        {props.favoriteLineItems && props.favoriteLineItems.length > 0 && (
          <FavoriteItemSelector
            label="Description"
            value={selectedLineItem?.description ?? ''}
            options={descriptionOptions}
            onChange={(e, newValue) => {
              if (typeof newValue === 'string') {
                setSelectedLineItem({
                  ...DefaultLineItem,
                  description: newValue,
                  guid: Utils.guid(),
                });
              } else if (newValue) {
                const favorite = props.favoriteLineItems?.find(
                  (item) => item.id?.toString() === newValue.value.toString()
                );
                if (favorite) {
                  setSelectedLineItem({
                    ...favorite,
                    guid: Utils.guid(),
                  });
                }
              }
              setChanged?.(true);
            }}
            onInputChange={(e, newInputValue) => {
              setSelectedLineItem((prev) => ({
                ...prev,
                description: newInputValue,
              }));
              setChanged?.(true);
            }}
            onDelete={async (favoriteItem: InvoiceLineItem) => {
              await placezApi.deleteFavoriteInvoiceLineItem(favoriteItem);
              props.refreshFavorites?.();
            }}
          />
        )}

        <PlacezCurrency
          required
          id="outlined-required"
          placeholder="Price"
          label="Price"
          inputProps={{ style: { direction: 'ltr', textAlign: 'left' } }}
          style={{ alignSelf: 'baseline' }}
          value={selectedLineItem?.price}
          onValueChange={handlePriceChange}
        />

        <PlacezSelector
          label="Rate Type"
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10);
            handleDetailChange('priceRateInHours')({
              target: { value: newValue },
            });
          }}
          options={billingRate}
          value={
            selectedLineItem?.priceRateInHours !== undefined &&
            selectedLineItem?.priceRateInHours !== null
              ? selectedLineItem?.priceRateInHours
              : ''
          }
        />

        <PlacezCurrency
          required
          id="outlined-required"
          placeholder="Total"
          label="Total"
          inputProps={{
            style: { direction: 'ltr', textAlign: 'left' },
            readOnly: true,
          }}
          style={{ alignSelf: 'baseline' }}
          value={
            selectedLineItem?.price != null &&
            selectedLineItem?.quantity != null &&
            !isNaN(selectedLineItem?.price) &&
            !isNaN(selectedLineItem?.quantity)
              ? (selectedLineItem?.price * selectedLineItem?.quantity).toFixed(2)
              : ''
          }
          onValueChange={handlePriceChange}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: actionPillBg,
            border: actionPillBorder,
            borderRadius: '5px',
            padding: '5px',
          }}
        >
          <Tooltip
            title={
              props.favoriteLineItems?.some(
                (item) =>
                  item?.description === selectedLineItem?.description &&
                  item?.notes === selectedLineItem?.notes
              )
                ? 'Unfavorite'
                : 'Favorite'
            }
          >
            <IconButton
              aria-label="Favorite"
              color="primary"
              onClick={async () => {
                const exists = props.favoriteLineItems?.some(
                  (item) =>
                    item?.description === selectedLineItem?.description &&
                    item?.notes === selectedLineItem?.notes
                );

                if (exists) {
                  const itemToDelete = props.favoriteLineItems?.find(
                    (item) =>
                      item?.description === selectedLineItem?.description &&
                      item?.notes === selectedLineItem?.notes
                  );
                  if (itemToDelete) {
                    await placezApi.deleteFavoriteInvoiceLineItem(itemToDelete);
                    props.refreshFavorites?.();
                  }
                } else {
                  await placezApi.createFavoriteInvoiceLineItem(selectedLineItem);
                  props.refreshFavorites?.();
                }
              }}
              sx={{
                padding: '2px',
                color: selectedLineItem?.layoutId ? 'gray' : 'primary.main',
              }}
              disabled={
                !!selectedLineItem?.layoutId ||
                isSaveDisabled() ||
                !selectedLineItem?.id
              }
            >
              {props.favoriteLineItems?.some(
                (item) =>
                  item?.description === selectedLineItem?.description &&
                  item?.notes === selectedLineItem?.notes
              ) ? (
                <Favorite fontSize="medium" />
              ) : (
                <FavoriteBorder fontSize="medium" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              aria-label="Delete"
              color="primary"
              onClick={() => {
                props.deleteLineItem(selectedLineItem);
                setSelectedLineItem(DefaultLineItem);
              }}
              sx={{
                padding: '2px',
                color: selectedLineItem?.id ? 'primary.main' : 'gray',
              }}
              disabled={!selectedLineItem?.id}
            >
              <DeleteOutlined fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Save">
            <IconButton
              aria-label="Save"
              color="primary"
              onClick={handleAddLineItem}
              sx={{
                padding: '2px',
                color: selectedLineItem?.layoutId ? 'gray' : 'primary.main',
              }}
              disabled={!!selectedLineItem?.layoutId || isSaveDisabled()}
            >
              <SaveOutlined fontSize={'medium'} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default LineItemInput;
