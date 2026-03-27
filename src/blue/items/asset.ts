import { AssetClassType } from './factory';
import { PlacedMaterial } from '../../api/placez/models/PlacezMaterial';
import { ChairParams } from '../itemModifiers/ChairMod';
import { LinenParams } from '../itemModifiers/LinenMod';
import { PlaceSettingParams } from '../itemModifiers/PlaceSettingMod';
import { CenterpieceParams } from '../itemModifiers/CenterpieceMod';
import { ArchitectureParams } from '../itemModifiers/ArchitectureMod';
import { UplightParams } from '../itemModifiers/UplightMod';

export interface Asset {
  id: number;
  sku: string;
  skuType?: SkuType;
  previewPath?: string;
  previewUrl?: string;
  resourcePath?: string;
  classType: AssetClassType;
  species: string;
  tags: string[];
  name: string;
  createdOn: string;
  modifiedOn: string;
  transformation: number[];
  spacing: number;
  groupId?: string;
  fromScene?: boolean;
  gltf?: THREE.Mesh;
  resizable: boolean;
  modifiers?: AssetModifiers;
  description?: string;
  vendor?: string;
  vendorSku?: string;
  extensionProperties: ExtensionProperties;
  instanceId?: string;
  showLabel: boolean;
  labels: Labels;
  materialMask: PlacedMaterial[];
  custom?: boolean;
  children?: THREE.Mesh[];
  price?: number;
  priceRateInHours?: number;
  cost?: number;
  organizationId?: number;
}

export interface AssetModifiers {
  chairMod?: ChairParams;
  linenMod?: LinenParams;
  placeSettingMod?: PlaceSettingParams;
  centerpieceMod?: CenterpieceParams;
  architectureMod?: ArchitectureParams;
  uplightMod?: UplightParams;
}

export enum AssetModifierKeys {
  chairMod = 'chairMod',
  centerpieceMod = 'centerpieceMod',
  linenMod = 'linenMod',
  placeSettingMod = 'placeSettingMod',
  architectureMod = 'architectureMod',
  uplightMod = 'uplightMod',
}

export interface ExtensionProperties {
  enviromentMap?: boolean;
  mask?: boolean;
  fontSize?: number;
  progenitorId?: string;
  hidden?: boolean;
  fixed?: boolean;
  excludeFromChairCount?: boolean;
  spacingLocked?: boolean;
}

export interface Labels {
  titleLabel: string;
  numberLabel?: string;
  tableNumberLabel?: string;
}

export enum AssetSpeciesType {
  Table = 'Table',
  Chair = 'Chair',
  Fork = 'Fork',
  TableSetting = 'TableSetting',
}

export interface Constraint {
  appliesTo: AssetSpeciesType;
  constraint: number[];
}

export enum SkuType {
  ACC = 'Accessories',
  APL = 'Appliance',
  ACH = 'Arches',
  BAR = 'Bars',
  BED = 'Bed',
  BEN = 'Bench',
  CAB = 'Cabinets',
  CHR = 'Chairs',
  CCH = 'Couch',
  DSH = 'Place Setting',
  DOR = 'Doors',
  AV = 'Electronics',
  GYM = 'Gym Equipment',
  LSC = 'Landscape',
  LTE = 'Lights',
  LIN = 'Linen',
  MAM = 'Animal',
  BLD = 'Miscellaneous Building',
  PIC = 'Wall Art',
  PLN = 'Plant',
  PLM = 'Plumbing Supplies',
  POD = 'Podiums',
  PRP = 'Props',
  RAC = 'Racks',
  FLR = 'Floor Item',
  STG = 'Stages',
  STL = 'Stools',
  TBL = 'Table',
  TNT = 'Tents',
  TRL = 'Trellis',
  WF = 'Water Feature',
  WIN = 'Window',
}
