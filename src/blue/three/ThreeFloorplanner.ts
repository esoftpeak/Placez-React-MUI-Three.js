import { HUD } from './hud';
import { Lights } from './lights';
import * as TWEEN from '@tweenjs/tween.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { Cameras, TargetSpecs } from './Cameras';
import { yPositionShader } from './YPositionShader';
import { modifiedSobelShader } from './ModifiedSobelShader';

import { InverseShader } from './shaders';

import { ShaderView } from '../../components/Blue/models';

import { store } from '../../index';
import { Save, ChangeCameraLayersState } from '../../reducers/blue';
import { Photosphere } from '../../components/Blue/models/Photosphere';
import { PointerLockControls } from './PointerLockControls';
import { PhotosphereControls } from './PhotosphereControls';
import { ReduxState } from '../../reducers';
import { CameraLayers, labelLayers } from '../../models/BlueState';
import { ViewState } from '../../models/GlobalState';
import PlacezCameraState from '../../api/placez/models/PlacezCameraState';
import { Utils } from '../core/utils';
import { RenderOrder } from '../../api/placez/models/UserSetting';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import {
  DoubleSide,
  FrontSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PCFSoftShadowMap,
  Plane,
  PlaneGeometry,
  Quaternion,
  REVISION,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrthographicControls } from './OrthographicControls';
import { FloorplanController } from '../controllers/floorplanController';
import { SetFloorPlan } from '../../reducers/designer';
import { debounce } from 'ts-debounce';
import { PlacezGrid } from './placezGrid';
import { ToastMessage } from '../../reducers/ui';
import { CSS3DRenderer } from '../../components/Blue/components/utility/PlacezCSSRenderer';
// import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
// import { LoaderScene } from '../LoaderScene';

