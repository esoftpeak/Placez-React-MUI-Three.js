import {
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import { PlacezMaterial } from '../api/placez/models/PlacezMaterial';
import { Utils } from './core/utils';
import { Lights } from './three/lights';

import { MaterialManager } from './three/materialManager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const MaterialPreview = function (
  containerElement: any,
  material: PlacezMaterial
) {
  let camera;
  let scene;
  let renderer;
  let light;

  this.material = material;
  this.sphere = undefined;

  this.loader = new TextureLoader();

  const init = () => {
    camera = new PerspectiveCamera(
      45,
      containerElement.clientWidth / containerElement.clientHeight,
      1,
      2000
    );
    const lightPosition = new Object3D();
    lightPosition.position.set(100, 100, 0);

    camera.position.set(0, 0, 150);
    camera.add(lightPosition);
    scene = new Scene();
    light = new Lights(scene);

    renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
      alpha: true,
      antialias: true,
    });

    this.controls = new OrbitControls(camera, renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableZoom = false;

    renderer.setSize(
      containerElement.clientWidth,
      containerElement.clientHeight
    );

    renderer.shadowMap.enabled = true;
    containerElement.appendChild(renderer.domElement);

    new MaterialManager(this.material, (material) => {
      const geometry = new SphereGeometry(50, 512, 512);
      this.sphere = new Mesh(geometry, material);
      scene.add(this.sphere);
      render();
    });

    const tick = () => {
      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);

      light
        .getDirLight()
        .position.setFromMatrixPosition(lightPosition.matrixWorld);
    };

    tick();
  };

  function render() {
    renderer.render(scene, camera);
  }

  this.getBlob = (cb) => {
    try {
      const strMime = 'image/png';
      renderer.domElement.toBlob(cb, strMime);
    } catch (e) {
      console.warn(e);
      return;
    }
  };

  this.dispose = () => {
    Utils.disposeMesh(this.sphere);
    renderer.forceContextLoss();
    this.controls.dispose();
  };

  this.updateMaterial = (material: PlacezMaterial) => {
    this.material = material;
    if (this.sphere) {
      new MaterialManager(material, (material) => {
        this.sphere.material.copy(material);
        this.sphere.material.needsUpdate = true;
        renderer.render(scene, camera);
      });
    } else {
      init();
      render();
    }
  };
};
