import { PlacezFixturePlan, PlacezLayoutPlan } from '../api';
import { BillingRate } from '../blue/core/utils';
import { SeatInstance } from '../blue/itemModifiers/ChairMod';
import { SkuType } from '../blue/items/asset';
import { InvoiceLineItem } from '../components/Invoicing/InvoiceLineItemModel';
import { getLayoutDurationInHours } from './LayoutUtils';

const getAssetPrice = (
  assetSku,
  assetsBySku,
  costMultiplier,
  asset?
): number => {
  const price = assetsBySku[assetSku]?.price * costMultiplier;
  if (price) return price;

  return asset?.price * costMultiplier || 0;
};

const getAssetPriceRate = (assetID, assetsBySku): number => {
  return assetsBySku[assetID]?.priceRateInHours ?? BillingRate.FlatRate;
};

export enum KeyRows {
  Layout = 'Layout:',
  Assets = 'Assets:',
  CustomLineItems = 'Line Items:',
  Total = 'Total:',
}

export const computeLayoutInvoice = (
  layout: PlacezLayoutPlan,
  floorPlans: PlacezFixturePlan[],
  assetsBySku,
  taxRate: number,
  costMultiplier?: number,
  showHeader?: boolean
): InvoiceLineItem[] => {
  let layoutPricing = [];
  if (showHeader) {
    layoutPricing.push({
      description: `${layout.name}:`,
      style: 'subEventHeader',
      isHeader: true,
      layoutId: layout.id,
      hideInInvoice: layout.hideInInvoice,
      // total: floorPlan.price,
    });
  }
  if (layout?.hideInInvoice) {
    return layoutPricing;
  }
  // get floorplan price for layout
  const floorPlan = floorPlans.find((floorPlan: PlacezFixturePlan) => {
    return floorPlan?.id === layout.floorPlanId;
  });
  if (floorPlan) {
    const floorPlanLineItem = {
      description: floorPlan.name,
      price: floorPlan.price,
      priceRateInHours: floorPlan.priceRateInHours,
      taxRate,
      layoutId: layout.id,
      total: 0,
    };
    floorPlanLineItem.total = calcTotal(
      floorPlanLineItem,
      getLayoutDurationInHours(layout),
      taxRate
    );

    layoutPricing.push(floorPlanLineItem);
  }

  //get Asset Prices
  if (layout?.items?.length > 0) {
    const assets = layout.items.reduce(
      (accumulator: { [id: string]: InvoiceLineItem }, asset) => {
        if (getAssetPrice(asset.id, assetsBySku, costMultiplier)) {
          if (accumulator[asset.id]) {
            accumulator[asset.id].quantity++;
          } else {
            accumulator[asset.id] = {
              description: asset.name,
              quantity: 1,
              price: getAssetPrice(asset.id, assetsBySku, costMultiplier),
              priceRateInHours: getAssetPriceRate(asset.id, assetsBySku),
              taxRate,
              group: SkuType[asset.skuType],
            };
          }
        }

        //Chairs
        if (
          asset.modifiers?.chairMod?.seatPositions &&
          getAssetPrice(
            asset.modifiers?.chairMod?.chairAsset?.id,
            assetsBySku,
            costMultiplier,
            asset.modifiers?.chairMod?.seatPositions
          )
        ) {
          const chairMod = asset.modifiers.chairMod;

          const modifierChairAsset = asset.modifiers.chairMod?.chairAsset;
          if (accumulator[modifierChairAsset.id]) {
            accumulator[modifierChairAsset.id].quantity +=
              chairMod.seatPositions.filter((chair: SeatInstance) => {
                return !chair.hidden && chair.position.length > 0;
              }).length;
          } else {
            accumulator[modifierChairAsset.id] = {
              description: modifierChairAsset.name,
              quantity: chairMod.seatPositions.filter((chair: SeatInstance) => {
                return !chair.hidden && chair.position.length > 0;
              }).length,
              price: getAssetPrice(
                modifierChairAsset.id,
                assetsBySku,
                costMultiplier,
                asset.modifiers?.chairMod?.seatPositions
              ),
              priceRateInHours: getAssetPriceRate(
                modifierChairAsset.id,
                assetsBySku
              ),
            };
          }

          const modifierPlaceSettingAsset =
            asset.modifiers.placeSettingMod?.placeSettingAsset;
          if (
            getAssetPrice(
              modifierPlaceSettingAsset?.id,
              assetsBySku,
              costMultiplier,
              modifierPlaceSettingAsset
            )
          ) {
            if (accumulator[modifierPlaceSettingAsset.id]) {
              accumulator[modifierPlaceSettingAsset.id].quantity +=
                chairMod.seatPositions.filter((chair: SeatInstance) => {
                  return !chair.hidden && chair.position.length > 0;
                }).length;
            } else {
              accumulator[modifierPlaceSettingAsset.id] = {
                description: modifierPlaceSettingAsset.name,
                quantity: chairMod.seatPositions.filter(
                  (chair: SeatInstance) => {
                    return !chair.hidden && chair.position.length > 0;
                  }
                ).length,
                price: getAssetPrice(
                  modifierPlaceSettingAsset.id,
                  assetsBySku,
                  costMultiplier,
                  modifierPlaceSettingAsset
                ),
                priceRateInHours: getAssetPriceRate(
                  modifierPlaceSettingAsset.id,
                  assetsBySku
                ),
              };
            }
          }
        }

        // centerpiece
        const modifierCenterpieceAsset =
          asset.modifiers?.centerpieceMod?.centerpieceAsset;
        if (
          getAssetPrice(
            modifierCenterpieceAsset?.id,
            assetsBySku,
            costMultiplier,
            modifierCenterpieceAsset
          )
        ) {
          if (accumulator[modifierCenterpieceAsset.id]) {
            accumulator[modifierCenterpieceAsset.id].quantity +=
              asset.modifiers.centerpieceMod.numberOfCenterpieces;
          } else {
            accumulator[modifierCenterpieceAsset.id] = {
              description: modifierCenterpieceAsset.name,
              quantity: asset.modifiers.centerpieceMod.numberOfCenterpieces,
              price: getAssetPrice(
                modifierCenterpieceAsset.id,
                assetsBySku,
                costMultiplier,
                modifierCenterpieceAsset
              ),
              priceRateInHours: getAssetPriceRate(
                modifierCenterpieceAsset.id,
                assetsBySku
              ),
            };
          }
        }

        //
        const modifierLinenAsset = asset.modifiers?.linenMod?.linenAsset;
        if (
          getAssetPrice(
            modifierLinenAsset?.id,
            assetsBySku,
            costMultiplier,
            modifierLinenAsset
          )
        ) {
          const modifierLinenAsset = asset.modifiers.linenMod?.linenAsset;
          if (accumulator[modifierLinenAsset.id]) {
            accumulator[modifierLinenAsset.id].quantity++;
          } else {
            accumulator[modifierLinenAsset.id] = {
              description: modifierLinenAsset.name,
              quantity: 1,
              price: getAssetPrice(
                modifierLinenAsset.id,
                assetsBySku,
                costMultiplier,
                modifierLinenAsset
              ),
              priceRateInHours: getAssetPriceRate(
                modifierLinenAsset.id,
                assetsBySku
              ),
            };
          }
        }

        return accumulator;
      },
      {}
    );
    Object.keys(assets).forEach((key) => {
      layoutPricing.push(assets[key]);
    });
  }

  //Add custom lineitems
  if (layout.invoiceLineItems?.length) {
    layoutPricing = layoutPricing.concat(layout.invoiceLineItems);
  }

  if (layout.items?.length) {
    layoutPricing = layoutPricing.concat(
      layout.items.map((item) => ({
        ...item,
        description: item.name,
      }))
    );
  }
  layoutPricing = layoutPricing.map((invoiceLineItem: InvoiceLineItem) => {
    invoiceLineItem.total = calcTotal(
      invoiceLineItem,
      getLayoutDurationInHours(layout),
      taxRate
    );
    return invoiceLineItem;
  });
  return layoutPricing;
};

