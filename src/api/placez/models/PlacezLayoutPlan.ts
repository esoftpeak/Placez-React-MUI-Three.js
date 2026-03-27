import PlacezCameraState from './PlacezCameraState';
import MediaEntityBase from './MediaEntityBase';
import LayoutLabel from './LayoutLabel';
import DimensionParams from '../../../blue/model/dimensionParams';
import { ShapeParams } from '../../../blue/model/shapeParams';
import PlacedAsset from './PlacedAsset';
import { InvoiceLineItem } from '../../../components/Invoicing/InvoiceLineItemModel';

export default interface PlacezLayoutPlan extends MediaEntityBase {
  sceneId?: number;
  floorPlanId?: string;
  items?: PlacedAsset[];
  cameraState?: PlacezCameraState;
  arPath?: string;
  layoutLabels?: LayoutLabel[];
  dimensions?: DimensionParams[];
  price?: number;
  invoiceLineItems?: InvoiceLineItem[];
  hideInInvoice?: boolean;
  imageUrl?: string;
  shapes?: ShapeParams[];
  isTemplate?: boolean;
  //TODO
  excludeFromInvoice?: boolean;
  startUtcDateTime?: Date;
  endUtcDateTime?: Date;
  layoutBlob?: string;
  placeId?: number;
  type?: string;
  venue?: string;
  setupStyle?: string;
  notes?: string;
  //helper function for modal
  isCloseModalAndNavigateToScene?: () => void;
}

export const DefaultPlacezLayoutPlan: PlacezLayoutPlan = {
  name: '',
};
