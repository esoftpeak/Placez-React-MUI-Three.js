export default interface DimensionParams {
  id: number;
  layoutId?: string;
  floorPlanId?: string;
  organizationId?: number;
  startPoint: number[];
  endPoint: number[];
}
