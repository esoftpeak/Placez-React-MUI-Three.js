import { Photosphere } from '../../../components/Blue/models/Photosphere';
import PlacezWall from './PlazcezWall';
import PlacezCameraState from './PlacezCameraState';
import PlacezCorner from './PlacezCorner';
import { PlacedMaterial } from './PlacezMaterial';
import MediaEntityBase from './MediaEntityBase';
import LayoutLabel from './LayoutLabel';
import { SceneScan } from '../../../blue/items/sceneScan';
import DimensionParams from '../../../blue/model/dimensionParams';
import PlacedAsset from './PlacedAsset';

export default interface PlacezFixturePlan extends MediaEntityBase {
  fixtures?: PlacedAsset[];
  placeId?: number;
  corners: { [id: string]: PlacezCorner };
  walls: PlacezWall[];
  photoSpheres?: Photosphere[];
  floorplanImageScale?: number;
  floorplanImageUrl?: string;
  wallHeight?: number;
  hideWalls?: boolean;
  cameraState?: PlacezCameraState;
  floorTextures?: { [id: string]: PlacedMaterial };
  floorplanLabels?: LayoutLabel[];
  sceneScans?: SceneScan[];
  thumbnailUrl?: string;
  price?: number;
  priceRateInHours?: number;
  dimensions?: DimensionParams[];
  previewImage?: string;
  groupId?: string;
  instanceId?: string;
  fixturePlanBlob?: string;
  maxCapacity?: number;
  isFromNewEvent?: boolean;
}
