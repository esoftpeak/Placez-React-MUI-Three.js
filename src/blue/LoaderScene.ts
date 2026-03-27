import {
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Shape,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js'

import { Lights } from './three/lights';

export class LoaderScene {
  public onPause;
  public onPauseCb;
  public dispose;
  public buildChair;
  public loaderMesh;
  public meshContainer;
  public meshOffset;
  public meshScale;
  private chairMaterial: MeshStandardMaterial = new MeshStandardMaterial({
    color: 0x5c236f,
    transparent: true,
  });

  private setupComplete: boolean = false;
  private shrink: boolean = false;

  private fullLength: number = 50;
  static delay: number = 2000;
  private delayed: number = 2000;
  private positionScalar: number = 100;
  private childIndex: number = 0;
  private seatAnimation3;
  private seat;

  private pauseTween;
  private explodeChairTween;
  private flipSeatTween;
  private tweenC;
  private shouldDispose: boolean = false;

  constructor(containerElement: any) {
    let controls;
    let camera;
    let scene;
    let renderer;
    let domElem;

    const init = () => {
      const full = 250;

      scene = new Scene();

      if (containerElement) {
        camera = new PerspectiveCamera(
          45,
          containerElement.clientWidth / containerElement.clientHeight,
          1,
          20000
        );
        camera.position.set(250, 250, 250);

        const lights = new Lights(scene);
        lights.updateSize(new Vector3(180, 0, 180), new Vector3(180, 0, 180));

        renderer = new WebGLRenderer({
          preserveDrawingBuffer: true,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(
          containerElement.clientWidth,
          containerElement.clientHeight
        );

        renderer.shadowMap.enabled = true;
        domElem = renderer.domElement;
        containerElement.appendChild(domElem);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.update();
      }

      this.loaderMesh = this.buildChair();

      this.meshContainer = new Object3D();
      this.meshOffset = new Object3D();
      this.meshScale = new Object3D();
      this.meshScale.add(this.loaderMesh);

      this.meshContainer.add(this.meshScale);
      //push away from camera;

      scene.add(this.meshContainer);
    };

    const buildBack = (size: number): THREE.Mesh => {
      const shape = new Shape();
      const top = size * 0.8;
      shape.moveTo(-top / 2, size / 2);
      shape.lineTo(-size / 2, -size / 2);
      shape.lineTo(size / 2, -size / 2);
      shape.lineTo(top / 2, size / 2);
      shape.lineTo(-top / 2, size / 2);

      const extrudeSettings = {
        steps: 2,
        depth: size / 5 - 2,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelOffset: -3,
        bevelSegments: 3,
      };

      const geometry = new ExtrudeGeometry(shape, extrudeSettings);
      const back = new Mesh(geometry, this.chairMaterial);
      back.rotateX(Math.PI / 2);
      back.rotateY(Math.PI);
      return back;
    };

    const buildSeat = (size: number): Mesh => {
      const shape = new Shape();
      shape.moveTo(-size / 2, size / 2);
      shape.lineTo(-size / 2, -size / 2);
      shape.lineTo(size / 2, -size / 2);
      shape.lineTo(size / 2, size / 2);
      shape.lineTo(-size / 2, size / 2);

      const extrudeSettings = {
        steps: 2,
        depth: size / 5,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 3,
        bevelOffset: -3,
        bevelSegments: 3,
      };

      const geometry = new ExtrudeGeometry(shape, extrudeSettings);
      this.seat = new Mesh(geometry, this.chairMaterial);
      return this.seat;
    };

    const buildLeftLeg = (size: number): Mesh => {
      const shape = new Shape();
      shape.moveTo(size / 2, size / 5 / 2);
      shape.lineTo(size / 2, -size / 5 / 2);

      shape.lineTo((-size / 2) * 0.75, -size / 5 / 2);
      shape.lineTo((-size / 2) * 0.85, (-size / 5 / 2) * 0.5);
      shape.lineTo((-size / 2) * 0.95, 0);
      shape.lineTo(-size / 2, (size / 5 / 2) * 0.75);

      shape.lineTo(-size / 2, size / 5 / 2);
      shape.lineTo(size / 2, size / 5 / 2);

      const extrudeSettings = {
        steps: 2,
        depth: size / 5,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0,
      };

      const geometry = new ExtrudeGeometry(shape, extrudeSettings);
      const leg = new Mesh(geometry, this.chairMaterial);
      leg.rotateY(-Math.PI / 2);
      leg.rotateX(-Math.PI / 2);
      return leg;
    };

    const buildRightLeg = (size: number): Mesh => {
      const shape = new Shape();
      shape.moveTo(size / 2, -size / 5 / 2);
      shape.lineTo(size / 2, size / 5 / 2);

      shape.lineTo((-size / 2) * 0.88, size / 5 / 2);
      shape.lineTo((-size / 2) * 0.93, (size / 5 / 2) * 0.5);
      shape.lineTo((-size / 2) * 0.98, 0);
      shape.lineTo(-size / 2, (-size / 5 / 2) * 0.75);

      shape.lineTo(-size / 2, -size / 5 / 2);
      shape.lineTo(size / 2, -size / 5 / 2);

      const extrudeSettings = {
        steps: 2,
        depth: size / 5,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0,
      };

      const geometry = new ExtrudeGeometry(shape, extrudeSettings);
      const leg = new Mesh(geometry, this.chairMaterial);
      leg.rotateY(-Math.PI / 2);
      leg.rotateX(-Math.PI / 2);
      return leg;
    };

    this.buildChair = (): THREE.Object3D => {
      const size = 30;
      const seat = buildSeat(size);
      const back = buildBack(size);
      const legSize = size - 5;
      const leftLeg = buildLeftLeg(legSize);
      const rightLeg = buildRightLeg(legSize);
      const chair = new Object3D();
      const fl = leftLeg.clone();
      const fr = rightLeg.clone();
      const bl = leftLeg.clone();
      const br = rightLeg.clone();
      chair.add(back);
      chair.add(fl);
      chair.add(fr);
      chair.add(bl);
      chair.add(br);
      chair.add(seat);
      const chairLegOffset = size / 2 - legSize / 5 / 2;
      seat.position.set(0, 0, 1);
      fr.position.set(
        chairLegOffset,
        chairLegOffset - legSize / 5 / 2,
        -size / 2 + 6
      );
      fl.position.set(
        -chairLegOffset,
        chairLegOffset - legSize / 5 / 2,
        -size / 2 + 6
      );
      br.position.set(
        chairLegOffset,
        -chairLegOffset - legSize / 5 / 2,
        -size / 2 + 6
      );
      bl.position.set(
        -chairLegOffset,
        -chairLegOffset - legSize / 5 / 2,
        -size / 2 + 6
      );
      back.position.set(0, -size / 2, size / 2 + size / 5 + 2);
      chair.rotateX(-Math.PI / 2);
      chair.rotateZ(-Math.PI / 2);
      return chair;
    };

    let shouldAnimate = true;
    const animate = (time) => {
      if (containerElement && shouldAnimate) {
        requestAnimationFrame(animate);
        TWEEN.update(time);
        renderer.render(scene, camera);
      }
    };

    init();
    requestAnimationFrame(animate);
    const movements = { rotation: 0, positionScalar: 1, seatRotation: 0 };
    const yAxis = new Vector3(0, 1, 0);
    let prevScalar = 1;

    this.pauseTween = new TWEEN.Tween(movements) // Create a new tween that modifies 'coords'.
      .onUpdate(() => {
        if (this.onPauseCb) this.onPauseCb();
        this.onPauseCb = undefined;
        if (this.shouldDispose) {
          renderer.forceContextLoss();
          if (containerElement.contains(domElem))
            containerElement.removeChild(domElem);
          shouldAnimate = false;
          this.shouldDispose = false;
        }
      })
      .delay(500);

    this.explodeChairTween = new TWEEN.Tween(movements)
      .to({ positionScalar: 100 }, 3000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.loaderMesh.children.forEach((element) => {
          element.position.multiplyScalar(1 / prevScalar);
          element.position.multiplyScalar(movements.positionScalar);
        });
        prevScalar = movements.positionScalar;
      });

    this.flipSeatTween = new TWEEN.Tween(movements)
      .to({ seatRotation: 4 * Math.PI })
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.seat.setRotationFromAxisAngle(yAxis, movements.seatRotation);
      });

    this.tweenC = new TWEEN.Tween(movements)
      .to({ rotation: 2 * Math.PI, positionScalar: 1 })
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.meshContainer.setRotationFromAxisAngle(yAxis, movements.rotation);
        this.loaderMesh.children.forEach((element) => {
          element.position.multiplyScalar(1 / prevScalar);
          element.position.multiplyScalar(movements.positionScalar);
        });
        prevScalar = movements.positionScalar;
      });

    this.pauseTween.chain(this.explodeChairTween);
    this.explodeChairTween.chain(this.flipSeatTween);
    this.flipSeatTween.chain(this.tweenC);
    this.tweenC.chain(this.pauseTween);
    this.pauseTween.start();

    this.dispose = () => {
      this.shouldDispose = true;
    };

    this.onPause = (cb) => {
      this.onPauseCb = cb;
    };
  }
}
