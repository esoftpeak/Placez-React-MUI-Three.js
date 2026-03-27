import {
  Box3,
  Matrix4,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  PlacezEnvMap,
  PlacezMaterial,
} from '../api/placez/models/PlacezMaterial';

import { Lights } from '../blue/three/lights';

import { Utils } from './core/utils';
import { Asset } from './items';

import { LoadIndicator } from './three/LoadIndicator';
import { PerspectiveControls } from './three/PerspectiveControls';
import { placezApi } from '../api'

export const ItemPreview = function (
  mediaAssetUrl: string,
  asset: Asset,
  containerElement?: any,
  onItemLoad?: (
    item: THREE.Object3D,
    materialMask: PlacezMaterial[]
  ) => () => void
) {
  let controls;
  let camera;
  let scene;
  let renderer;
  let light;
  let loader;
  let loadIndicator;

  this.asset = asset;
  this.item = undefined;
  this.materialsBak = [];

  const init = () => {
    const full = 250;

    scene = new Scene();

    loadIndicator = new LoadIndicator(scene);

    if (containerElement) {
      camera = new PerspectiveCamera(
        45,
        containerElement.clientWidth / containerElement.clientHeight,
        1,
        20000
      );
      camera.position.set(150, 250, 350);

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
      containerElement.appendChild(renderer.domElement);
      controls = new PerspectiveControls(camera, renderer.domElement);
      controls.init();
      controls.target.set(0, 0, 0);
      controls.update();
    }

    const onLoad = gltf => {
      const cleanMesh = Utils.cleanExport(gltf.scene, this.asset.sku);
      if (cleanMesh === undefined) {
        console.warn('gltf failed compression');
      }
      const m = new Matrix4().fromArray(this.asset.transformation);
      const mToCm = new Matrix4().makeScale(100, 100, 100);
      cleanMesh.applyMatrix4(mToCm);
      cleanMesh.applyMatrix4(m);
      const center = new Vector3();
      const bbox = new Box3().setFromObject(cleanMesh).getCenter(center);
      center.sub(cleanMesh.position);
      cleanMesh.position.sub(center);
      loadIndicator.dispose();
      if (
        this.asset.extensionProperties &&
        this.asset.extensionProperties.enviromentMap
      ) {
        addEnvMap(cleanMesh);
      }
      this.item = cleanMesh;
      this.materialsBak = (
        cleanMesh.material as THREE.MeshPhysicalMaterial[]
      ).map((material: THREE.MeshPhysicalMaterial) => {
        if (material) {
          return material.clone();
        }
        return undefined;
      });
      Utils.applyCustomMaterials(this.item, this.asset.materialMask).then(
        onItemLoad(
          this.item,
          this.asset.materialMask
            ? this.asset.materialMask
            : (cleanMesh.material as THREE.Material[]).map(() => {
                return null;
              })
        )
      );
      scene.add(this.item);
      setTimeout(() => {
        console.log(`${renderer?.info.render.triangles} Triangles`);
      }, 1000);
    };
    loader = new GLTFLoader();
    loader.load(mediaAssetUrl, onLoad, (xhr) => {
      loadIndicator.update(xhr.loaded / xhr.total);
    });
  };

  init();
  animate();

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
      const strMime = 'image/png';
      renderer.domElement.toBlob(cb, strMime);
    } catch (e) {
      console.warn(e);
      return;
    }
  };

  this.getMaterialsBak = (): PlacezMaterial[] => {
    return this.materialsBak.map(
      (material: THREE.MeshPhysicalMaterial): PlacezMaterial => {
        if (material) {
          return {
            id: null,
            threeJSMaterial: material.toJSON(),
          };
        }
        return null;
      }
    );
  };

  this.update = (asset, cb) => {
    const materialMaskPromises = [];
    this.asset = asset;
    this.asset?.materialMask?.forEach((material, index) => {
      if (material) {
        materialMaskPromises.push(
          Utils.applyCustomMaterial(
            this.item.material[index],
            this.asset.materialMask[index]
          )
        );
      } else {
        this.item.material[index] = this.materialsBak[index]
          ? this.materialsBak[index].clone()
          : null;
      }
    });
    Promise.all(materialMaskPromises).then(cb);
  };

  this.setMaterialMask = (material: PlacezMaterial, index, cb?) => {
    this.asset.materialMask[index] = material;
    if (material) {
      Utils.applyCustomMaterial(
        this.item.material[index],
        this.asset.materialMask[index]
      ).then(cb);
    } else {
      this.item.material[index] = this.materialsBak[index].clone();
      cb();
    }
  };

  this.dispose = () => {
    Utils.disposeMesh(this.item);
    controls.dispose();
    renderer.forceContextLoss();
  };

  function addEnvMap(item: THREE.Object3D) {
    traverseMaterials(item, (material) => {
      if (
        material.isMeshStandardMaterial ||
        material.isGLTFSpecularGlossinessMaterial
      ) {
        material.envMap = PlacezEnvMap;
        material.needsUpdate = true;
      }
    });
  }

  function traverseMaterials(object, callback) {
    object.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach((material: THREE.MeshPhysicalMaterial) => {
        if (material) {
          callback(material);
        }
      });
    });
  }

  this.getSizeFromGeometry = (): { width: number; depth: number; height: number } => {
    if (!this.item || !this.item.geometry || !this.item.geometry.boundingBox) {
      console.warn('Cannot get size: item or geometry not loaded');
      return { width: 0, depth: 0, height: 0 };
    }

    const size = new Vector3();
    this.item.geometry.boundingBox.getSize(size);
    const worldScale = new Vector3();
    this.item.getWorldScale(worldScale);
    return {
      width: Math.abs(size.x * worldScale.x),
      depth: Math.abs(size.z * worldScale.z),
      height: Math.abs(size.y * worldScale.y),
    };
  };


  this.getSize = (): { width: number; depth: number; height: number } => {
    const size = new Vector3();
    this.item.geometry.boundingBox.getSize(size);
    return {
      width: size.x * 100,
      depth: size.z * 100,
      height: size.y * 100,
    };
  };
};