export const buildSceneLineItems = (
  layouts,
  floorPlans,
  assetsBySku,
  venues
): InvoiceLineItem[] => {
  let updatedData: InvoiceLineItem[] = [];
  layouts.forEach((layout: PlacezLayoutPlan) => {
    const floorPlan = floorPlans.find((floorPlan: PlacezFixturePlan) => {
      return floorPlan.id === layout.floorPlanId;
    });
    const costMultiplier =
      venues.find((venue) => venue.id === floorPlan?.placeId)?.costMultiplier ??
      1;
    updatedData = updatedData.concat(
      computeLayoutInvoice(
        layout,
        [floorPlan],
        assetsBySku,
        0,
        costMultiplier,
        true
      )
    );
  });
  return updatedData;
};

const cleanUpDecimal = (number): number => {
  return parseFloat(number.toFixed(2));
};

export const calcTotal = (
  lineItem: InvoiceLineItem,
  timeInHours: number,
  taxRate: number
): number => {
  if (lineItem === undefined) return 0;

  const quantity = lineItem.quantity ?? 1;
  const price = lineItem.price ?? 0;
  const priceRateInHours = lineItem.priceRateInHours ?? BillingRate.FlatRate;

  if (price) {
    switch (priceRateInHours) {
      case BillingRate.PerHour:
        return cleanUpDecimal(timeInHours * price * quantity * (1 + taxRate));
      case BillingRate.PerDay:
        return cleanUpDecimal(
          Math.ceil(timeInHours / 24) * price * quantity * (1 + taxRate)
        );
      case BillingRate.FlatRate:
      default:
        return cleanUpDecimal(price * quantity * (1 + taxRate));
    }
  } else {
    return undefined;
  }
};
