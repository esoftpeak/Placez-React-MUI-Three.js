import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CameraLayers } from '../models/BlueState';
import { TablePreviewController } from './controllers/TablePreviewController';

import { Utils } from './core/utils';
import { Asset } from './items';
import { Factory } from './items/factory';
import { LoadIndicator } from './three/LoadIndicator';
import { SeatInstance } from './itemModifiers/ChairMod';
import { buildAttendeeLabel } from './three/main';
import { Lights } from './three/lights';
import {
  Matrix4,
  PerspectiveCamera,
  Sprite,
  Vector3,
  WebGLRenderer,
  Scene,
  Object3D,
  Box3,
} from 'three';
import { PerspectiveControls } from './three/PerspectiveControls';
import Attendee from '../api/placez/models/Attendee'
import { placezApi } from '../api'

export const TablePreview = function (
  mediaAssetUrl: string,
  asset: Asset,
  containerElement?: any,
  handleToggleSeatHidden?: (chairIndex: number) => (event?: any) => void,
  handleModifiersChanged?: (modifiers) => void,
  attendees?: Attendee[]
) {
  let controls;
  let camera;
  let renderer;
  let light;

  this.asset = { ...asset };

  if (!(this.asset.transformation == null)) {
    this.asset.transformation[12] = 0;
    this.asset.transformation[13] = 0;
    this.asset.transformation[14] = 0;
  }

  this.attendeeContainer = new Object3D();
  this.item = undefined;
  this.materialsBak = [];
  this.itemReady = false;

  const scene = new Scene();
  const loadIndicator = new LoadIndicator(scene);

  if (containerElement) {
    camera = new PerspectiveCamera(
      45,
      containerElement.clientWidth / containerElement.clientHeight,
      1,
      2000
    );

    camera.layers.enableAll();
    camera.layers.disable(CameraLayers.TitleLabel);
    camera.layers.disable(CameraLayers.NumberLabel);
    camera.layers.disable(CameraLayers.TableNumberLabel);
    camera.layers.disable(CameraLayers.ChairNumberLabel);
    camera.layers.disable(CameraLayers.AttendeeLabel);

    camera.position.set(150, 250, 350);
    const lights = new Lights(scene);
    lights.updateSize(new Vector3(360, 0, 360));

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
    containerElement.appendChild(renderer.domElement);
    controls = new PerspectiveControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.init();
    controls.update();

    this.controller = new TablePreviewController(
      scene,
      camera,
      containerElement,
      controls
    );
  }
  this.item = new (Factory.getClass(asset.classType))({ ...asset });

  this.addAttendees = () => {
    if (!attendees || attendees.length === 0) return;
    this.attendeeContainer.children.forEach((child: Sprite) => {
      this.attendeeContainer.remove(child);
    });
    attendees
      .filter((attendee: Attendee) => {
        return (
          attendee.chairNumber !== undefined &&
          attendee.tableId === this.item.asset.instanceId
        );
      })
      .forEach((attendee: Attendee) => {
        this.item.traverse((child) => {
          if (
            child.userData.type === 'chair' &&
            child.userData.chairNumber === attendee.chairNumber
          ) {
            const attendeeLabel = buildAttendeeLabel(
              child,
              attendee,
              undefined,
              '0xff00ff',
              '0xffff00'
            );

            // this.attendeeLocations.push(attendeeLabel);
            this.attendeeContainer.add(attendeeLabel);
          }
        });
      });
  };

  this.item.onRegisterCallback(() => {
    scene.add(this.item);
    this.controller.setItem(this.item);
    this.chairClickedSub = this.controller.doOnChairClickSubscription(
      this.chairClicked
    );
    this.addAttendees();
  });

  this.item.configureMode = true;

  this.chairClicked = (chairNumber: number) => {
    const newSeatPositions =
      this.item.asset.modifiers.chairMod.seatPositions.map(
        (seat: SeatInstance) => {
          if (seat.chairIndex === chairNumber) {
            handleToggleSeatHidden(chairNumber);
            return {
              ...seat,
              hidden: !seat.hidden,
            };
          }
          return seat;
        }
      );

    this.item.asset = {
      ...this.item.asset,
      modifiers: {
        ...this.item.asset.modifiers,
        chairMod: {
          ...this.item.asset.modifiers.chairMod,
          seatPositions: newSeatPositions,
        },
      },
    };
    handleModifiersChanged(this.item?.asset?.modifiers);
  };

  const onLoad = (gltf) => {
    loadIndicator.dispose();
    const cleanMesh = Utils.cleanExport(gltf.scene, this.asset.sku);
    if (cleanMesh === undefined) {
      console.warn('gltf failed compression');
      return;
    }
    const m = new Matrix4().fromArray(this.asset.transformation);
    const mToCm = new Matrix4().makeScale(100, 100, 100);
    cleanMesh.applyMatrix4(mToCm);
    cleanMesh.applyMatrix4(m);
    this.item.asset.gltf = cleanMesh;
    this.item.init(undefined);
    camera.lookAt(0, this.item.getHeight() / 2, 0);
    controls.target.set(0, this.item.getHeight() / 2, 0);
    this.itemReady = true;
    handleModifiersChanged(this.item?.asset?.modifiers);
    this.addAttendees();
  };
  // stats
  const loader = new GLTFLoader();
  loader.load(mediaAssetUrl, onLoad, (xhr) => {
    loadIndicator.update(xhr.loaded / xhr.total);
  });

  animate();
  scene.add(this.attendeeContainer);

  const updateWindowSize = () => {
    camera.aspect =
      containerElement.clientWidth / containerElement.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      containerElement.clientWidth,
      containerElement.clientHeight
    );
    renderer.render(scene, camera);
    this.controller.resize(containerElement);
  };

  this.resizeObserver = new ResizeObserver(updateWindowSize).observe(
    containerElement
  );

  function animate() {
    if (containerElement) {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
  }

  this.takePic = (cb) => {
    this.getBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, `${this.asset.id}.png`);
      placezApi.postBlob(formData).then((data) => {
        cb(data.parsedBody.path);
      });
    });
  };

  this.getBlob = (cb) => {
    try {
      this.item.configureMode = false;
      this.item.build(() => {
        const strMime = 'image/png';
        camera.layers.disable(CameraLayers.ChairNumberLabel);
        camera.layers.disable(CameraLayers.AttendeeLabel);
        renderer.render(scene, camera);
        renderer.domElement.toBlob(cb, strMime);
      });
    } catch (e) {
      console.warn(e);
      return;
    }
  };

  this.update = (newAsset: Asset, cb) => {
    if (!this.itemReady) return;
    this.item.asset = {
      ...newAsset,
      modifiers: {
        ...newAsset.modifiers,
      },
    };
    this.item.boundingBox = new Box3();
    this.item.boundingBox.copy(
      this.item.updateBoundingBox(this.item.boundingBox)
    );
    this.item.build((e) => {
      handleModifiersChanged(this.item?.asset?.modifiers);
      this.addAttendees();
    });
  };

  this.dispose = () => {
    renderer.forceContextLoss();
    this.resizeObserver.disconnect();
    controls.dispose();
    this?.chairclickedSub?.unsubscribe();
  };

  this.setCameraLayers = (layers: CameraLayers[]) => {
    camera.layers.disable(CameraLayers.ChairNumberLabel);
    camera.layers.disable(CameraLayers.AttendeeLabel);
    layers.forEach((layer: CameraLayers) => {
      camera.layers.enable(layer);
    });
    renderer.render(scene, camera);
  };
};
