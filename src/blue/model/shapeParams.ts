export type ShapeParams = LineParams | RectangleParams;

export interface Point {
  position: number[];
}

export interface LineParams {
  // will be a list of vector3.toArray()
  startPoint: Point;
  endPoint: Point;
  // MeshStandardMaterial
  fillMaterial?;
  // LineMaterial
  lineMateral?;
}

export interface RectangleParams {
  // will be a list of vector3.toArray()
  points: number[][];
  // MeshStandardMaterial
  fillMaterial?;
  // LineMaterial
  lineMateral?;
}
