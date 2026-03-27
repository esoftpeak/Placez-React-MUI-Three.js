import { PointerLockControls } from './PointerLockControls';
import { Euler, Vector3 } from 'three';
import { ArrowDirection } from './controller';

const ViewerHeight = 170; //cm

export class BluePointerLockControls extends PointerLockControls {
  public mouseDown: boolean;
  public range: number;
  public camera: THREE.PerspectiveCamera;
  public speed: number;
  public needsUpdate: boolean;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    super(camera, domElement);
    this.mouseDown = false;
    this.range = 200;
    this.camera = camera;
    this.camera.zoom = 1;
    this.speed = 10;
  }

  private logKey = (e: KeyboardEvent) => {
    if (this.isLocked) {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.onMove('up');
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.onMove('down');
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.onMove('left');
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.onMove('right');
          break;
      }
      e.stopPropagation();
    }
  };

  private onMove = (dir: ArrowDirection) => {
    this.needsUpdate = true;
    switch (dir) {
      case 'up':
        this.moveForward(this.speed);
        break;
      case 'down':
        this.moveForward(-this.speed);
        break;
      case 'left':
        this.moveRight(-this.speed);
        break;
      case 'right':
        this.moveRight(this.speed);
        break;
    }
  };

  private onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) {
      this.camera.zoom += 0.1;
    } else {
      if (this.camera.zoom <= 1) return;
      this.camera.zoom -= 0.1;
    }
    this.camera.updateProjectionMatrix();
  };

  public init = () => {
    document.addEventListener('keydown', this.logKey.bind(this));
    this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    this.domElement.addEventListener('mouseup', this.onMouseUp, false);
    this.domElement.addEventListener('wheel', this.onWheel);
    this.connect();
    this.camera.position.setY(ViewerHeight);
    this.camera.lookAt(500, 0, 500);
  };

  public dispose = () => {
    document.removeEventListener('keydown', this.logKey.bind(this));
    this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
    this.domElement.removeEventListener('mouseup', this.onMouseUp, false);
    this.domElement.removeEventListener('wheel', this.onWheel);
    this.disconnect();
  };

  private onMouseDown = () => {
    this.mouseDown = true;
    this.lock();
  };

  private onMouseUp = () => {
    this.mouseDown = false;
    this.unlock();
  };

  public resetZoom = () => {
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  };

  public onRotate = (direction: ArrowDirection) => {
    const euler = new Euler(0, 0, 0, 'YXZ');
    const changeEvent = { type: 'change' };
    euler.setFromQuaternion(this.camera.quaternion);

    switch (direction) {
      case 'up':
        break;
      case 'down':
        break;
      case 'left':
        euler.y += 0.2;
        break;
      case 'right':
        euler.y -= 0.2;
        break;
    }

    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    this.camera.quaternion.setFromEuler(euler);

    this.dispatchEvent(changeEvent);
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
