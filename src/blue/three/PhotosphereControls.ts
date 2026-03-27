import {
  Euler,
  Vector3,
  Vector2,
  Mesh,
  Object3D,
  PerspectiveCamera,
} from 'three';
import { store } from '../../';
import { GlobalViewState, PhotosphereSetup } from '../../models/GlobalState';
import { UpdatePhotosphereSetup } from '../../reducers/globalState';
import { ReduxState } from '../../reducers';
import { CameraLayers } from '../../models/BlueState';
import { Utils } from '../core/utils';
import { CSS3DLabelMaker } from './CSS3DlabelMaker';

export class PhotosphereControls {
  protected rateModifier = 0.002;
  private scene;
  private unsubscribeStore: Function;
  private yVec: Vector3 = new Vector3(0, 1, 0);

  public photosphere: Object3D;
  public range: number;
  public camera: PerspectiveCamera;
  public photoSphereSetup: PhotosphereSetup;
  public domElement: HTMLElement;
  public euler: Euler;
  public PI_2: number;
  public autoRotate: boolean;

  public touchStart: Vector2;

  public heightSprite: Object3D;
  public heightLabel: CSS3DLabelMaker;

  private globalViewState: GlobalViewState;
  public needsUpdate: boolean;

  constructor(camera: PerspectiveCamera, domElement: HTMLElement, scene) {
    this.range = 200;
    this.scene = scene;
    this.camera = camera;
    this.camera.zoom = 1;
    this.photoSphereSetup = PhotosphereSetup.Home;
    this.domElement = domElement;
    this.euler = new Euler(0, 0, 0, 'YXZ');
    this.PI_2 = Math.PI / 2;
    this.updatePhotosphereSetup(
      (store.getState() as ReduxState).globalstate.photoSphereSetup
    );
    this.autoRotate = (
      store.getState() as ReduxState
    ).blue.autoRotatePhotosphereCamera;
    this.unsubscribeStore = store.subscribe(this.listener);
    this.touchStart = new Vector2();
    this.globalViewState = (
      store.getState() as ReduxState
    ).globalstate.globalViewState;
  }

  listener = () => {
    const state = store.getState() as ReduxState;
    if (this.photoSphereSetup !== state.globalstate.photoSphereSetup) {
      this.updatePhotosphereSetup(state.globalstate.photoSphereSetup);
    }
    this.autoRotate = state.blue.autoRotatePhotosphereCamera;
  };

  updatePhotosphereSetup = (currentPhotosphereSetup: PhotosphereSetup) => {
    this.photoSphereSetup = currentPhotosphereSetup;

    if (
      this.photoSphereSetup === PhotosphereSetup.ChangeHeight ||
      this.photoSphereSetup === PhotosphereSetup.ChangeHeightModified
    ) {
      this.scene.add(this.heightSprite);
      this.updateHeightValue(this.heightLabel, this.camera);
    } else {
      this.scene?.remove(this.heightSprite);
    }
  };

