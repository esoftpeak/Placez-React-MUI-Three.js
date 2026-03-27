import {
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Photosphere } from '../components/Blue/models/Photosphere';
import { Utils } from './core/utils';

export class PhotospherePreview {
  private containerElement: HTMLElement;
  private resourceURL: string;
  private direction: number[];
  private transformation: number[];

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private width: number = 400;
  private height: number = this.width / 1.66;
  private host: string = import.meta.env.VITE_APP_PLACEZ_API_URL;

  private photosphereMesh: THREE.Mesh;

  constructor(containerElement: any, photosphere: Photosphere) {
    this.containerElement = containerElement;
    this.resourceURL = `${this.host}${photosphere.imagePath}`;
    this.direction = photosphere.direction;
    this.transformation = photosphere.transformation;

    this.init();
  }

  private init = () => {
    this.camera = new PerspectiveCamera(70, this.width / this.height, 1, 600);

    this.scene = new Scene();

    const geometry = new SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const texture = new TextureLoader().load(this.resourceURL, () => {
      this.update();
    });

    const material = new MeshBasicMaterial({ map: texture });

    this.photosphereMesh = new Mesh(geometry, material);
    this.scene.add(this.photosphereMesh);

    this.renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.containerElement.appendChild(this.renderer.domElement);

    if (this.direction) {
      this.pointCamera(this.direction, this.transformation);
    }

    this.update();
  };

  public dispose = () => {
    Utils.disposeMesh(this.photosphereMesh);
    this.renderer.forceContextLoss();
  };

  public pointCamera = (dir: number[], transformation: number[]) => {
    const dirVec = new Vector3().fromArray(dir);
    const transformationMat = new Matrix4().fromArray(transformation);

    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();

    transformationMat.decompose(position, rotation, scale);

    (rotation as any).invert();
    dirVec.applyQuaternion(rotation);

    this.camera.lookAt(dirVec);
    this.update();
  };

  private update = () => {
    this.renderer.render(this.scene, this.camera);
  };

  public screenCapture = () => {
    const promise = new Promise((resolve, reject) => {
      try {
        const strMime = 'image/png';
        this.renderer.domElement.toBlob((blob) => {
          resolve(blob);
        }, strMime);
      } catch (e) {
        reject(e);
        console.warn(e);
      }
    });

    return promise;
  };
}