export const ThreeFloorplanner = function (model, element) {
  //floorplan could be state.designer.floorplan
  const floorplan = model.floorplan;
  floorplan.fireOnRoomLoaded(() => {
    this.cameras.initCameraPosition(this.getTargetSpecs());

    let floorplanImageScale = (store.getState() as ReduxState).designer
      .floorPlan.floorplanImageScale;
    floorplanImageScale =
      floorplanImageScale && floorplanImageScale !== 0
        ? floorplanImageScale
        : 1;
    const floorplanImageUrl = (store.getState() as ReduxState).designer
      .floorPlan.floorplanImageUrl;
    this.onLoadFloorplanImg(floorplanImageUrl, floorplanImageScale);
    this.fitToView();

    updateGrid();
  });
  const placezFixturePlan = model.placezFixturePlan;

  const scope = this; // tslint:disable-line

  floorplan.fireOnRemove((obj) => {
    scope.scene.remove(obj);
    scope.needsUpdate();
  });
  floorplan.fireOnAdd((obj) => {
    scope.scene.add(obj);
    scope.needsUpdate();
  });
  floorplan.fireOnUpdatedWalls((obj) => {
    scope.needsUpdate();
  });

  this.cameraLayers = [];
  this.scene = new Scene();
  this.floorplan = floorplan;
  this.cameras = new Cameras();
  this.attendees = [];
  this.element = element;
  let domElement;
  this.ViewState = null;

  this.setTheme = (theme) => {
    this.theme = theme;
    hud.setTheme(theme);
    this.floorplan.setTheme(theme);
  };

  this.floors = [];
  this.edges = [];

  this.walls = [];
  this.corners = [];
  this.rooms = [];

  this.floorplanImageMesh = undefined;

  this.floorplan.fireOnUpdatedRooms(() => {
    scope.needsUpdate();
  });

  let camera;

  let renderer;
  let labelRenderer;

  let gl;
  // let multiSelectController;
  let controller;
  let floorplanController;

  let composer;
  let bwComposer;
  let effectSobel;
  let effectYPosition;
  let edgeShader = false;

  let needsUpdate = false;

  let hud;

  let requestId;

  this.photosphereMesh = undefined;
  this.photosphereLocations = [];
  this.attendeeLocations = [];
  this.labels = [];
  this.staticLabels = [];
  this.labelSprites = [];

  scope.sceneScan = undefined;

  this.dimensions = [];

  this.cameraGltf = undefined;
  this.loaded = false;

  domElement = scope.element; // Container
  // this.loaderScene = new LoaderScene(domElement);

  const wegGLCrash = () => {
    store.dispatch(
      ToastMessage(
        'WebGL Crash Recovering, Contact help@getplacez.com for more info'
      )
    );
    domElement.replaceChildren();
    init();
    scope.updateWindowSize();
  };

  const updateGrid = () => {
    scope.gridHelper.update(scope.controls);
    floorplan.updateWallDims();
  };

  const init = () => {
    console.log('WebGLRenderer', REVISION);

    domElement = scope.element; // Container

    camera = scope.cameras.camera;

    renderer = new WebGLRenderer({
      antialias: true, // antialias is huge
      preserveDrawingBuffer: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    gl = renderer.getContext();

    labelRenderer = new CSS3DRenderer();
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.id = 'labelRenderer';

    domElement.appendChild(labelRenderer.domElement);

    renderer.autoClear = false;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    scope.orthographicControls = new OrthographicControls(
      scope.cameras.oCamera,
      domElement
    );

    const debounceOnControlsChange = () => {
      const cameraState = (store.getState() as ReduxState).designer.floorPlan
        .cameraState;
      store.dispatch(
        SetFloorPlan({
          cameraState: {
            ...cameraState,
            ...scope.getCameraState(),
          },
        })
      );
    };

    const onControlsChange = debounce(debounceOnControlsChange, 50);

    //remove this for animation
    domElement.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', wegGLCrash);

    scope.gridHelper = new PlacezGrid(scope.scene);
    scope.controls = scope.orthographicControls;
    scope.controls.init();

    updateGrid();

    scope.controls.addEventListener('change', onControlsChange);
    scope.controls.addEventListener('zoom', updateGrid);

    hud = new HUD(scope);
    hud.init();

    floorplanController = new FloorplanController(scope, domElement);

    scope.controllers = [floorplanController];

    // postprocessing
    composer = new EffectComposer(renderer);
    bwComposer = new EffectComposer(renderer);
    scope.setComposer();

    scope.cameras.onUpdate = () => {
      this.setComposer();
      this.setBwComposer();
    };

    scope.lights = new Lights(scope.scene, floorplan);

    // const axes = new AxesHelper(500);
    // axes.layers.set(CameraLayers.Grid);
    // scope.scene.add(axes)

    animate();

    // document.addEventListener('keypress', logKey);
    scope.resizeObserver = new ResizeObserver(scope.updateWindowSize).observe(
      element
    );

    const loader = new FontLoader();
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    loader.load(`${host}/Assets/helvetiker_regular.typeface.json`, (font) => {
      scope.font = font;
    });

    this.listener = () => {
      const blueReady = (store.getState() as ReduxState).blue.blueInitialized;
      const sceneScanLoaded = (store.getState() as ReduxState).blue
        .sceneScanLoaded;

      const storeCameraLayers = (store.getState() as ReduxState).blue
        .cameraLayers;
      if (storeCameraLayers !== this.cameraLayers) {
        this.cameraLayers = storeCameraLayers;
        this.cameras.setCameraLayers(this.cameraLayers, this.needsUpdate());
      }
      this.ViewState = (store.getState() as ReduxState).globalstate.viewState;

      const sectionView = (store.getState() as ReduxState).blue.sectionView;
      if (sectionView !== this.sectionView) {
        const globalPlane = new Plane(new Vector3(0, -1, 0), 200);
        if (sectionView) {
          renderer.clippingPlanes = [globalPlane];
        } else {
          renderer.clippingPlanes = [];
        }
        this.needsUpdate();
      }
      if (blueReady && sceneScanLoaded) {
        if (this.loaded === false) {
          this.loaded = true;
        }
      }
    };

    this.unsubscribeStore = store.subscribe(this.listener);
  };

  this.dispose = function () {
    renderer.domElement.removeEventListener('webglcontextlost', wegGLCrash);
    stopAnimation();
    if (domElement.contains(renderer.domElem))
      domElement.removeChild(renderer.domElem);
    // document.removeEventListener('keypress', logKey);
    scope?.resizeObserver?.disconnect();
    // Not sure if dispose is actually doing anything leaving for now
    renderer.dispose();
    // multiSelectController.dispose();
    scope.controllers.forEach((controller) => controller?.dispose?.());
    composer.reset();
    bwComposer.reset();
    scope.controls.dispose();
    // delete scope.controls;
    // Might want to clear cache leaving in for now
    // Cache.clear();
    renderer.forceContextLoss();
    this.unsubscribeStore();
  };

  function logKey(e: KeyboardEvent) {
    switch (e.code) {
      case 'KeyI':
        console.log(scope.scene);
        break;
    }
  }

  function stopAnimation() {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
  }

  function animate() {
    requestId = requestAnimationFrame(animate);
    // TWEEN.update();
    if (shouldRender()) {
      renderAll();
    }
  }

  function renderAll() {
    if (edgeShader) {
      renderComposer();
    } else {
      render();
    }
  }

  this.setComposer = function () {
    const yPositionMaterial = new ShaderMaterial(yPositionShader);
    yPositionMaterial.side = DoubleSide;

    // Sobel operator
    effectSobel = new ShaderPass(modifiedSobelShader);
    effectSobel.uniforms['resolution'].value.x =
      window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms['resolution'].value.y =
      window.innerHeight * window.devicePixelRatio;
    composer.addPass(effectSobel);

    const invertColors = new ShaderPass(InverseShader);
    composer.addPass(invertColors);
  };

  function render() {
    const locationObj = new Object3D();
    scope.cameras.camera.add(locationObj);
    locationObj.position.setZ(-1000);
    const vec = new Vector3();

    locationObj.updateMatrixWorld();
    locationObj.matrixWorld.decompose(vec, new Quaternion(), new Vector3());
    scope.cameras.camera.remove(locationObj);

    renderer.clear();

    if (scope.ViewState === ViewState.PhotosphereView) {
      gl.colorMask(false, false, false, false);
      scope.cameras.camera.layers.set(CameraLayers.Mask);
      scope.cameras.camera.layers.enable(CameraLayers.Walls);
      // scope.cameras.camera.layers.enable(CameraLayers.Fixtures);
      renderer.render(scope.scene, scope.cameras.camera);

      gl.colorMask(true, true, true, true);
      scope.cameras.camera.layers.disableAll();
      scope.cameraLayers.forEach((layer) => {
        scope.cameras.camera.layers.enable(layer);
      });
    }
    renderer.render(scope.scene, scope.cameras.camera);
    renderer.clearDepth();
    renderer.render(hud.getScene(), scope.cameras.camera);

    labelRenderer.render(scope.scene, scope.cameras.camera);
  }

  function renderComposer() {
    scope.cameras.camera.layers.disable(CameraLayers.Floorplanes);
    scope.cameras.camera.layers.disable(CameraLayers.Linen);

    labelLayers.forEach((element) => {
      scope.cameras.camera.layers.disable(element);
    });
    composer.autoClear = false;
    composer.render();

    scope.cameras.camera.layers.disableAll();
    labelLayers.forEach((element) => {
      if (scope.cameraLayers.includes(element)) {
        scope.cameras.camera.layers.enable(element);
      }
    });

    bwComposer.autoClear = false;
    renderer.clearDepth();
    bwComposer.render();

    scope.cameraLayers.forEach((layer) => {
      scope.cameras.camera.layers.enable(layer);
    });

    renderer.clearDepth();
    renderer.render(hud.getScene(), scope.cameras.camera);
  }

  this.dataUrl = function () {
    const dataUrl = renderer.domElement.toDataURL('image/png');
    return dataUrl;
  };

  this.getController = function () {
    // const activeController = (store.getState() as ReduxState).blue.activeController;
    // const currentControler = scope.controllers.find(controller => {
    //   return controller.controllerType === activeController;
    // });
    // return currentControler ? currentControler : controller;
    return floorplanController;
  };

  this.getCamera = function () {
    return scope.cameras.camera;
  };

  this.needsUpdate = function () {
    needsUpdate = true;
  };

  function shouldRender() {
    // Do we need to draw a new frame
    if (
      scope.controls === scope.firstPersonControls ||
      scope.controls === scope.photosphereControls ||
      scope.orbitControls?.autoRotate ||
      scope.photosphereControls?.autoRotate ||
      scope.controls.needsUpdate ||
      scope.controllers.some((controller) => controller.needsUpdate) ||
      needsUpdate ||
      scope.scene.needsUpdate
    ) {
      scope.controls.needsUpdate = false;
      if (scope.photosphereControls?.autoRotate)
        scope.photosphereControls.update();
      scope.controllers.forEach(
        (controller) => (controller.needsUpdate = false)
      );
      needsUpdate = false;
      scope.scene.needsUpdate = false;
      return true;
    }
    return false;
  }

  this.updateWindowSize = () => {
    scope.cameras.updateAspect(
      domElement.clientWidth,
      domElement.clientHeight,
      scope.getTargetSpecs()
    );

    renderer.setSize(domElement.clientWidth, domElement.clientHeight);
    labelRenderer.setSize(domElement.clientWidth, domElement.clientHeight);
    composer.setSize(domElement.clientWidth, domElement.clientHeight);
    bwComposer.setSize(domElement.clientWidth, domElement.clientHeight);

    effectSobel.uniforms['resolution'].value.x =
      window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms['resolution'].value.y =
      window.innerHeight * window.devicePixelRatio;
    needsUpdate = true;
  };

  // tslint:disable-next-line:ter-arrow-parens
  this.getTargetSpecs = (): TargetSpecs => {
    const floorPlanSpecs = floorplan.getSpecs();
    if (scope.sceneScan) {
      const sceneScanSpecs = Utils.getMeshTargetSpecs(scope.sceneScan);
      if (floorPlanSpecs.diagonal > sceneScanSpecs.diagonal) {
        return floorPlanSpecs;
      } else {
        return sceneScanSpecs;
      }
    } else {
      return floorPlanSpecs;
    }
  };

  this.loadCameraState = (cameraState: PlacezCameraState) => {
    this.orthographicControls.loadState(cameraState);
    floorplan.setAzimuth(this.orthographicControls.getAzimuthalAngle());
  };

  this.initCameraAndControls = (cameraState?: PlacezCameraState) => {
    if (cameraState) {
      this.loadCameraState(cameraState);
    }
  };

  this.setImage = (src) => {
    store.dispatch(
      SetFloorPlan({
        floorplanImageUrl: src,
      })
    );
    store.dispatch(Save());

    const floorplanImageScale =
      (store.getState() as ReduxState).designer.floorPlan.floorplanImageScale ??
      1;
    const floorplanImageUrl = (store.getState() as ReduxState).designer
      .floorPlan.floorplanImageUrl;
    this.onLoadFloorplanImg(floorplanImageUrl, floorplanImageScale);

    const currentCameraLayers = (store.getState() as ReduxState).blue
      .cameraLayers;

    const newLayers: CameraLayers[] = currentCameraLayers.filter(
      (layer: CameraLayers) => {
        return (
          layer !== CameraLayers.Floorplanes &&
          layer !== CameraLayers.FloorplaneImage
        );
      }
    );
    if (src !== '') {
      newLayers.push(CameraLayers.FloorplaneImage);
    }

    store.dispatch(ChangeCameraLayersState(newLayers, true));
  };

  this.scaleImage = (scale) => {
    if (this.floorplanImageMesh)
      this.floorplanImageMesh.scale.set(scale, scale, scale);
  };

  // loads a new image
  this.onLoadFloorplanImg = (src, scale) => {
    // this is where we add a new image
    if (src) {
      if (src.indexOf('placez.horizoncloud.com') > -1 || src === '') return;
      new TextureLoader().load(src, this.addFloorplanImage(scale));
    } else {
      if (this.floorplanImageMesh) scope.scene.remove(this.floorplanImageMesh);
    }
    scope.needsUpdate();
  };

  this.addFloorplanImage = (scale: number) => (texture) => {
    if (this.floorplanImageMesh) scope.scene.remove(this.floorplanImageMesh);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      side: FrontSide,
      map: texture,
    });
    const width = texture.image.width;
    const height = texture.image.height;
    const floorplanImageGeometry = new PlaneGeometry(width, height);
    floorplanImageGeometry.rotateX(-Math.PI / 2);
    floorplanImageGeometry.translate(width / 2, 0, height / 2);
    material.map = texture;
    material.depthTest = false;
    this.floorplanImageMesh = new Mesh(floorplanImageGeometry, material);
    this.floorplanImageMesh.renderOrder = RenderOrder.FloorplaneImage;
    this.floorplanImageMesh.scale.set(scale, scale, scale);
    this.floorplanImageMesh.layers.set(CameraLayers.FloorplaneImage);
    scope.scene.add(this.floorplanImageMesh);
  };

  this.getCameraState = (): Partial<PlacezCameraState> => {
    this.cameras.oCamera.updateMatrixWorld();
    this.cameras.oCamera.updateMatrix();
    return {
      orthographicState: {
        target: this.orthographicControls.orthographicState.target0.toArray(),
        zoom: this.orthographicControls.orthographicState.zoom0 || 1,
        rotation: this.orthographicControls.orthographicState.rotation0,
      },
    };
  };

  this.setView = function (shaderView: ShaderView) {
    switch (shaderView) {
      case ShaderView.None:
        edgeShader = false;
        scope.cameraLayers.forEach((layer) => {
          scope.cameras.camera.layers.enable(layer);
        });
        render();
        break;
      case ShaderView.BlackAndWhite:
        edgeShader = true;
        renderer.autoClear = false;
        renderComposer();
        break;
    }
  };

  this.centerCamera = function (targetSpecs: TargetSpecs) {
    scope.controls.setTarget(targetSpecs);
  };

  this.fitToView = () => {
    if (scope.getTargetSpecs().diagonal === 0) return;
    scope.cameras.fitToView(scope.getTargetSpecs());
    scope.centerCamera(scope.getTargetSpecs());
    floorplanController.onZoomUpdate(undefined, scope.cameras.oCamera.zoom);
  };

  // Top down design Mode
  this.cameraDesignMode = function () {
    // Center Controls
    // scope.controls.reTarget

    const from = {
      phi: scope.controls.getPolarAngle(),
      theta: scope.controls.getAzimuthalAngle(),
      x: scope.controls.target.x,
      y: scope.controls.target.y,
      z: scope.controls.target.z,
    };

    const to = {
      // phi: 0,
      // theta: 0,
      // x: model.targetSpecs.centerOffset.x,
      // y: model.targetSpecs.centerOffset.y,
      // z: model.targetSpecs.centerOffset.z,
    };

    const tween = new TWEEN.Tween(from)
      .to(to, 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((obj) => {
        scope.controls.target = new Vector3(obj.x, obj.y, obj.z);
        scope.controls.rotateLeft(
          scope.controls.getAzimuthalAngle() - obj.theta
        );
        scope.controls.rotateUp(scope.controls.getPolarAngle() - obj.phi);
        scope.controls.update();
        // controller.update();
      })
      .onComplete(() => {})
      .start();
  };

  this.getRenderer = (): WebGLRenderer => {
    return renderer;
  };

  this.showLayer = (layer: number) => {
    scope.cameras.showLayer(layer);
    this.needsUpdate();
  };

  this.PhotosphereView = (position: Vector3, direction?: Vector3) => {
    scope.photosphereControls.dispatchEvent({ type: 'change', showAll: true });
    if (!(scope.controls instanceof PhotosphereControls)) {
      scope.controls.dispose();
      scope.firstPersonControls.dispose();
      scope.photosphereControls.init();
    }

    if (direction) {
      scope.setFpvCamera(position, direction);
    } else {
      scope.setFpvCamera(position);
    }
    scope.controls = scope.photosphereControls;
    scope.photosphereControls.resetZoom();
  };

  this.getPhotosphereMesh = (): Mesh => {
    return this.photosphereMesh;
  };

  this.getPhotosphereDirection = (): Vector3 => {
    const direction = new Vector3();
    return this.controls.getDirection(direction);
  };

  this.getPointerLockControl = (): PointerLockControls => {
    return this.firstPersonControls;
  };

  this.buildPhotoLocationMesh = (photo: Photosphere) => {
    const cameraVisualizer = new Object3D();
    const transformation = new Matrix4().fromArray(photo.transformation);

    let cameraObj;
    if (this.cameraGLTF) {
      cameraObj = this.cameraGLTF.clone();
      cameraObj.rotateY(-Math.PI / 2);
      cameraObj.translateX(10);
      cameraObj.scale.set(10, 10, 10);
      cameraObj.traverse((child) => {
        child.layers.set(CameraLayers.PhotosphereCameras);
      });
      cameraObj.layers.set(CameraLayers.PhotosphereCameras);
      cameraVisualizer.add(cameraObj);
    } else {
      scope.loadCameraGltf(() => {
        cameraObj = this.cameraGLTF.clone();
        cameraObj.rotateY(-Math.PI / 2);
        cameraObj.translateX(10);
        cameraObj.scale.set(10, 10, 10);
        cameraObj.traverse((child) => {
          child.layers.set(CameraLayers.PhotosphereCameras);
        });
        cameraObj.layers.set(CameraLayers.PhotosphereCameras);
        cameraVisualizer.add(cameraObj);
      });
    }

    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();

    transformation.decompose(position, quaternion, scale);
    cameraVisualizer.position.copy(position);

    if (photo.direction) {
      const lookAt = new Vector3().fromArray(photo.direction);
      lookAt.add(position);
      cameraVisualizer.lookAt(lookAt);
    }

    cameraVisualizer.userData = { id: photo.id };
    cameraVisualizer.traverse((child) => {
      child.layers.set(CameraLayers.PhotosphereCameras);
    });
    cameraVisualizer.layers.set(CameraLayers.PhotosphereCameras);

    return cameraVisualizer;
  };

  this.deleteAndReset = (clearImages?: boolean) => {
    floorplan.reset(clearImages);
    this.needsUpdate();
  };

  init();
};
