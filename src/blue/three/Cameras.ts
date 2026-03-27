import { CameraType, ShaderView } from '../../components/Blue/models';
import { CameraLayers } from '../../models/BlueState';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import {
  Box2,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Vector2,
  Vector3,
} from 'three';

export interface TargetSpecs {
  size: { x: number; z: number };
  center: Vector3;
  centerOffset: Vector3;
  diagonal: number;
}

export class Cameras {
  public camera: PerspectiveCamera | OrthographicCamera;
  public pCamera: PerspectiveCamera;
  public oCamera: OrthographicCamera;
  public fpvCamera: PerspectiveCamera;
  public aspect: number = 1;
  public distance: number = 5000;
  public cameras: any[];
  public currentLayers: CameraLayers[];
  public needUpdate: boolean;
  public onUpdate: Function;
  private listener;
  private unsubscribeStore;

  constructor() {
    this.cameras = [];
    this.currentLayers = [];

    // Create default cameras
    this.pCamera = new PerspectiveCamera(45, 1, 1, 20000);
    this.cameras.push(this.pCamera);
    this.fpvCamera = new PerspectiveCamera(60, 1, 1, 20000);
    this.cameras.push(this.fpvCamera);
    this.oCamera = new OrthographicCamera(-800, 800, 800, -800, 1, 20000);
    this.cameras.push(this.oCamera);

    this.camera = this.oCamera;

    // this.init();
    this.listener = () => {
      const shaderView = (store.getState() as ReduxState).blue.shaderView;
      if (shaderView === ShaderView.BlackAndWhite) {
        this.oCamera.layers.disable(CameraLayers.FloorplaneImage);
        this.pCamera.layers.disable(CameraLayers.FloorplaneImage);
      }
    };
    this.unsubscribeStore = store.subscribe(this.listener);
  }

  public init = function () {
    this.initPerspectiveCamera();
    this.initOrthographicCamera();
    this.initFpvCamera();
  };

  public initCameraPosition = function (targetSpecs: TargetSpecs) {
    // Set camera at radial distance from center target
    this.oCamera.position.copy(targetSpecs.centerOffset);
    this.pCamera.position.copy(targetSpecs.centerOffset);
    this.fpvCamera.far = targetSpecs.diagonal * 3;
  };

  private updateRenderer = function () {
    this.needsUpdate = true;
    this.onUpdate();
  };

  public setCamera = function (camera: CameraType) {
    switch (camera) {
      case CameraType.Perspective:
        this.camera = this.pCamera;
        break;
      case CameraType.Orthographic:
        this.camera = this.oCamera;
        break;
      case CameraType.FPVCamera:
        this.camera = this.fpvCamera;
        break;
    }
    this.updateRenderer();
  };

  public initPerspectiveCamera = function () {
    this.pCamera.aspect = this.aspect;
    this.pCamera.near = 1;
    this.pCamera.updateProjectionMatrix();
  };

  public initOrthographicCamera = function () {
    const height = this.oCamera.top - this.oCamera.bottom;
    const width = height * this.aspect;
    this.oCamera.left = width / -2;
    this.oCamera.right = width / 2;
    this.oCamera.near = 1;
    this.oCamera.far = 1200;

    this.oCamera.updateProjectionMatrix();
  };

  public fitToView = (targetSpecs: TargetSpecs, rotation: number = 0) => {
    const cameraHeight = this.oCamera.top - this.oCamera.bottom;
    const cameraWidth = this.oCamera.right - this.oCamera.left;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

  // Calculate corners of the target
  const halfX = targetSpecs.size.x / 2;
  const halfZ = targetSpecs.size.z / 2;
  const corners = [
    new Vector2(halfX, halfZ),
    new Vector2(-halfX, halfZ),
    new Vector2(halfX, -halfZ),
    new Vector2(-halfX, -halfZ)
  ];

  // Project corners onto rotated camera space
  const rotatedCorners = corners.map(corner => {
    const rotatedX = corner.x * cos - corner.y * sin;
    const rotatedY = corner.x * sin + corner.y * cos;
    return new Vector2(rotatedX, rotatedY);
  });

  // Calculate new bounding box
  const boundingBox = new Box2();
  rotatedCorners.forEach(corner => boundingBox.expandByPoint(corner));

  // Calculate new diagonal
  const rotatedSize = boundingBox.getSize(new Vector2());
    // Calculate the aspect ratio of the camera and the rotated target
  const cameraAspect = cameraWidth / cameraHeight;
  const targetAspect = rotatedSize.x / rotatedSize.y;

  // Determine which dimension to use for zoom calculation
  if (targetAspect > cameraAspect) {
    // Target is wider relative to its height than the camera view
    this.oCamera.zoom = cameraWidth / rotatedSize.x * 0.95;
  } else {
    // Target is taller relative to its width than the camera view
    this.oCamera.zoom = cameraHeight / rotatedSize.y * 0.95;
  }
    this.oCamera.updateProjectionMatrix();
  };

  public getCameraType = function (): CameraType {
    if (this.camera === this.oCamera) {
      return CameraType.Orthographic;
    } else {
      return CameraType.Perspective;
    }
  };

  public initFpvCamera = function () {
    this.fpvCamera.aspect = this.aspect;
    this.fpvCamera.near = 1;

    this.fpvCamera.updateProjectionMatrix();
  };

  public updateAspect = (elementWidth, elementHeight, targetSpecs) => {
    if (elementHeight === 0 || elementWidth === 0) return;
    this.aspect = elementWidth / elementHeight;
    this.initPerspectiveCamera();
    this.initOrthographicCamera();
    this.initFpvCamera();
  };

  public setCameraLayers = (layers: CameraLayers[], cb?: any) => {
    const { cameraLayers } = (store.getState() as ReduxState).blue;
    const newLayers = layers ?? cameraLayers;
    const isEqual =
      newLayers.length === this.currentLayers.length &&
      this.currentLayers.every((val) => newLayers.includes(val));
    if (isEqual) return;
    this.cameras.forEach((camera) => {
      camera.layers.set(0);
      newLayers.forEach((layer: CameraLayers) => {
        camera.layers.enable(layer);
      });
      const shaderView = (store.getState() as ReduxState).blue.shaderView;
      if (shaderView === ShaderView.BlackAndWhite) {
        camera.layers.disable(CameraLayers.FloorplaneImage);
      }
    });
    this.currentLayers = newLayers;
    if (cb) {
      cb();
    }
  };

  public updateCamera = (
    camera: CameraType,
    position: Vector3,
    quaternion: Quaternion,
    scale: Vector3
  ) => {
    if (camera === CameraType.Perspective) {
      this.pCamera.position.copy(position);
      this.pCamera.setRotationFromQuaternion(quaternion);
      this.pCamera.scale.copy(scale);
      this.pCamera.updateMatrix();
      this.pCamera.updateMatrixWorld();
    }
  };

  public dispose = () => {
    this.unsubscribeStore();
  };
}
