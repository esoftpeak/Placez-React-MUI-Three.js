import { Utils } from '../core/utils';
import { CameraLayers } from '../../models/BlueState';
import {
  PlacezMaterial,
  DefaultWallMaterial,
  DefaultMaterialIds,
  PlacedMaterial,
} from '../../api/placez/models/PlacezMaterial';

import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Path,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from 'three';
import produce from 'immer';
import { RenderOrder } from '../../api/placez/models/UserSetting';

const topColor = new Color(0xdddddd).convertSRGBToLinear();
const sideColor = new Color(0xcccccc).convertSRGBToLinear();
const baseColor = new Color(0xcccccc).convertSRGBToLinear();

const sideFillerMaterial = new MeshBasicMaterial({
  color: sideColor,
});
const topFillerMaterial = new MeshBasicMaterial({
  side: BackSide,
  color: topColor,
});
const baseFillerMaterial = new MeshBasicMaterial({
  side: BackSide,
  color: baseColor,
  depthTest: false,
});

export const Edge = function (scene, edge, controls) {
  // const color = scene.theme.palette.text.primary;
  const color = '#525252';
  baseFillerMaterial.color.setStyle(color);
  const scope = this; // tslint:disable-line
  const wall = edge.wall;
  const front = edge.front;
  this.uuid = Utils.guid();
  this.scene = scene;
  this.textureSettings = edge.getMaterial();

  // let mergedWall;
  let planes = [];
  let basePlanes = []; // always visible

  // const lightMap = scene.textureLoader.load('https://placez-cdn.azurewebsites.net/rooms/textures/walllightmap.png');

  this.visible = true;

  this.remove = () => {
    edge.redrawCallbacks.remove(redraw);
    if (!scene.model.floorplan.hideWalls) {
      controls.removeEventListener('change', updateVisibility);
    }
    removeFromScene();
  };

  const init = () => {
    edge.redrawCallbacks.add(redraw);
    if (!scene.model.floorplan.hideWalls) {
      controls.addEventListener('change', updateVisibility);
    }
    redraw(this.textureSettings);
  };

  const redraw = (material?: PlacezMaterial) => {
    if (material || this.textureSettings !== edge.getMaterial()) {
      const existingMaterial = material ?? edge.getMaterial();
      const newMat: PlacedMaterial = produce<PlacezMaterial>(
        existingMaterial,
        (draftState: PlacedMaterial) => {
          draftState.appliedMaterialId = draftState.appliedMaterialId || DefaultMaterialIds.defaultWallMaterial;
          return draftState;
        }
      );

      if (
        newMat.appliedMaterialId === DefaultMaterialIds.defaultWallMaterial &&
        scene.model.floorplan.defaultWallMaterial !== undefined
      ) {
        this.wallMaterial = scene.model.floorplan.defaultWallMaterial.clone();
        Utils.applyMaterialModifiers(this.wallMaterial, newMat.threeJSMaterial);

        Utils.setRepeatScale(
          this.wallMaterial,
          edge.interiorDistance(),
          wall.height,
          newMat.scale,
          newMat.threeJSMaterial
        );
        updatePlanes();
        addToScene();
        this.scene.needsUpdate = true;
      } else {
        Utils.loadMaterial(newMat, DefaultWallMaterial).then(
          (mat: MeshPhysicalMaterial) => {
            Utils.applyMaterialModifiers(mat, newMat.threeJSMaterial);
            this.wallMaterial = mat;
            this.wallMaterial.side = FrontSide;
            this.wallMaterial.depthTest = true;
            Utils.setRepeatScale(
              this.wallMaterial,
              edge.interiorDistance(),
              wall.height,
              newMat.scale,
              newMat.threeJSMaterial
            );
            this.wallMaterial.needsUpdate = true;

            updatePlanes();
            addToScene();
            this.scene.needsUpdate = true;
          }
        );
      }
    } else if (this.wallMaterial) {
      updatePlanes();
      addToScene();
      this.scene.needsUpdate = true;
    }
  };

  const removeFromScene = () => {
    planes.forEach((plane: any) => {
      scene.remove(plane);
      plane.geometry.dispose();
      if (plane.material.map) {
        plane.material.map.dispose();
      }
      plane.material.dispose();
    });
    // scene.remove(mergedWall);
    basePlanes.forEach((plane: any) => {
      scene.remove(plane);
      plane.geometry.dispose();
      plane.material.dispose();
    });
    planes = [];
    basePlanes = [];
  };

  const addToScene = () => {
    planes.forEach((plane: any) => {
      scene.add(plane);
    });
    // Wall compression into 2 nodes
    // mergedWall = Utils.mergeMeshes(planes, false);
    // scene.add(mergedWall);
    basePlanes.forEach((plane: any) => {
      scene.add(plane);
    });
    updateVisibility();
    scene.needsUpdate = true;
  };

  // it is not this
  const updateVisibility = (e?: any) => {
    if (e && e.showAll && !wall.hidden) {
      scope.visible = true;
    } else {
      // finds the normal from the specified edge
      const start = edge.interiorStart();
      const end = edge.interiorEnd();
      const x = end.x - start.x;
      const y = end.y - start.y;
      // rotate 90 degrees CCW

      const normal = new Vector3(-y, 0, x);
      const up = new Vector3(0, 1, 0);
      normal.normalize();

      // setup camera
      const position = controls.object.position.clone();
      position.sub(controls.target);
      position.normalize();

      // Set visible based on wall direction
      const dot = normal.dot(position);
      scope.visible = dot >= -0.1;

      // Set visible based on polar angle
      // const dotUp = up.dot(position);
      // scope.visible = (dotUp >= 0.5);

      scope.visible =
        !scene.model.floorplan.hideWalls && scope.visible && !wall.hidden;
    }

    // show or hide plans
    planes.forEach((plane: any) => {
      plane.visible = scope.visible;
      // plane.material.transparent = !scope.visible;
      // plane.material.needsUpdate = true;
    });

    updateObjectVisibility();
  };

  const updateObjectVisibility = () => {
    wall.items.forEach((item: any) => {
      item.updateEdgeVisibility(scope.visible, front);
    });
    wall.onItems.forEach((item: any) => {
      item.updateEdgeVisibility(scope.visible, front);
    });
  };

  const updatePlanes = () => {
    removeFromScene();
    if (!scene.model.floorplan.hideWalls) {
      // exterior plane
      planes.push(
        makeWall(
          edge.exteriorStart(),
          edge.exteriorEnd(),
          edge.exteriorTransform,
          edge.invExteriorTransform,
          this.wallMaterial
        )
      );

      // interior plane
      planes.push(
        makeWall(
          edge.interiorStart(),
          edge.interiorEnd(),
          edge.interiorTransform,
          edge.invInteriorTransform,
          this.wallMaterial
        )
      );

      // top
      planes.push(buildTopFiller(edge, wall.height, BackSide, topColor));

      // sides
      planes.push(
        buildSideFillter(
          edge.exteriorStart(),
          edge.interiorStart(),
          wall.height,
          sideColor
        )
      );

      planes.push(
        buildSideFillter(
          edge.interiorEnd(),
          edge.exteriorEnd(),
          wall.height,
          sideColor
        )
      );

      planes.forEach((mesh) => {
        mesh.layers.set(CameraLayers.Walls);
      });
    }

    // basePlanes are always visible
    basePlanes.push(buildBaseFiller(edge, 0, BackSide, baseColor));

    basePlanes.forEach((mesh) => {
      mesh.layers.set(CameraLayers.BasePlanes);
    });
  };

  // start, end have x and y attributes (i.e. corners)
  const makeWall = (start, end, transform, invTransform, material) => {
    const v1 = toVec3(start);
    const v2 = toVec3(end);
    const v3 = v2.clone();
    v3.y = wall.height;
    const v4 = v1.clone();
    v4.y = wall.height;

    const points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

    points.forEach((p: any) => {
      p.applyMatrix4(transform);
    });

    const shape = new Shape([
      new Vector2(points[0].x, points[0].y),
      new Vector2(points[1].x, points[1].y),
      new Vector2(points[2].x, points[2].y),
      new Vector2(points[3].x, points[3].y),
    ]);

    // add holes for each wall item
    if (wall.cutHoles) {
      wall.items.forEach((item: any) => {
        const pos = item.position.clone();
        pos.applyMatrix4(transform);
        const halfSize = new Vector3(
          item.getWidth() / 2,
          item.getHeight() / 2,
          item.getDepth() / 2
        );
        const min = halfSize.clone().multiplyScalar(-1);
        const max = halfSize.clone();
        min.add(pos);
        max.add(pos);

        const holePoints = [
          new Vector2(min.x, min.y),
          new Vector2(max.x, min.y),
          new Vector2(max.x, max.y),
          new Vector2(min.x, max.y),
        ];

        let intersects;
        shape.holes.forEach((hole: Path) => {
          holePoints.forEach((point: Vector2) => {
            intersects = intersects || Utils.pointInPath(point, hole);
          });
        });

        if (!intersects) {
          shape.holes.push(new Path(holePoints));
        }
      });
    }

    const geometry = new ShapeGeometry(shape);

    const positionBuffer = geometry.getAttribute('position').array;

    const vertices = [...positionBuffer]
      .reduce((acc, p, index) => {
        if (index % 3 !== 0) return acc;
        acc.push(
          new Vector3(
            positionBuffer[index],
            positionBuffer[index + 1],
            positionBuffer[index + 2]
          )
        );
        return acc;
      }, [])
      .map((vec) => {
        return vec.applyMatrix4(invTransform);
      });

    geometry.setFromPoints(vertices);

    // make UVs
    const totalDistance = Utils.distance(v1.x, v1.z, v2.x, v2.z);
    const height = wall.height;
    const uvs = vertices.map((vec: Vector3) => {
      return new Vector2(
        Utils.distance(v1.x, v1.z, vec.x, vec.z) / totalDistance,
        vec.y / height
      );
    });
    const uvBuffer = new Float32BufferAttribute(
      uvs.reduce((acc, vec: Vector2) => {
        acc.push(...vec.toArray());
        return acc;
      }, []),
      2
    );

    geometry.setAttribute('uv', uvBuffer);
    geometry.getAttribute('uv').needsUpdate = true;

    const mesh = new Mesh(geometry, material);

    mesh.receiveShadow = true;
    mesh.castShadow = false;

    return mesh;
  };

  const buildSideFillter = (p1, p2, height, color) => {
    const corners = [
      toVec3(p1),
      toVec3(p2),
      toVec3(p2, height),
      toVec3(p1, height),
    ];

    const geometry = new BufferGeometry();

    const points = Utils.cornersToRectPoints(corners);
    geometry.setFromPoints(points);
    geometry.computeVertexNormals();

    const fillerMaterial = new MeshBasicMaterial({
      color,
      side: FrontSide,
      opacity: this.wallMaterial?.opacity ?? 1.0,
      transparent: this.wallMaterial?.transparent ?? false,
    });

    if (this.wallMaterial?.transparent) {
      const filler = new Mesh(geometry, fillerMaterial);
      return filler;
    }
    const filler = new Mesh(geometry, sideFillerMaterial);
    return filler;
  };

  const buildTopFiller = (edge, height, side, color) => {
    const points = [
      toVec2(edge.exteriorStart()),
      toVec2(edge.exteriorEnd()),
      toVec2(edge.interiorEnd()),
      toVec2(edge.interiorStart()),
    ];

    const fillerMaterial = new MeshBasicMaterial({
      color,
      side,
      opacity: this.wallMaterial?.opacity ?? 1.0,
      transparent: this.wallMaterial?.transparent ?? false,
    });

    const shape = new Shape(points);
    const geometry = new ShapeGeometry(shape);

    let filler;
    if (this.wallMaterial?.transparent) {
      filler = new Mesh(geometry, fillerMaterial);
    } else {
      filler = new Mesh(geometry, topFillerMaterial);
    }
    filler.rotation.set(Math.PI / 2, 0, 0);
    filler.position.y = height;

    return filler;
  };

  const buildBaseFiller = (edge, height, side, color) => {
    const points = [
      toVec2(edge.exteriorStart()),
      toVec2(edge.exteriorEnd()),
      toVec2(edge.interiorEnd()),
      toVec2(edge.interiorStart()),
    ];

    const shape = new Shape(points);
    const geometry = new ShapeGeometry(shape);

    const filler = new Mesh(geometry, baseFillerMaterial);
    filler.rotation.set(Math.PI / 2, 0, 0);
    filler.position.y = height;
    filler.renderOrder = RenderOrder.BaseEdge;

    return filler;
  };

  const toVec2 = (pos) => {
    return new Vector2(pos.x, pos.y);
  };

  const toVec3 = (pos, height?) => {
    return new Vector3(pos.x, height || 0, pos.y);
  };

  init();
};
