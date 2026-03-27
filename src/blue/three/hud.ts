import { Item } from '../items/item';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import {
  CylinderGeometry,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  BufferAttribute,
  ConeGeometry,
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { IntersectionTypes } from './controller';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { ControllerType } from '../../models/BlueState';
import { Theme } from '@mui/material';

/**
 * Drawings on "top" of the scene. e.g. rotate arrows
 */
export enum RotationTypes {
  LocalRotation = 'localRotation',
  GlobalRotation = 'globalRotation',
  BatchRotation = 'batchRotation',
}

export const HUD = function (three: any) {
  const scope = this; // tslint:disable-line
  const scene = new Scene();

  this.hudColor = 'purple';
  this.hoverColor = 'lightPurple';

  const hudMaterial = new MeshBasicMaterial({
    color: this.hudColor,
    depthTest: false,
    depthWrite: false,
  });
  const invisibleMaterial = new MeshBasicMaterial({
    opacity: 0.0,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const textMaterial = new MeshBasicMaterial({
    color: 0xffffff,
    depthTest: false,
    depthWrite: false,
  });
  const testMaterial = new MeshBasicMaterial({
    color: 0xffff00,
    depthTest: false,
    depthWrite: false,
  });

  const minTorusDiam = 3;
  const minConeSize = 6;

  const loadFont = () => {
    const loader = new FontLoader();
    loader.load(`helvetiker_regular.typeface.json`, (loadedFont) => {
      scope.font = loadedFont;
    });
  };

  loadFont();

  let selectedItem: Item = null;
  let selectedItems: Item[] = [];

  let rotating: boolean = false;
  let mouseover: boolean = false;

  const tolerance: number = 10;
  const height: number = 5;
  const distance: number = 20;

  const activeObject: Object3D = new Object3D();

  this.setTheme = (theme: Theme) => {
    this.hudColor = three.theme.palette.primary.main;
    this.hoverColor = three.theme.palette.secondary.main;
  };

  this.getScene = (): Scene => {
    return scene;
  };

  this.getObject = (): Object3D => {
    return activeObject;
  };

  this.listener = () => {
    const state = store.getState() as ReduxState;
    if (state.blue.selectedItems.length > 0) {
      // TODO this is firing like crazy
      selectedItems = state.blue.selectedItems;
      itemSelected(state.blue.selectedItems);

      if (state.blue.activeController !== ControllerType.Main) {
        if (activeObject.visible) activeObject.visible = false;
      } else {
        if (!activeObject.visible) {
          this.update();
          activeObject.visible = true;
        }
      }
    } else {
      itemUnselected();
    }
  };

  this.init = () => {
    scope.unsubscribeStore = store.subscribe(scope.listener);
  };

  function resetSelectedItem() {
    selectedItem = null;
    if (activeObject) {
      scene.remove(activeObject);
      activeObject.clear();
    }
  }

  function itemSelected(itemList: Item[]) {
    const item = itemList[0];
    if (selectedItem !== item) {
      resetSelectedItem();
      if (item.allowRotate && !item.fixed) {
        selectedItem = item;
        scope.update();
        //TODO remove for new controller
        activeObject.add(makeRotationHandle(selectedItem));
        scene.add(activeObject);
      }
    }
  }

  function itemUnselected() {
    resetSelectedItem();
  }

  const getColor = (hover: boolean): string => {
    return this.hover ? this.hoverColor : this.hudColor;
  };

  this.setRotating = (isRotating: boolean) => {
    rotating = isRotating;
    hudMaterial.color.set(getColor(rotating));
    three.needsUpdate();
  };

  this.setMouseover = (isMousedOver: boolean) => {
    if (mouseover === isMousedOver) return;
    mouseover = isMousedOver;
    hudMaterial.color.set(getColor(mouseover));
    three.needsUpdate();
  };

  this.update = () => {
    if (!!activeObject && !!selectedItem) {
      activeObject.rotation.copy(selectedItem.rotation);
      activeObject.position.copy(selectedItem.position);
      // activeObject.rotation.y = selectedItem.rotation.y;
      // activeObject.position.x = selectedItem.position.x;
      // activeObject.position.z = selectedItem.position.z;
    }
  };

  function makeLineGeometry(item): BufferGeometry {
    const geometry = new BufferGeometry();

    const points = [new Vector3(0, 0, 0), rotateVector(item)];
    geometry.setFromPoints(points);

    return geometry;
  }

  function rotateVector(item): Vector3 {
    const vec = new Vector3(
      0,
      0,
      Math.max(item.halfSize.x, item.halfSize.z) + 1.4 + distance
    );
    return vec;
  }

  function makeLineMaterial(rotating) {
    const mat = new LineBasicMaterial({
      color: this.hudColor,
      linewidth: 3,
    });
    return mat;
  }

  function makeSphere(diameter?, material?): THREE.Mesh {
    const geometry = new SphereGeometry(diameter ? diameter : 0, 16, 16);
    const sphere = new Mesh(geometry, material ?? hudMaterial);
    return sphere;
  }

  function makeArrowObject(item): THREE.Object3D {
    const object = new Object3D();
    const line = new Line(
      makeLineGeometry(item),
      makeLineMaterial(scope.rotating)
    );

    const cone = makeCone(5, 10, hudMaterial);
    cone.position.copy(rotateVector(item));
    cone.rotation.x = -Math.PI / 2.0;
    const sphere = makeSphere();

    object.add(line);
    object.add(cone);
    object.add(sphere);

    object.rotation.y = item.rotation.y;
    object.position.x = item.position.x;
    object.position.z = item.position.z;
    object.position.y = height;

    return object;
  }

  function makeRotationHandle(item): THREE.Object3D {
    const object = new Object3D();
    const radius = Math.max(item.getWidth(), item.getDepth());

    if (selectedItems.length > 1) {
      object.add(
        scope.makeRotationTorus(
          radius,
          0.85,
          2,
          { name: RotationTypes.GlobalRotation },
          hudMaterial
        )
      );
    } else {
      object.add(
        scope.makeRotationTorus(
          radius,
          0.75,
          1,
          { name: RotationTypes.LocalRotation },
          hudMaterial
        )
      );
    }

    // object.rotation.y = item.rotation.y;
    // object.position.x = item.position.x;
    // object.position.z = item.position.z;
    // object.position.y = height;

    return object;
  }

  function makeCone(radius: number, height: number, hudMaterial): Mesh {
    const coneGeo = new CylinderGeometry(radius, 0, height);
    const cone = new Mesh(coneGeo, hudMaterial);
    return cone;
  }

  this.makeRotationTorus = (
    rad: number,
    scale: number = 1.15,
    numberOfArrows: number = 1,
    userData,
    material = hudMaterial
  ): THREE.Object3D => {
    const rotationHandle = new Object3D();
    rotationHandle.userData = userData;
    const arcFraction: number = 0.9;
    const size = 0.04;

    const radius = rad * scale;
    const scaledTubeSize: number = radius * size;
    const tubeSize: number = scaledTubeSize;

    const torusGeom = new TorusGeometry(
      radius,
      tubeSize,
      6,
      64,
      Math.PI * 2 * arcFraction
    );
    const torus = new Mesh(torusGeom, material);
    torus.renderOrder = 999;
    torus.userData = userData;
    torus.rotateX(Math.PI / 2);
    torus.rotateZ(Math.PI * 0.5 + (1 - arcFraction) * 0.5 * 2 * Math.PI);
    rotationHandle.add(torus);

    const scaledCone = radius * size * 2;
    const coneSize = scaledCone > minConeSize ? scaledCone : minConeSize;
    const cone = makeCone(scaledCone, scaledCone * 2, material);
    cone.renderOrder = 999;
    cone.userData = userData;

    for (let index = 1; index <= numberOfArrows; index++) {
      const arrow1 = new Object3D();
      arrow1.userData = userData;
      const cone1 = cone.clone();
      cone1.rotateZ(Math.PI / 2);
      cone1.position.set(0, 0, radius);
      arrow1.add(cone1);
      arrow1.rotateY(-2 * Math.PI * (1 - arcFraction) * 0.5 * index);
      rotationHandle.add(arrow1);

      const arrow2 = new Object3D();
      arrow2.userData = userData;
      const cone2 = cone.clone();
      cone2.rotateZ(-Math.PI / 2);
      cone2.position.set(0, 0, radius);
      arrow2.add(cone2);
      arrow2.rotateY(2 * Math.PI * (1 - arcFraction) * 0.5 * index);
      rotationHandle.add(arrow2);
    }
    const intersectionGeom = new TorusGeometry(
      radius,
      tubeSize * 3,
      6,
      64,
      Math.PI * 2
    );
    const intersectionMesh = new Mesh(intersectionGeom, invisibleMaterial);
    intersectionMesh.renderOrder = 999;
    intersectionMesh.userData = userData;
    intersectionMesh.rotateX(Math.PI / 2);
    intersectionMesh.rotateZ(
      Math.PI * 0.5 + (1 - arcFraction) * 0.5 * 2 * Math.PI
    );
    rotationHandle.add(intersectionMesh);
    rotationHandle.renderOrder = 999;

    return rotationHandle;
  };

  this.makeRotationHandle = (
    rad: number,
    userData,
    material = hudMaterial
  ): THREE.Object3D => {
    const rotationHandle = new Object3D();
    rotationHandle.userData = userData;
    const radius = rad * 1.3;
    const scale = 10;
    const tubeRadius = rad / 18;
    const tubeSize: number = radius / 80;

    const torusGeom = new TorusGeometry(
      tubeRadius,
      tubeSize,
      6,
      64,
      Math.PI * 2 * 0.75
    );
    const torus = new Mesh(torusGeom, material);
    torus.renderOrder = 999;
    torus.userData = userData;
    torus.rotateX(Math.PI / 2);
    torus.rotateZ(-Math.PI / 2);
    torus.position.set(0, 0, -radius);
    rotationHandle.add(torus);

    const height = tubeRadius;
    const arrowGeom = new ConeGeometry(tubeSize * 2, height, 32);
    const arrow = new Mesh(arrowGeom, material);
    arrow.rotateZ(Math.PI / 2);
    arrow.position.set(-height / 2, 0, -radius - tubeRadius);
    arrow.userData = userData;
    rotationHandle.add(arrow);

    const cylinderLengthScale = 1 / 8;

    const cylinderGeometry = new CylinderGeometry(
      tubeRadius / 4,
      tubeRadius / 4,
      radius * cylinderLengthScale,
      6,
      64,
      true
    );
    const cylinder = new Mesh(cylinderGeometry, material);
    cylinder.renderOrder = 999;
    cylinder.rotateX(Math.PI / 2);
    cylinder.userData = userData;
    cylinder.position.set(
      0,
      0,
      -radius + (radius * cylinderLengthScale) / 2 + tubeRadius
    );
    rotationHandle.add(cylinder);

    const intersectionGeom = new SphereGeometry(
      tubeRadius * 2,
      6,
      64,
      Math.PI * 2
    );
    const intersectionMesh = new Mesh(intersectionGeom, invisibleMaterial);
    intersectionMesh.renderOrder = 999;
    intersectionMesh.userData = userData;
    intersectionMesh.rotateX(Math.PI / 2);
    intersectionMesh.position.set(0, 0, -radius);
    rotationHandle.add(intersectionMesh);
    rotationHandle.renderOrder = 999;

    return rotationHandle;
  };

  this.makeCenterControl = (
    scale: number,
    x: number,
    y: number,
    z: number,
    name: IntersectionTypes,
    material = hudMaterial
  ): THREE.Object3D => {
    // const sphereHandle = makeSphereWithArrows(scale * 0.015);
    const sphereHandle = makeSphere(scale * 0.015);
    sphereHandle.userData.name = name;
    sphereHandle.position.set(x, y, z);
    const intersectionMesh = makeSphere(scale * 3 * 0.015, invisibleMaterial);
    intersectionMesh.userData.name = name;
    sphereHandle.add(intersectionMesh);
    intersectionMesh.renderOrder = 999;
    sphereHandle.renderOrder = 999;

    return sphereHandle;
  };

  this.makeSphereControl = (
    scale: number,
    x: number,
    y: number,
    z: number,
    name: IntersectionTypes,
    material = hudMaterial
  ): THREE.Object3D => {
    const sphereHandle = makeSphere(scale * 0.015, material);
    sphereHandle.userData.name = name;
    sphereHandle.position.set(x, y, z);
    const intersectionMesh = makeSphere(scale * 3 * 0.015, invisibleMaterial);
    intersectionMesh.userData.name = name;
    sphereHandle.add(intersectionMesh);
    intersectionMesh.renderOrder = 999;
    sphereHandle.renderOrder = 999;

    return sphereHandle;
  };

  this.makeLineControl = (endPosition: Vector3, material, handle) => {
    const lineControl = new Object3D();
    const geometry = new BufferGeometry();
    const positions = new Float32Array(6);
    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;

    positions[3] = endPosition.x;
    positions[4] = endPosition.y;
    positions[5] = endPosition.z;

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const sphere = makeSphere(
      20,
      new MeshBasicMaterial({
        color: material.color,
        depthTest: false,
        depthWrite: false,
      })
    );
    sphere.renderOrder = 999;
    const line = new Line(geometry, material);
    line.renderOrder = 999;

    lineControl.add(line);
    lineControl.add(sphere);
    lineControl.add(new Object3D()); //text
    // lineControl.traverse((obj) => obj.userData = handle)
    lineControl.children[1].userData = handle;

    lineControl.renderOrder = 999;

    return lineControl;
  };

  this.updateLineEnd = (
    lineControl: Object3D,
    newEndPosition: Vector3,
    updateText: number
  ) => {
    const line = lineControl.children[0] as Line;
    line.geometry.attributes.position.setXYZ(
      1,
      newEndPosition.x,
      newEndPosition.y,
      newEndPosition.z
    );
    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingBox();
    line.geometry.computeBoundingSphere();

    lineControl.children[1].position.copy(newEndPosition);

    if (lineControl.children[2]) lineControl.children[2].clear();

    const normalVec = new Vector3(
      line.geometry.attributes.position.array[3] -
        line.geometry.attributes.position.array[0],
      line.geometry.attributes.position.array[4] -
        line.geometry.attributes.position.array[1],
      line.geometry.attributes.position.array[5] -
        line.geometry.attributes.position.array[2]
    ).normalize();

    const textMesh = this.createText(
      updateText,
      lineControl.children[0].userData
    );
    const textSizeVec = new Vector3();
    (textMesh.children[0] as Mesh).geometry.boundingBox.getSize(textSizeVec);
    textMesh.position.add(newEndPosition);
    textMesh.position.add(normalVec.multiplyScalar(textSizeVec.length()));

    lineControl.children[2].add(textMesh);
  };

  this.updateLineMid = (
    lineControl: Object3D,
    newEndPosition: Vector3,
    updateText: number,
    otherHandles
  ) => {
    const line = lineControl.children[0] as Line;
    line.geometry.attributes.position.setXYZ(
      1,
      newEndPosition.x,
      newEndPosition.y,
      newEndPosition.z
    );
    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingBox();
    line.geometry.computeBoundingSphere();

    lineControl.children[1].position.copy(newEndPosition);

    if (lineControl.children[2]) lineControl.children[2].clear();

    const textMesh = this.createText(
      updateText,
      lineControl.children[0].userData
    );
    const textSizeVec = new Vector3();
    (textMesh.children[0] as Mesh).geometry.boundingBox.getSize(textSizeVec);

    textMesh.position.add(newEndPosition);

    if (otherHandles.length > 0) {
      otherHandles.forEach((handle) => {
        const dirVec = handle.patternTo.clone().normalize();
        textMesh.position.sub(dirVec.multiplyScalar(textSizeVec.length()));
      });
    } else {
      const orthoVec = newEndPosition
        .clone()
        .normalize()
        .applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
        .multiplyScalar(120);
      textMesh.position.sub(orthoVec);
    }

    lineControl.children[2].add(textMesh);
  };

  this.createText = (text, userData): Object3D => {
    const textContainer = new Object3D();
    const textGeometry = new TextGeometry(text, {
      font: scope.font,
      size: 40,
      bevelEnabled: false,
      depth: 5,
    });
    textGeometry.center();

    const textMesh = new Mesh(textGeometry, textMaterial);
    textMesh.userData = userData;
    textMesh.renderOrder = 999;
    textContainer.add(textMesh);
    textContainer.rotateX(-Math.PI / 2);

    return textContainer;
  };

  this.makeCenterDrag = (userData) => {
    const centerControl = new Object3D();
    centerControl.userData = userData;
    return centerControl;
  };

  const makeSphereWithArrows = (size, material = hudMaterial) => {
    const sphere = makeSphere(size, material);
    for (let index = 0; index < 4; index++) {
      const arrow = new Object3D();
      const cone = makeCone(size * 0.75, size * 2, material);
      cone.rotateX(Math.PI / 2);
      cone.position.set(0, 0, -size * 2.2);
      arrow.add(cone);
      arrow.rotateY((Math.PI / 2) * index);
      sphere.add(arrow);
    }
    return sphere;
  };

  this.updateCenterDrag = (centerControl, centerPosition, text, radius) => {
    centerControl.position.copy(centerPosition);

    if (centerControl.children) centerControl.clear();

    const centerDragMaterial = new MeshBasicMaterial({
      color: 0x5c236f,
      depthTest: false,
      depthWrite: false,
    });
    const size = radius > 0 ? radius / 20 : 10;
    // const sphere = makeSphereWithArrows(size, centerDragMaterial);
    const sphere = makeSphere(size, centerDragMaterial);
    sphere.userData = centerControl.userData;
    centerControl.add(sphere);

    if (text) {
      const textMesh = this.createText(text, centerControl.userData);
      centerControl.add(textMesh);
    }

    const intersectionSphere = makeSphere(size * 3, invisibleMaterial);
    intersectionSphere.renderOrder = 999;
    intersectionSphere.userData = centerControl.userData;
    centerControl.add(intersectionSphere);
    centerControl.renderOrder = 999;
  };

  this.makeGlobalRotation = (userData, radius) => {
    const rotationHandle = new Object3D();
    rotationHandle.userData = userData;
    rotationHandle.add(
      scope.makeRotationTorus(radius, 1.15, 1, userData, hudMaterial)
    );
    return rotationHandle;
  };
};
