import { Edge } from './edge';
import { Floor } from './floor';

export const Floorplan = function (scene, floorplan, controls) {
  const scope = this; // tslint:disable-line

  this.scene = scene;
  this.floorplan = floorplan;
  this.controls = controls;

  this.floors = [];
  this.edges = [];

  // TODO:
  const redraw = () => {
    // clear scene
    scope.floors.forEach((floor: Floor) => {
      floor.removeFromScene();
    });

    scope.edges.forEach((edge: any) => {
      edge.remove();
    });
    scope.floors = [];
    scope.edges = [];

    // draw floors
    scope.floorplan.rooms.forEach((room: any) => {
      const threeFloor = new Floor(scene, room);
      scope.floors.push(threeFloor);
    });

    // draw edges
    scope.floorplan.wallEdges().forEach((edge: any) => {
      const threeEdge = new Edge(scene, edge, scope.controls);
      scope.edges.push(threeEdge);
    });
  };

  scope.floorPlaneMeshes = () =>
    scope.floors
      .map((floor: Floor) => floor.floorPlane)
      .filter((floor: Floor) => floor !== undefined);

  floorplan.fireOnUpdatedRooms(redraw);
};