  private logKey = (e: KeyboardEvent) => {
    if (
      this.photoSphereSetup === PhotosphereSetup.MoveFloor ||
      this.photoSphereSetup === PhotosphereSetup.MoveFloorModified
    ) {
      const direction = new Vector3();
      this.getDirection(direction);
      direction.setY(0);
      direction.multiplyScalar(10);

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          const up = direction.clone();
          up.multiplyScalar(-1);
          this.photosphere.position.add(up);
          break;
        case 'KeyS':
        case 'ArrowDown':
          const down = direction.clone();
          this.photosphere.position.add(down);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          const left = direction.clone();
          left.applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);
          this.photosphere.position.add(left);
          break;
        case 'KeyD':
        case 'ArrowRight':
          const right = direction.clone();
          right.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
          this.photosphere.position.add(right);
          break;
      }
      this.camera.position.copy(this.photosphere.position);
      if (this.photoSphereSetup === PhotosphereSetup.MoveFloor) {
        store.dispatch(
          UpdatePhotosphereSetup(PhotosphereSetup.MoveFloorModified)
        );
      }
      e.stopPropagation();
    }
  };

  private onWheel = (e: WheelEvent) => {
    if (this.photosphere === undefined) return;
    switch (this.photoSphereSetup) {
      case PhotosphereSetup.Home:
      case PhotosphereSetup.HomeModified:
        if (e.deltaY < 0) {
          this.photosphere.scale.multiplyScalar(1.01);
        } else {
          this.photosphere.scale.multiplyScalar(0.99);
        }
        if (this.photoSphereSetup === PhotosphereSetup.Home) {
          store.dispatch(UpdatePhotosphereSetup(PhotosphereSetup.HomeModified));
        }
        break;
      case PhotosphereSetup.View:
        if (e.deltaY < 0) {
          this.camera.zoom += 0.1;
        } else {
          if (this.camera.zoom <= 1) return;
          this.camera.zoom -= 0.1;
        }
        this.camera.updateProjectionMatrix();
        break;
      default:
        break;
    }
    e.stopPropagation();
  };

  private onMove = (delta: Vector2) => {
    switch (this.photoSphereSetup) {
      case PhotosphereSetup.View:
      case PhotosphereSetup.Home:
      case PhotosphereSetup.HomeModified:
        this.rotateCamera(delta);
        if (
          this.photoSphereSetup === PhotosphereSetup.Home &&
          this.globalViewState === GlobalViewState.Fixtures
        ) {
          store.dispatch(UpdatePhotosphereSetup(PhotosphereSetup.HomeModified));
        }
        break;
      case PhotosphereSetup.MoveFloor:
      case PhotosphereSetup.MoveFloorModified:
        this.translatePhotosphere(delta);
        if (this.photoSphereSetup === PhotosphereSetup.MoveFloor) {
          store.dispatch(
            UpdatePhotosphereSetup(PhotosphereSetup.MoveFloorModified)
          );
        }
        break;
      case PhotosphereSetup.RotateSphere:
      case PhotosphereSetup.RotateSphereModified:
        this.rotatePhotosphere(delta);
        if (this.photoSphereSetup === PhotosphereSetup.RotateSphere) {
          store.dispatch(
            UpdatePhotosphereSetup(PhotosphereSetup.RotateSphereModified)
          );
        }
        break;
      case PhotosphereSetup.ChangeHeight:
      case PhotosphereSetup.ChangeHeightModified:
        this.changeHeight(delta);
        this.updateHeightValue(this.heightLabel, this.camera);
        if (this.photoSphereSetup === PhotosphereSetup.ChangeHeight) {
          store.dispatch(
            UpdatePhotosphereSetup(PhotosphereSetup.ChangeHeightModified)
          );
        }
        break;
      default:
        break;
    }
  };

  private translatePhotosphere = (movement: Vector2) => {
    const direction = new Vector3();
    this.getDirection(direction);
    direction.setY(0);
    const up = direction.clone();
    up.multiplyScalar(movement.y);
    this.photosphere.position.add(up);

    const left = direction.clone();
    left.applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);
    left.multiplyScalar(-movement.x);
    this.photosphere.position.add(left);

    this.camera.position.copy(this.photosphere.position);
  };

  onMouseMove = (event) => {
    if (event.buttons !== 1 && event.buttons !== 2) return;
    const movementX =
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY =
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    if (movementX > this.range || movementX < -this.range) return;
    const delta = new Vector2(movementX, movementY);

    if (event.buttons === 1) {
      this.onMove(delta);
    }
    if (event.buttons === 2) {
      this.rotateCamera(delta);
      if (this.photoSphereSetup === PhotosphereSetup.Home) {
        store.dispatch(UpdatePhotosphereSetup(PhotosphereSetup.HomeModified));
      }
    }
    event.preventDefault();
    event.stopPropagation();
  };

  private rotateCamera = (movement: Vector2) => {
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y += movement.x * this.rateModifier;
    this.euler.x += movement.y * this.rateModifier;
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  };

  private rotatePhotosphere = (movement: Vector2) => {
    const euler = new Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(this.photosphere.quaternion);
    euler.y += movement.x * this.rateModifier;
    this.photosphere.quaternion.setFromEuler(euler);
    this.photosphere.updateMatrix();

    const cameraEuler = new Euler(0, 0, 0, 'YXZ');

    cameraEuler.setFromQuaternion(this.camera.quaternion);
    cameraEuler.y += movement.x * this.rateModifier;
    const PI_2 = Math.PI / 2;
    cameraEuler.x = Math.max(-PI_2, Math.min(PI_2, cameraEuler.x));

    this.camera.quaternion.setFromEuler(cameraEuler);
  };

  private changeHeight = (movement: Vector2) => {
    this.photosphere.position.add(new Vector3(0, movement.y, 0));
    this.camera.position.add(new Vector3(0, movement.y, 0));
  };

  public drawHeight = () => {
    this.heightLabel = new CSS3DLabelMaker(
      {
        // textColor: this.scene ? this.scene.theme.palette.primary.main : '#ffffff',
        textColor: '#ffffff',
        backgroundColor: this.scene
          ? this.scene.theme.palette.primary.main
          : '#ffffff',
        labelText: `Height:
${Utils.unitsOutString(this.photosphere.position.y)}`,
        margin: 2,
        borderRadius: 5,
        borderThickness: 2,
        fontSize: 14,
      },
      CameraLayers.Default
    );

    this.heightSprite = this.heightLabel.getObject();
  };

  public updateHeightValue = (
    label: CSS3DLabelMaker,
    camera: PerspectiveCamera
  ) => {
    if (this.photosphere !== undefined) {
      label.updateParameters({
        labelText: `Height: ${Utils.unitsOutString(this.photosphere.position.y)}`,
      });

      const distance = 200;
      const dir = new Vector3(0, 0, -distance);
      dir.applyQuaternion(camera.quaternion);
      dir.add(camera.position);
      this.heightSprite.position.copy(dir);
      this.heightSprite.quaternion.copy(camera.quaternion);
    }
  };

  public onTouchStart = (event: TouchEvent) => {
    event.preventDefault();

    switch (event.touches.length) {
      case 1:
        this.touchStart.set(event.touches[0].pageX, event.touches[0].pageY);
        break;
      default:
        break;
    }
  };

  public onTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1:
        const delta = new Vector2(
          event.touches[0].pageX,
          event.touches[0].pageY
        );
        this.onMove(delta.sub(this.touchStart));
        this.touchStart.set(event.touches[0].pageX, event.touches[0].pageY);
        break;
      default:
    }
  };

  public onTouchEnd = (event: TouchEvent) => {};

  public init = () => {
    this.domElement.addEventListener('mousemove', this.onMouseMove, false);
    // this.domElement.addEventListener('keydown', this.logKey.bind(this));
    this.domElement.addEventListener('wheel', this.onWheel);

    this.domElement.addEventListener('touchstart', this.onTouchStart, false);
    this.domElement.addEventListener('touchend', this.onTouchEnd, false);
    this.domElement.addEventListener('touchmove', this.onTouchMove, false);

    this.unsubscribeStore = store.subscribe(this.listener);
  };

  public dispose = () => {
    this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
    // this.domElement.removeEventListener('keydown', this.logKey.bind(this));
    this.domElement.removeEventListener('wheel', this.onWheel);

    this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
    this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
    this.domElement.removeEventListener('touchmove', this.onTouchMove, false);
    this.scene?.remove(this.heightSprite);

    this.unsubscribeStore();
  };

  public setPhotosphere = (photosphereMesh: Mesh) => {
    this.photosphere = photosphereMesh;
    if (this.heightLabel) return;
    this.drawHeight();
  };

  public getDirection = (v: Vector3) => {
    const direction = new Vector3(0, 0, -1);

    return v.copy(direction).applyQuaternion(this.camera.quaternion);
  };

  public update = () => {
    if (this.autoRotate) {
      this.camera.rotateOnWorldAxis(this.yVec, Math.PI / 1000);
    }
  };

  public resetZoom = () => {
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  };

  public setPosition = (position: Vector3) => {
    this.needsUpdate = true;
    this.camera.position.copy(position);
  };

  public setDirection = (direction: Vector3) => {
    this.needsUpdate = true;
    direction.add(this.camera.position);
    this.camera.lookAt(direction);
  };
}
