export default interface PlacezCameraState {
  id?: number;
  layoutId?: string;
  floorPlanId?: string;
  organizationId?: number;
  transformation?: number[];
  target?: number[];
  orthographicRotation?: number;
  orthographicState?: {
    id?: number;
    cameraStateId?: number;
    target: number[];
    rotation: number;
    zoom: number;
  };
  perspectiveState?: {
    id?: number;
    cameraStateId?: number;
    transformation: number[]; //position
    target: number[];
  };
}
