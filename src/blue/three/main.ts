import { Controller } from './controller';
import { LabelController } from '../controllers/labelController';
import { AttendeeController } from '../controllers/attendeeController';
import { NumberController } from '../controllers/numberController';
import { BatchController } from '../controllers/batchController';
import { HUD } from './hud';
import { Lights } from './lights';
import { Floorplan } from './floorplan';
import * as TWEEN from '@tweenjs/tween.js';
import { BluePointerLockControls } from './BluePointerLockControls';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { Cameras, TargetSpecs } from './Cameras';
import { yPositionShader } from './YPositionShader';
import { modifiedSobelShader } from './ModifiedSobelShader';
import { CubemapToEquirectangular } from './CubemapToEquirectangular';
import { SceneScan } from '../items/sceneScan';

import { InverseShader } from './shaders';

import {
  ShaderView,
  CameraType,
  PhotosphereSetup,
} from '../../components/Blue/models';

import { store } from '../../index';
import {
  SetShaderView,
  SetCameraType,
  sceneScanLoadedAction,
  SetActiveController,
} from '../../reducers/blue';
import { Photosphere } from '../../components/Blue/models/Photosphere';
import { PointerLockControls } from './PointerLockControls';
import { Item } from '../items/item';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PhotosphereControls } from './PhotosphereControls';
import { UpdatePhotosphereSetup } from '../../reducers/globalState';
import { ReduxState } from '../../reducers';
import {
  CameraLayers,
  ControllerType,
  labelLayers,
} from '../../models/BlueState';
import { ViewState, GlobalViewState } from '../../models/GlobalState';
import { Attendee } from '../../api';
import PlacezCameraState from '../../api/placez/models/PlacezCameraState';
import DimensionParams from '../model/dimensionParams';
import { Utils } from '../core/utils';
import { Theme } from '@mui/material';
import { RenderOrder, getOrgTheme } from '../../api/placez/models/UserSetting';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import {
  AxesHelper,
  BackSide,
  Clock,
  DoubleSide,
  FrontSide,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Quaternion,
  REVISION,
  SRGBColorSpace,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { PerspectiveControls } from './PerspectiveControls';
import { OrthographicControls } from './OrthographicControls';
import { debounce } from 'ts-debounce';
import { SetFloorPlan, SetLayout } from '../../reducers/designer';
import { PlacezGrid } from './placezGrid';
import { Notes } from './Notes';
import { DrawingController } from '../controllers/drawingController';
import { PlacezLine } from '../shapes/placezLine';
import { LineParams } from '../model/shapeParams';
import { PlacezShape } from '../shapes/placezShapes';
import { TextureController } from '../controllers/textureController';
import { ToastMessage } from '../../reducers/ui';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { CSS3DLabelMaker } from './CSS3DlabelMaker';
import { eventBus } from './EventBus';
// import { LoaderScene } from '../LoaderScene';

const controlsListener = new AbortController();

export const Main = function (model, element) {
  const scope = this; // tslint:disable-line

  const host = import.meta.env.VITE_APP_PLACEZ_API_URL;

  const scene = model.scene;
  const clock = new Clock();
  this.cameraLayers = [];
  this.cameras = new Cameras();
  this.attendees = [];
  this.element = element;
  let domElement;
  this.ViewState = null;

  this.sceneScansUrls = [];

  this.setTheme = (theme: Theme) => {
    this.theme = theme;
    scene.setTheme(theme);
    hud.setTheme(theme);
  };

  let renderer;
  let labelRenderer;
  let gl;
  // let multiSelectController;
  let controller;
  let drawingController;
  let labelController;
  let textureController;
  let attendeeController;
  let numberController;
  let floorplan;
  let batchController;

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

  this.sceneScan = undefined;

  this.shapes = [];

  this.cameraGltf = undefined;
  this.loaded = false;

  domElement = scope.element; // Container
  // this.loaderScene = new LoaderScene(domElement);

  const wegGLCrash = () => {
    (window as any).gtag('event', 'WEBGL_CRASH');
    store.dispatch(
      ToastMessage(
        'WebGL Crash Recovering, Contact help@getplacez.com for more info'
      )
    );
    domElement.replaceChildren();
    const cameraState = model.scene.getCameraState(this);
    init();
    const cameraType = scope.cameras.getCameraType();

    model.scene.getCameraState(this);
    this.loadCameraState(cameraState);

    scope.updateWindowSize();
    store.dispatch(SetCameraType(cameraType));
  };

  const init = () => {
    console.log('WebGLRenderer', REVISION);

    domElement = scope.element; // Container

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

    scope.photosphereControls = new PhotosphereControls(
      this.cameras.fpvCamera,
      domElement,
      scene
    );
    scope.firstPersonControls = new BluePointerLockControls(
      this.cameras.fpvCamera,
      domElement
    );
    scope.perspectiveControls = new PerspectiveControls(
      this.cameras.pCamera,
      domElement
    );
    scope.orthographicControls = new OrthographicControls(
      this.cameras.oCamera,
      domElement
    );

    scope.gridHelper = new PlacezGrid(scene);
    scope.controls = scope.orthographicControls;
    scope.controls.init(); // turns on listeners
    scope.gridHelper.update(scope.controls);

    //remove this for animation
    domElement.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', wegGLCrash);

    hud = new HUD(scope);
    hud.init();

    // multiSelectController = new MultiSelectController(
    //   scene,
    //   scope.cameras,
    //   domElement,
    //   hud,
    //   scope.controls,
    // )

    scope.notes = new Notes(scene);

    controller = new Controller(
      model,
      scene,
      scope.cameras,
      domElement,
      scope.controls,
      hud,
      this
    );

    drawingController = new DrawingController(
      scene,
      scope.cameras,
      domElement,
      scope.controls,
      this
    );

    labelController = new LabelController(
      scene,
      scope.cameras,
      domElement,
      scope.controls,
      scope.notes.labelObjects
    );

    textureController = new TextureController(
      scene,
      scope.cameras,
      domElement,
      scope.controls,
      model,
      this
    );

    attendeeController = new AttendeeController(
      scene,
      scope.cameras,
      domElement,
      scope.controls,
      scope.notes.labelObjects,
      this
    );

    batchController = new BatchController(
      scene,
      scope.cameras,
      domElement,
      hud,
      this,
      scope.controls
    );

    numberController = new NumberController(
      scene,
      scope.cameras,
      domElement,
      scope.controls,
      scope.notes.labelSprites
    );

    // scope.controllers = [controller, labelController, attendeeController, numberController, batchController, multiSelectController];
    scope.controllers = [
      controller,
      drawingController,
      labelController,
      attendeeController,
      numberController,
      batchController,
    ];

    // postprocessing
    composer = new EffectComposer(renderer);
    bwComposer = new EffectComposer(renderer);
    scope.setComposer();

    scope.cameras.onUpdate = () => {
      scope.setComposer();
      scope.setBwComposer();
    };

    // setup camera nicely
    model.floorplan.fireOnRoomLoaded(scope.roomLoaded);

    model.floorplan.fireOnUpdatedRooms(() => {
      scope.updateTargetSpecs();
      scope.needsUpdate();
    });

    scope.lights = new Lights(scene, model.floorplan);

    //The textured floors
    scope.floorplan = new Floorplan(scene, model.floorplan, scope.controls);

    const axes = new AxesHelper(500);
    axes.layers.set(CameraLayers.Grid);
    scene.add(axes);

    // testDiv = document.createElement('input');
    // testDiv.textContent = 'asdf asdf asdfasdfasdf';
    // testDiv.style.fontSize = '48px';
    // testDiv.style.color = 'red';
    // console.log('testDiv', testDiv);
    // const textCSS = new CSS2DObject(testDiv)
    // textCSS.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2)
    // // textCSS.layers.set(CameraLayers.Grid)
    // textCSS.scale.multiplyScalar(10)
    // textCSS.center.x = 0;
    // textCSS.center.y = 0;
    // scene.add(textCSS)
    // console.log(textCSS)

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
      const sceneScans = (store.getState() as ReduxState).designer.floorPlan
        ?.sceneScans;
      const sceneScanLoaded = (store.getState() as ReduxState).blue
        .sceneScanLoaded;

      const storeCameraLayers = (store.getState() as ReduxState).blue
        .cameraLayers;
      renderer.shadowMap.enabled =
        (store.getState() as ReduxState).blue.cameraType !==
        CameraType.Orthographic;
      if (storeCameraLayers !== this.cameraLayers) {
        this.cameraLayers = storeCameraLayers;
        this.cameras.setCameraLayers(this.cameraLayers, this.needsUpdate());
      }
      this.ViewState = (store.getState() as ReduxState).globalstate.viewState;

      if (
        (store.getState() as ReduxState).oidc &&
        (store.getState() as ReduxState).oidc.user
      ) {
        const orgTheme = getOrgTheme(
          (store.getState() as ReduxState).oidc.user.profile.organization_id
        );
        if (this?.theme?.palette) {
          renderer.domElement.style.background = `url(${orgTheme.editorBackground})`;
          renderer.domElement.style.backgroundBlendMode = 'normal';
          renderer.domElement.style.backgroundPosition = 'center';
          renderer.domElement.style.backgroundSize = 'cover';
        }
      }
      const sectionView = (store.getState() as ReduxState).blue.sectionView;
      if (sectionView !== this.sectionView) {
        const globalPlane = new Plane(new Vector3(0, -1, 0), 200);
        if (sectionView) {
          renderer.clippingPlanes = [globalPlane];
        } else {
          renderer.clippingPlanes = [];
        }
        needsUpdate = true;
      }
      if (blueReady && sceneScanLoaded) {
        if (this.loaded === false) {
          this.sceneScanUrls = sceneScans;
          this.loaded = true;
          // this.loaderScene.dispose();
          // domElement.appendChild(renderer.domElement);
        }
        if (sceneScans?.length !== this.sceneScanUrls?.length) {
          this.loadSceneScans(sceneScans);
        }
      }
      if (blueReady) {
        // Dispatch the controlsChange event
        const eventData = {
          cameraPosition: scope.cameras.camera.position, // Camera position
          cameraRotation: scope.cameras.camera.rotation, // Camera rotation
          cameraZoom: scope.cameras.camera.zoom, // Camera zoom level, if relevant
          cameraStatus: scope.cameras.getCameraType(), // Camera type
        };
        eventBus.dispatchEvent(
          new CustomEvent('controlsChange', { detail: eventData })
        );
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
    controlsListener.abort();
    scope.controllers.forEach((controller) => controller?.dispose?.());
    store.dispatch(SetActiveController(ControllerType.Main));

    composer.reset();
    bwComposer.reset();
    scope.controls.dispose();
    batchController.dispose();
    // delete scope.controls;
    floorplan = undefined;
    // Might want to clear cache leaving in for now
    // Cache.clear();
    renderer.forceContextLoss();
    this.unsubscribeStore();
    scope.lights.dispose();
    scope.notes.dispose();
  };

  function logKey(e: KeyboardEvent) {
    switch (e.code) {
      case 'KeyP':
        store.dispatch(SetCameraType(CameraType.Perspective));
        break;
      case 'KeyO':
        store.dispatch(SetCameraType(CameraType.Orthographic));
        break;
      case 'KeyE':
        store.dispatch(SetShaderView(ShaderView.BlackAndWhite));
        break;
      case 'KeyN':
        store.dispatch(SetShaderView(ShaderView.None));
        break;
      case 'KeyC':
        // scope.screenCapture();
        console.log(scope.controls);
        break;
      case 'KeyF':
        // scope.centerCamera();
        renderer.forceContextLoss();
        break;
      case 'KeyG':
        // scope.centerCamera();
        scope.switchOrbit();
        break;
      case 'KeyI':
        console.log(renderer.info);
        console.log(model.scene);
        break;
      case 'KeyH':
        model.floorplan.hideWalls = true;
        controller.controls.dispatchEvent({ type: 'change' });
        controller.needsUpdate = true;
        break;
      case 'KeyV':
        model.floorplan.hideWalls = false;
        controller.controls.dispatchEvent({ type: 'change' });
        controller.needsUpdate = true;
        break;
      case 'KeyS':
        if (e.shiftKey && e.ctrlKey) {
          console.log(scope);
          console.log(scope.getScene());
          console.log(scope.floorplanImageMesh);
          console.log(scope.getCamera());
        }
        break;
    }
  }

  function stopAnimation() {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
  }

  function animate() {
    requestId = requestAnimationFrame(animate);
    if (scope.controls.autoRotate) scope.perspectiveControls.update();
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

    const renderPass = new RenderPass(
      scene.scene,
      scope.cameras.camera,
      yPositionMaterial,
      undefined,
      undefined
    );
    composer.addPass(renderPass);

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

  this.setBwComposer = function () {
    const renderPass = new RenderPass(
      scene.scene,
      scope.cameras.camera,
      undefined,
      undefined,
      undefined
    );
    renderPass.clear = false;
    bwComposer.addPass(renderPass);

    // const effectGrayScale = new ShaderPass(LuminosityShader);
    // effectGrayScale.clear = false;
    // bwComposer.addPass(effectGrayScale);
  };

  function render() {
    // const locationObj = new Object3D();
    // scope.cameras.camera.add(locationObj);
    // locationObj.position.setZ(-1000);
    // const vec = new Vector3();

    // locationObj.updateMatrixWorld();
    // locationObj.matrixWorld.decompose(vec, new Quaternion(), new Vector3());
    // scope.cameras.camera.remove(locationObj);

    renderer.clear();

    if (scope.ViewState === ViewState.PhotosphereView) {
      gl.colorMask(false, false, false, false);
      scope.cameras.camera.layers.set(CameraLayers.Mask);
      scope.cameras.camera.layers.enable(CameraLayers.Walls);
      // scope.cameras.camera.layers.enable(CameraLayers.Fixtures);
      renderer.render(scene.getScene(), scope.cameras.camera);

      gl.colorMask(true, true, true, true);
      scope.cameras.camera.layers.disableAll();
      scope.cameraLayers.forEach((layer) => {
        scope.cameras.camera.layers.enable(layer);
      });
    }
    renderer.render(scene.getScene(), scope.cameras.camera);
    renderer.clearDepth();
    renderer.render(hud.getScene(), scope.cameras.camera);

    labelRenderer.render(scene.getScene(), scope.cameras.camera);
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

  this.getModel = function () {
    return model;
  };

  this.getScene = function () {
    return scene;
  };

  this.getController = function () {
    const activeController = (store.getState() as ReduxState).blue
      .activeController;
    const currentControler = scope.controllers.find((controller) => {
      return controller.controllerType === activeController;
    });
    return currentControler ? currentControler : controller;
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
      //TODO scope.controls.render
      scope.controls.needsUpdate ||
      scope.controls.autoRotate ||
      scope.controls === scope.firstPersonControls ||
      scope.controls === scope.photosphereControls ||
      scope.controls.needsUpdate ||
      scope.cameras.needsUpdate ||
      scope.photosphereControls.autoRotate ||
      scope.controllers.some((controller) => controller.needsUpdate) ||
      needsUpdate ||
      model.scene.needsUpdate
    ) {
      scope.controls.needsUpdate = false;
      scope.cameras.needsUpdate = false;

      if (scope.photosphereControls.autoRotate)
        scope.photosphereControls.update();
      scope.controllers.forEach(
        (controller) => (controller.needsUpdate = false)
      );
      needsUpdate = false;
      model.scene.needsUpdate = false;
      return true;
    }
    return false;
  }

  this.updateWindowSize = (scalingFactorVar = 1) => {
    let scalingFactor = 1;
    if (isNaN(scalingFactorVar)) {
      scalingFactor = 1;
    } else {
      scalingFactor = scalingFactorVar;
    }
    scope.updateTargetSpecs();
    scope.cameras.updateAspect(
      domElement.clientWidth,
      domElement.clientHeight,
      scope.targetSpecs
    );

    renderer.setSize(
      domElement.clientWidth * scalingFactor,
      domElement.clientHeight * scalingFactor
    );
    labelRenderer.setSize(
      domElement.clientWidth * scalingFactor,
      domElement.clientHeight * scalingFactor
    );
    composer.setSize(
      domElement.clientWidth * scalingFactor,
      domElement.clientHeight * scalingFactor
    );
    bwComposer.setSize(
      domElement.clientWidth * scalingFactor,
      domElement.clientHeight * scalingFactor
    );

    effectSobel.uniforms['resolution'].value.x =
      window.innerWidth * window.devicePixelRatio * scalingFactor;
    effectSobel.uniforms['resolution'].value.y =
      window.innerHeight * window.devicePixelRatio * scalingFactor;
    // scope.updateDimensionResolution(domElement.clientWidth, domElement.clientHeight);
    render();
  };

  this.roomLoaded = () => {
    const placezFixturePlan = (store.getState() as ReduxState).designer
      .floorPlan;

    this.updateTargetSpecs();
    this.cameras.initCameraPosition(this.targetSpecs);
    this.fitToView(true);
    this.orthographicControls.setCameraRotation(0);

    this.loadCameraState(placezFixturePlan.cameraState);

    this.onFloorplanUpdate();
  };

  this.onFloorplanUpdate = () => {
    const placezFixturePlan = (store.getState() as ReduxState).designer
      .floorPlan;

    const floorplanImageScale =
      placezFixturePlan.floorplanImageScale &&
      placezFixturePlan.floorplanImageScale > 0
        ? placezFixturePlan.floorplanImageScale
        : 1;
    const floorplanImageUrl = placezFixturePlan.floorplanImageUrl;
    this.onLoadFloorplanImg(floorplanImageUrl, floorplanImageScale);
  };

  // tslint:disable-next-line:ter-arrow-parens
  this.updateTargetSpecs = () => {
    const floorPlanSpecs = model.floorplan.getSpecs();
    if (this.sceneScan) {
      const sceneScanSpecs = Utils.getMeshTargetSpecs(this.sceneScan);
      if (floorPlanSpecs.diagonal > sceneScanSpecs.diagonal) {
        this.setTargetSpecs(floorPlanSpecs);
      } else {
        this.setTargetSpecs(sceneScanSpecs);
      }
    } else {
      this.setTargetSpecs(floorPlanSpecs);
    }
  };

  this.initCameraAndControls = (cameraState?: PlacezCameraState) => {
    if (cameraState) {
      this.loadCameraState(cameraState);
    }

    this.initPhotosphere();
  };

  // loads a new image
  this.onLoadFloorplanImg = (src, scale) => {
    // this is where we add a new image
    if (src) {
      if (src.indexOf('placez.horizoncloud.com') > -1 || src === '') return;
      // floorplan.layoutImage = [new Image()];
      // floorplan.layoutImage[0].src = src;
      // floorplan.layoutImage[0].onload = () => {
      // floorplan.loadImage(src, floorplan.floorplanImageScale)
      new TextureLoader().load(src, this.addFloorplanImage(scale));
    } else {
      if (this.floorplanImageMesh) scene.remove(this.floorplanImageMesh);
    }
  };

  this.addFloorplanImage = (scale: number) => (texture) => {
    if (this.floorplanImageMesh) scene.remove(this.floorplanImageMesh);
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
    scene.add(this.floorplanImageMesh);
  };

  this.loadCameraState = (cameraState: PlacezCameraState) => {
    if (!cameraState) return;
    this.orthographicControls.loadState(cameraState);
    this.perspectiveControls.loadState(cameraState);
  };

  this.initPhotosphere = () => {
    if (this.photosphereMesh) {
      scene.remove(this.photosphereMesh);
    }

    this.photosphereMesh = new Mesh(
      new SphereGeometry(1, 64, 64),
      new MeshBasicMaterial({
        side: BackSide,
      })
    );
  };

  this.setPhotosphere = (photosphere: Photosphere) => {
    const transformation = new Matrix4().fromArray(photosphere.transformation);
    this.initPhotosphere();
    this.photosphereMesh.applyMatrix4(transformation);
    const texture = new TextureLoader().load(`${host}${photosphere.imagePath}`);
    texture.colorSpace = SRGBColorSpace;
    this.photosphereMesh.material.map = texture;
    this.photosphereMesh.material.needsUpdate = true;
    this.photosphereMesh.userData = photosphere;

    this.photosphereMesh.material.depthTest = false;
    this.photosphereMesh.renderOrder = RenderOrder.PhotosphereImage;
    this.photosphereMesh.layers.set(CameraLayers.Photospheres);
  };

  this.viewPhotosphere = (photosphere: Photosphere) => {
    model.floorplan.updateWalls();
    this.setPhotosphere(photosphere);
    this.photosphereControls.setPhotosphere(this.photosphereMesh);
    scene.add(this.photosphereMesh);
    store.dispatch(UpdatePhotosphereSetup(PhotosphereSetup.View));
  };

  this.editPhotosphere = (photosphere: Photosphere) => {
    this.setPhotosphere(photosphere);
    this.photosphereControls.setPhotosphere(this.photosphereMesh);
    scene.add(this.photosphereMesh);
    store.dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home));
  };

  this.setCamera = function (cameraType: CameraType) {
    scope.cameras.setCamera(cameraType);
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

  this.setTargetSpecs = function (targetSpecs: TargetSpecs) {
    scope.targetSpecs = targetSpecs;
  };

  this.centerCamera = function (targetSpecs: TargetSpecs) {
    scope.controls?.setTarget?.(targetSpecs);
    controller.update();
  };

  this.fitToView = (both: boolean) => {
    if (scope.targetSpecs.diagonal === 0) return;
    if (scope.cameras.camera instanceof OrthographicCamera || both) {
      scope.centerCamera(scope.targetSpecs);
      scope.cameras.fitToView(
        scope.targetSpecs,
        scope.orthographicControls.getAzimuthalAngle()
      );
      scope.orthographicControls.saveState();
    }
    if (scope.cameras.camera instanceof PerspectiveCamera || both) {
      scope.perspectiveControls.fitToView(scope.targetSpecs);
      scope.perspectiveControls.saveState();
    }
    updateGrid();
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
      phi: 0,
      theta: 0,
      x: model.targetSpecs.centerOffset.x,
      y: model.targetSpecs.centerOffset.y,
      z: model.targetSpecs.centerOffset.z,
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
        controller.update();
      })
      .onComplete(() => {})
      .start();
  };

  this.screenCapture = function (download?: boolean) {
    this.updateWindowSize(3);
    renderAll();
    try {
      const layoutName = this.getScene().eventName;
      const strMime = 'image/png';
      const imgData = renderer.domElement.toDataURL(strMime);

      const strDownloadMime = 'image/octet-stream';

      if (download) {
        this.saveFile(
          imgData.replace(strMime, strDownloadMime),
          `${layoutName}.png`
        );
      }
      this.updateWindowSize();
      return imgData;
    } catch (e) {
      console.warn(e);
      this.updateWindowSize();
      return;
    }
  };

  this.getBlobAsync = () => {
    const promise = new Promise((resolve, reject) => {
      try {
        const strMime = 'image/png';
        renderer.domElement.toBlob((blob) => {
          resolve(blob);
        }, strMime);
      } catch (e) {
        reject(e);
        console.warn(e);
      }
    });

    return promise;
  };

  this.getRenderer = (): WebGLRenderer => {
    return renderer;
  };

  this.saveFile = function (strData, filename) {
    const link = document.createElement('a');
    document.body.appendChild(link); // Firefox requires the link to be in the body
    link.download = filename;
    link.href = strData;
    link.click();
    document.body.removeChild(link); // remove the link when done
  };

  const updateGrid = () => {
    scope.gridHelper.update(scope.controls);
    const fov = scope.cameras.camera.fov;
    const height = domElement.clientHeight;
    const perspective =
      (0.5 * height) / Math.tan(MathUtils.degToRad(0.5 * fov));
    labelRenderer.domElement.style.perspective = `${perspective}px`;
  };

  this.setOrthographicControls = () => {
    model.floorplan.updateWalls();
    scene.remove(scope.photosphereMesh);

    controlsListener.abort();
    scope.controls.dispose();
    scope.controls = scope.orthographicControls;
    scope.controls.init();
    scope.controls.dispatchEvent({ type: 'change' });
    scope.controls.addEventListener('change', scope.onControlsChange, {
      signal: controlsListener.signal,
    });
    scope.controls.addEventListener('zoom', updateGrid, {
      signal: controlsListener.signal,
    });
    scope.controls.dispatchEvent({ type: 'zoom' });
    controller.setControls(scope.controls);
    batchController.setControls(scope.controls);
  };

  this.setPerspectiveControls = () => {
    model.floorplan.updateWalls();
    scene.remove(scope.photosphereMesh);

    controlsListener.abort();
    scope.controls.dispose();
    scope.controls = scope.perspectiveControls;
    scope.controls.init();
    scope.controls.dispatchEvent({ type: 'change' });
    scope.controls.addEventListener('change', scope.onControlsChange, {
      signal: controlsListener.signal,
    });
    scope.controls.addEventListener('zoom', updateGrid, {
      signal: controlsListener.signal,
    });
    scope.controls.dispatchEvent({ type: 'zoom' });
    controller.setControls(scope.controls);
    batchController.setControls(scope.controls);
  };

  const debounceOnControlsChange = () => {
    const globalViewState = (store.getState() as ReduxState).globalstate
      .globalViewState;
    if (globalViewState === GlobalViewState.Fixtures) {
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
      // Dispatch the controlsChange event with proper event data
      const eventData = {
        cameraPosition: scope.cameras.camera.position,
        cameraRotation: scope.cameras.camera.rotation,
        cameraZoom: scope.cameras.camera.zoom,
        cameraStatus: scope.cameras.getCameraType(),
      };
      eventBus.dispatchEvent(
        new CustomEvent('controlsChange', { detail: eventData })
      );
    } else {
      store.dispatch(
        SetLayout({
          cameraState: scope.getCameraState(),
        })
      );
    }
  };

  this.onControlsChange = debounce(debounceOnControlsChange, 50);

  this.getCameraState = (): PlacezCameraState => {
    this.cameras.pCamera.updateMatrixWorld();
    this.cameras.oCamera.updateMatrixWorld();
    this.cameras.pCamera.updateMatrix();
    this.cameras.oCamera.updateMatrix();
    return {
      perspectiveState: {
        transformation: this.cameras.pCamera.matrixWorld.toArray(),
        target: this.perspectiveControls.perspectiveState.target0.toArray(),
      },
      orthographicState: {
        target: this.orthographicControls.orthographicState.target0.toArray(),
        zoom: this.orthographicControls.orthographicState.zoom0,
        rotation: this.orthographicControls.orthographicState.rotation0,
      },
    };
  };

  this.streetView = (position: Vector3, direction?: Vector3) => {
    scene.remove(scope.photosphereMesh);

    scope.controls.dispose();
    scope.controls = scope.firstPersonControls;
    scope.controls.init();
    scope.controls.dispatchEvent({ type: 'change', showAll: true });
    if (position) {
      scope.controls.setPosition(position);
    } else {
      if (scope.controls.camera.position.equals(new Vector3())) {
        scope.controls.setPosition(scope.targetSpecs.centerOffset);
      }
    }
    if (direction) {
      scope.controls.setDirection(direction);
    }
  };

  this.PhotosphereView = (position: Vector3, direction?: Vector3) => {
    scope.perspectiveControls.dispatchEvent({ type: 'change', showAll: true });

    if (!(scope.controls instanceof PhotosphereControls)) {
      scope.controls.dispose();
      scope.controls = scope.photosphereControls;
      scope.controls.init();
    }
    scope.controls.resetZoom();

    if (position) {
      scope.controls.setPosition(position);
    }
    if (direction) {
      scope.controls.setDirection(direction);
    }
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

  this.buildPhotosphereLocations = (photos: Photosphere[]) => {
    this.photosphereLocations.forEach((obj) => {
      scene.remove(obj);
    });
    this.photosphereLocations = [];
    try {
      photos.forEach((photo: Photosphere) => {
        if (photo.transformation) {
          const photoLocationMesh = this.buildPhotoLocationMesh(photo);
          this.photosphereLocations.push(photoLocationMesh);
          scene.add(photoLocationMesh);
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  this.loadCameraGltf = (cb) => {
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const loader = new GLTFLoader();
    loader.load(`${host}/Assets/camera.glb`, (gltf) => {
      scope.cameraGLTF = gltf.scene.children[0];
      if (cb) {
        cb();
      }
    });
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

  this.buildAttendeeLocations = (
    attendees: Attendee[],
    selectedId?: number
  ) => {
    if (!attendees) return;

    this.attendeeLocations.forEach((obj) => {
      if (obj.children && obj.children.length > 0) {
        const childrenToRemove = [...obj.children];
        childrenToRemove.forEach((child) => {
          obj.remove(child);
        });
      }

      scene.remove(obj);
    });

    this.attendeeLocations = [];

    attendees
      .filter(
        (attendee) =>
          attendee.tableId !== undefined && attendee.chairNumber !== undefined
      )
      .map((attendee) => {
        return {
          selected: selectedId && attendee.id === selectedId,
          attendee,
          item: model.scene
            .getItems()
            .find((item) => item.asset.instanceId === attendee.tableId),
        };
      })
      .forEach(
        (labelData: { selected: boolean; item: Item; attendee: Attendee }) => {
          if (!labelData.item) {
            console.warn('Table not found for attendee', labelData.attendee.id);
            return;
          }

          let chairFound = false;

          labelData.item.traverse((child) => {
            if (
              child.userData.type === 'chair' &&
              child.userData.chairNumber === labelData.attendee.chairNumber
            ) {
              chairFound = true;

              const attendeeLabel = buildAttendeeLabel(
                child,
                labelData.attendee,
                labelData.selected,
                this.theme.palette.primary.main,
                this.theme.palette.secondary.main
              );

              this.attendeeLocations.push(attendeeLabel);
              scene.add(attendeeLabel);
            }
          });

          if (!chairFound) {
            console.warn(
              'Chair not found for attendee',
              labelData.attendee.id,
              'chairNumber:',
              labelData.attendee.chairNumber
            );
          }
        }
      );

    scene.needsUpdate = true;
  };

  // this.buildAttendeeLocationMesh = (chair: Object3D, attendee: Attendee, selected?: boolean) => {
  //   const attendeeVisualizer = new Object3D();
  //   const position = new Vector3();
  //   const quaternion = new Quaternion();
  //   const scale = new Vector3();
  //   chair.matrixWorld.decompose(position, quaternion, scale);
  //   attendeeVisualizer.setRotationFromQuaternion(quaternion);
  //   attendeeVisualizer.position.set(position.x, 150, position.z);

  //   const textGeometry = new TextGeometry(
  //     `${attendee.firstName[0]}${attendee.lastName[0]}`,
  //     {
  //       font: scope.font,
  //       size: 20,
  //       depth: 5,
  //       curveSegments: 12,
  //     }
  //   );
  //   textGeometry.rotateX(-Math.PI / 2);

  //   textGeometry.center();
  //   const textMaterial = new MeshBasicMaterial();
  //   const textMesh = new Mesh(textGeometry, textMaterial);
  //   textMesh.setRotationFromQuaternion(quaternion.inverse());
  //   textMesh.position.setX(-25);
  //   attendeeVisualizer.add(textMesh);

  //   const  planeGeometry = new PlaneGeometry(50, 50);
  //   planeGeometry.rotateX(-Math.PI / 2);
  //   planeGeometry.translate(-25, 0, 0);
  //   const planeMaterial = new MeshBasicMaterial();
  //   if (selected) {
  //     planeMaterial.color.set(new Color(0x471477));
  //   } else {
  //     planeMaterial.color.set(new Color(0x5C236F).convertSRGBToLinear());
  //   }

  //   const planeMesh = new Mesh(planeGeometry, planeMaterial);
  //   attendeeVisualizer.add(planeMesh);

  //   return attendeeVisualizer;
  // };

  this.drawDimensions = (dimensions: DimensionParams[]) => {
    dimensions.forEach((params: DimensionParams) => {
      const lineParam: LineParams = {
        startPoint: {
          position: params.startPoint,
        },
        endPoint: {
          position: params.endPoint,
        },
      };
      const newLine = new PlacezLine(
        lineParam,
        domElement.clientWidth,
        domElement.clientHeight,
        this.theme.palette.primary.main
      );
      this.shapes.push(newLine);
      scene.add(newLine.getShape());
    });
    this.needsUpdate();
  };

  this.createLine = (point: Vector3): PlacezLine => {
    const id = Utils.guid();
    const params: LineParams = {
      startPoint: { position: point.toArray() },
      endPoint: { position: point.toArray() },
    };
    const newLine = new PlacezLine(
      params,
      domElement.clientWidth,
      domElement.clientHeight,
      this.theme.palette.primary.main
    );
    this.shapes.push(newLine);
    scene.add(newLine.getShape());
    this.needsUpdate();
    return newLine;
  };

  // this.updateDimensionResolution = (width, height) => {
  //   this.dimensions.forEach(element => {
  //     element.updateDimensionResolution(width, height);
  //   });
  // }

  this.clearDimensions = () => {
    this.shapes?.forEach((element) => {
      element.delete();
    });
    this.shapes = [];
    this.needsUpdate();
  };

  this.removeShape = (shape: PlacezShape) => {
    this.shapes = this.shapes.filter((element: PlacezShape) => {
      return element !== shape;
    });
    shape.delete();
  };

  this.updateItems = () => {
    controller.updateItems();
  };

  this.getEquirectangular = () => {
    return new Promise((resolve, reject) => {
      const equiManaged = new CubemapToEquirectangular(
        this.getRenderer(),
        true
      );
      const camera = scope.cameras.camera;
      const threeScene = scene.getScene();
      const photosphereLayers = this.cameraLayers.filter(
        (layer: CameraLayers) => {
          return !labelLayers.includes(layer);
        }
      );
      equiManaged.setLayers(photosphereLayers);

      equiManaged.update(camera, threeScene).then((url: string) => {
        renderer.setRenderTarget(null);
        needsUpdate = true;
        resolve(url);
      });
    });
  };

  this.loadSceneScans = (sceneScans: SceneScan[]) => {
    this.sceneScanUrls = sceneScans;
    if (this.sceneScan) {
      scene.remove(this.sceneScan as any);
    }
    // return new Promise((resolve, reject) => {
    const sceneScanPromises: any[] = [];
    if (sceneScans?.length > 0) {
      store.dispatch(ToastMessage('Loading Room Scans', null));
      sceneScans.forEach((sceneScan: SceneScan) => {
        const loadSceneScanPromise = new Promise(
          (sceneScanResolve, sceneScanReject) => {
            Utils.loader.load(
              sceneScan.sceneScanUrl,
              (gltf: GLTF) => {
                const sceneScanMesh = gltf.scene;
                // sceneScanMesh.traverse((obj) => {
                //   if (obj instanceof Mesh) {
                //     if(obj?.material?.side) {
                //       obj.material.side = FrontSide;
                //     }
                //   }
                // })
                // const transMat = new Matrix4().fromArray(sceneScan.transformation);
                // sceneScanMesh.applyMatrix4(transMat)
                sceneScanMesh.scale.multiplyScalar(100);
                this.sceneScan = sceneScanMesh;
                model.scene.sceneScan = sceneScanMesh;

                // this.loaderScene.onPause(() => {
                model.scene.add(sceneScanMesh);
                model.scene.needsUpdate = true;
                model.floorplan.roomLoaded.fire();
                sceneScanResolve(undefined);
                // })
              },
              (xhr: ProgressEvent) => {},
              (e: ErrorEvent) => {
                console.log('failed to load sceneScan');
                sceneScanReject();
              }
            );
          }
        );
        sceneScanPromises.push(loadSceneScanPromise);
      });

      Promise.allSettled(sceneScanPromises)
        .then((values) => {
          store.dispatch(sceneScanLoadedAction());
          store.dispatch(ToastMessage('Room Scans Loaded'));
          // resolve(undefined)
        })
        .catch((error) => {
          // reject();
        });
    } else {
      store.dispatch(sceneScanLoadedAction());
    }
  };

  init();
};

export const buildAttendeeLabel = (
  chair: Object3D,
  attendee: Attendee,
  selected: boolean = false,
  primaryColor: string,
  secondaryColor: string
) => {
  const attendeeVisualizer = new Object3D();
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  chair.matrixWorld.decompose(position, quaternion, scale);
  attendeeVisualizer.setRotationFromQuaternion(quaternion);
  attendeeVisualizer.position.set(position.x, 70, position.z);

  const label = new CSS3DLabelMaker(
    {
      fontSize: 32,
      labelText: `${attendee.firstName[0] ?? ''}${attendee.lastName[0] ?? ''}`,
      textColor: '#ffffff',
      backgroundColor: selected ? secondaryColor : primaryColor,
      marginBottom: -5,
      borderRadius: 6,
      margin: 4,
    },
    CameraLayers.AttendeeLabel
  );

  const sprite = label.getObject();
  sprite.position.setX(-15);
  attendeeVisualizer.add(sprite);

  return attendeeVisualizer;
};
