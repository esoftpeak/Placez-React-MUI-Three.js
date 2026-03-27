import {
  ClampToEdgeWrapping,
  CubeCamera,
  DoubleSide,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  RawShaderMaterial,
  Scene,
  UnsignedByteType,
  WebGLCubeRenderTarget,
  WebGLRenderTarget,
} from 'three';
import { placezApi } from '../../api';
import { CameraLayers } from '../../models/BlueState';

const vertexShader = `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;

void main()  {

	vUv = vec2( 1.- uv.x, uv.y );
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`;

const fragmentShader = `
precision mediump float;

uniform samplerCube map;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

vec3 linearToSRGB(vec3 linearColor) {
    return pow(linearColor, vec3(1.0 / 2.2));
}

void main()  {

	vec2 uv = vUv;

	float longitude = uv.x * 2. * M_PI - M_PI + M_PI / 2.;
	float latitude = uv.y * M_PI;

	vec3 dir = vec3(
		- sin( longitude ) * sin( latitude ),
		cos( latitude ),
		- cos( longitude ) * sin( latitude )
	);
	normalize( dir );

	vec4 texColor = textureCube( map, dir );
  vec3 sRGBColor = linearToSRGB(texColor.rgb);
  gl_FragColor = vec4( sRGBColor, 1.0 );


}
`;

export class CubemapToEquirectangular {
  public renderer;
  public provideCubeCamera: boolean;
  public width: number;
  public height: number;
  public material: RawShaderMaterial;
  public scene: Scene;
  public quad: Mesh;
  public camera: OrthographicCamera;
  public canvas;
  public ctx;
  public cubeCamera;
  public attachedCamera;
  public cubeMapSize;
  private _gl;

  constructor(renderer, provideCubeCamera) {
    this.renderer = renderer;
    this.provideCubeCamera = provideCubeCamera;
    this._gl = this.renderer.getContext();

    this.width = 1;
    this.height = 1;

    this.material = new RawShaderMaterial({
      uniforms: {
        // map: { type: 't', value: null }
        map: { value: null },
      },
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
    });

    this.scene = new Scene();
    this.quad = new Mesh(new PlaneGeometry(1, 1), this.material);
    this.scene.add(this.quad);
    this.camera = new OrthographicCamera(
      1 / -2,
      1 / 2,
      1 / 2,
      1 / -2,
      -10000,
      10000
    );

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.cubeCamera = null;
    this.attachedCamera = null;

    this.setSize(4096, 2048);

    this.cubeMapSize = this._gl.getParameter(
      this._gl.MAX_CUBE_MAP_TEXTURE_SIZE
    );

    if (this.provideCubeCamera) {
      this.getCubeCamera(2048);
    }
  }

  public setSize = function (width, height) {
    this.width = width;
    this.height = height;

    this.quad.scale.set(this.width, this.height, 1);

    this.camera.left = this.width / -2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = this.height / -2;

    this.camera.updateProjectionMatrix();

    this.output = new WebGLRenderTarget(this.width, this.height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      format: RGBAFormat,
      type: UnsignedByteType,
    });

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  };

  public getCubeCamera = function (size) {
    const cubeMapSize = Math.min(this.cubeMapSize, size);
    const options = {
      format: RGBAFormat,
      magFilter: LinearFilter,
      minFilter: LinearFilter,
    };
    const renderTarget = new WebGLCubeRenderTarget(cubeMapSize, options);
    this.cubeCamera = new CubeCamera(0.1, 100000, renderTarget);

    return this.cubeCamera;
  };

  public convert = function (cubeCamera, download?: boolean) {
    return new Promise((resolve) => {
      this.quad.material.uniforms.map.value = cubeCamera.renderTarget.texture;
      this.renderer.clear();
      this.renderer.setRenderTarget(this.output);
      this.renderer.render(this.scene, this.camera);

      const pixels = new Uint8Array(4 * this.width * this.height);
      this.renderer.readRenderTargetPixels(
        this.output,
        0,
        0,
        this.width,
        this.height,
        pixels
      );

      const imageData = new ImageData(
        new Uint8ClampedArray(pixels),
        this.width,
        this.height
      );

      if (download) {
        this.download(imageData);
      } else {
        this.ctx.putImageData(imageData, 0, 0);

        this.canvas.toBlob((blob) => {
          const fileName = `pano-${document.title}-${Date.now()}.jpg`;
          const formData = new FormData();
          formData.append('file', blob, fileName);
          if (download) {
            this.downloadImage(blob);
          } else {
            placezApi.postBlob(formData).then((data) => {
              resolve(data.parsedBody.fileName);
            });
          }
        }, 'image/jpg');
      }
    });
  };

  public downloadImage = function (blob) {
    const url = URL.createObjectURL(blob);
    const fileName = `pano-${document.title}-${Date.now()}.jpg`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', fileName);
    anchor.className = 'download-js-link';
    anchor.innerHTML = 'downloading...';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    setTimeout(() => {
      anchor.click();
      document.body.removeChild(anchor);
    }, 1);
  };

  public update = function (camera, scene, download?: boolean) {
    return new Promise((resolve) => {
      const autoClear = this.renderer.autoClear;
      this.renderer.autoClear = true;
      this.cubeCamera.position.copy(camera.position);
      scene.add(this.cubeCamera);

      // first pass
      this._gl.colorMask(false, false, false, false);
      this.cubeCamera.layers.set(CameraLayers.Mask);
      this.cubeCamera.layers.enable(CameraLayers.Walls);
      // scope.cameras.camera.layers.enable(CameraLayers.Fixtures);
      this.cubeCamera.update(this.renderer, scene);

      this.renderer.autoClear = false;

      // second pass
      this._gl.colorMask(true, true, true, true);
      this.cubeCamera.layers.disableAll();
      this.layers.forEach((layer) => {
        this.cubeCamera.layers.enable(layer);
      });

      this.cubeCamera.update(this.renderer, scene);
      this.renderer.autoClear = autoClear;

      this.convert(this.cubeCamera, download).then((url) => {
        scene.remove(this.cubeCamera);
        resolve(url);
      });
    });
  };

  public setLayers = function (layers: CameraLayers[]) {
    this.cubeCamera.layers.set(0);
    this.layers = layers;
    layers.forEach((layer: CameraLayers) => {
      this.cubeCamera.layers.enable(layer);
    });
  };
}
