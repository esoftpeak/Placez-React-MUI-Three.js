import { PlacedMaterial } from './PlacezMaterial';

export default interface PlacezWall {
  id?: number;
  floorPlanId?: string;
  frontMaterialId?: string;
  backMaterialId?: string;
  organizationId?: number;
  corner1: string;
  corner2: string;
  hidden?: boolean;
  frontMaterial?: PlacedMaterial;
  backMaterial?: PlacedMaterial;
}
