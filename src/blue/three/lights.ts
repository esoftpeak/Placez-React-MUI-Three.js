import {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
  Vector3,
} from 'three';
import { CameraLayers } from '../../models/BlueState';
import { Floorplan } from '../model/floorplan';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import { CameraType } from '../../components/Blue/models';

export const Lights = function (scene, floorplan?: Floorplan) {
  const scope = this; // tslint:disable-line

  const tol = 1;
  const height = 3000; // TODO: share with Blueprint.Wall
  const state = {
    ambientColor: 0xffffff,
    ambientIntensity: 1.5,
    directColor: 0xffffff,
    directIntensity: 1.35,
  };

  let dirLight;
  let ambientLight;
  let helper;

  this.getDirLight = function () {
    return dirLight;
  };

  const init = () => {
    this.listener = () => {
      const state = store.getState() as ReduxState;
      if (
        state.blue.cameraType === CameraType.Orthographic &&
        dirLight.castShadow
      ) {
        dirLight.castShadow = false;
      } else if (
        state.blue.cameraType !== CameraType.Orthographic &&
        !dirLight.castShadow
      ) {
        dirLight.castShadow = true;
      }
    };

    scope.unsubscribeStore = store.subscribe(scope.listener);

    const hemiLight = new HemisphereLight();
    scene.add(hemiLight);

    ambientLight = new AmbientLight(state.ambientColor, state.ambientIntensity);
    ambientLight.name = 'ambient_light';
    scene.add(ambientLight);

    dirLight = new DirectionalLight(state.directColor, state.directIntensity);
    dirLight.position.set(0.5, 0, 0.866); // ~60º
    dirLight.name = 'main_light';

    dirLight.castShadow = true;

    const shadowDetail = 11;
    dirLight.shadow.mapSize.width = 2 ** shadowDetail;
    dirLight.shadow.mapSize.height = 2 ** shadowDetail;

    dirLight.shadow.camera.far = height * 4;
    // dirLight.shadow.bias = 0.001;
    dirLight.visible = true;

    helper = new CameraHelper(dirLight.shadow.camera);

    // scene.add(helper);
    scene.add(dirLight);

    this.plane = groundPlane();
    this.plane.layers.set(CameraLayers.Photospheres);
    scene.add(this.plane);

    if (floorplan) {
      floorplan.fireOnUpdatedRooms(() => {
        this.updateSize(floorplan.getSize(), floorplan.getCenter());
      });
    }
  };

  const updateShadowCamera = (size: Vector3, center: Vector3) => () => {
    const d = (Math.max(size.z, size.x) + tol) / 0.9;

    const offset = new Vector3(0.1 * height, 0, -0.2 * height);

    dirLight.target.position.copy(center);

    const pos = new Vector3(center.x, height, center.z);
    pos.add(offset);
    dirLight.position.copy(pos);
    dirLight.updateMatrix();
    dirLight.updateWorldMatrix();
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    // this is necessary for updates
    dirLight.shadow.camera.updateProjectionMatrix();
    helper.update();
  };

  const groundPlane = (center: Vector3 = new Vector3()) => {
    const planeGeometry = new PlaneGeometry(1, 1);
    planeGeometry.rotateX(-Math.PI / 2);

    const planeMaterial = new ShadowMaterial();
    planeMaterial.opacity = 0.2;

    const plane = new Mesh(planeGeometry, planeMaterial);
    const pos = new Vector3(center.x, 0, center.z);
    plane.position.copy(pos);
    plane.receiveShadow = true;

    return plane;
  };

  const updateGroundPlane = (size: Vector3, center: Vector3) => () => {
    this.plane.position.set(center.x, 0, center.z);

    const d = Math.max(size.z, size.x);
    this.plane.scale.set(d * 2, 1, d * 2);
  };

  this.updateSize = (
    size: Vector3 = new Vector3(500, 0, 500),
    center: Vector3 = new Vector3()
  ) => {
    updateShadowCamera(size, center)();
    updateGroundPlane(size, center)();
  };

  init();

  this.dispose = () => {
    scope.unsubscribeStore();
  };
};
