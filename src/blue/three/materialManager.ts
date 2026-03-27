import {
  ClampToEdgeWrapping,
  CubeReflectionMapping,
  CubeRefractionMapping,
  CubeTexture,
  CubeUVReflectionMapping,
  DefaultLoadingManager,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  ImageLoader,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearMipmapNearestFilter,
  LinearSRGBColorSpace,
  LoadingManager,
  MaterialLoader,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapNearestFilter,
  RGBAFormat,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  UVMapping,
  UnsignedByteType,
} from 'three';
import { PlacezMaterial } from '../../api/placez/models/PlacezMaterial';

const encodingMap = {
  3000: LinearSRGBColorSpace,
  3001: SRGBColorSpace,
};

const formatMap = {
  1022: RGBAFormat,
};

const typeMap = {
  1009: UnsignedByteType,
};

export class MaterialManager {
  private TEXTURE_MAPPING = {
    UVMapping: UVMapping,
    CubeReflectionMapping: CubeReflectionMapping,
    CubeRefractionMapping: CubeRefractionMapping,
    EquirectangularReflectionMapping: EquirectangularReflectionMapping,
    EquirectangularRefractionMapping: EquirectangularRefractionMapping,
    CubeUVReflectionMapping: CubeUVReflectionMapping,
  };
  private TEXTURE_WRAPPING = {
    RepeatWrapping: RepeatWrapping,
    ClampToEdgeWrapping: ClampToEdgeWrapping,
    MirroredRepeatWrapping: MirroredRepeatWrapping,
  };
  private TEXTURE_FILTER = {
    NearestFilter: NearestFilter,
    NearestMipmapNearestFilter: NearestMipmapNearestFilter,
    NearestMipmapLinearFilter: NearestMipmapNearestFilter,
    LinearFilter: LinearFilter,
    LinearMipmapNearestFilter: LinearMipmapNearestFilter,
    LinearMipmapLinearFilter: LinearMipmapLinearFilter,
  };
  private resourcePath = import.meta.env.VITE_APP_PLACEZ_API_URL;

  private manager = DefaultLoadingManager;

  constructor(mat: PlacezMaterial, cb) {
    if (mat.threeJSMaterial) {
      if (
        mat.threeJSMaterial.map ||
        mat.threeJSMaterial.normalMap ||
        mat.threeJSMaterial.aoMap ||
        mat.threeJSMaterial.displacementMap ||
        mat.threeJSMaterial.roughnessMap
      ) {
        const images = this.parseImages(mat.threeJSMaterial.images, () => {
          let textures;
          if (mat.threeJSMaterial.textures) {
            textures = this.parseTextures(mat.threeJSMaterial.textures, images);
          }
          const materials = this.parseMaterials(
            [mat.threeJSMaterial],
            textures ? textures : undefined
          );
          const retMaterial = Object.values(materials)[0];
          cb(retMaterial);
        });
      } else {
        const materials = this.parseMaterials([mat.threeJSMaterial], undefined);
        const retMaterial = Object.values(materials)[0];
        cb(retMaterial);
      }
    }
  }

  public async digestMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
  }

  private parseTextures(json, images) {
    function parseConstant(value, type) {
      if (typeof value === 'number') return value;

      console.warn(
        'ObjectLoader.parseTexture: Constant should be in numeric form.',
        value
      );

      return type[value];
    }

    const textures = {};

    if (json !== undefined) {
      for (let i = 0, l = json.length; i < l; i++) {
        const data = json[i];

        if (data.image === undefined) {
          console.warn('ObjectLoader: No "image" specified for', data.uuid);
        }

        if (images[data.image] === undefined) {
          console.warn('ObjectLoader: Undefined image', data.image);
        }

        let texture;

        if (Array.isArray(images[data.image])) {
          texture = new CubeTexture(images[data.image]);
        } else {
          texture = new Texture(images[data.image]);
        }

        texture.needsUpdate = true;

        texture.uuid = data.uuid;

        if (data.name !== undefined) texture.name = data.name;

        if (data.mapping !== undefined)
          texture.mapping = parseConstant(data.mapping, this.TEXTURE_MAPPING);

        if (data.offset !== undefined) texture.offset.fromArray(data.offset);
        if (data.repeat !== undefined) texture.repeat.fromArray(data.repeat);
        if (data.center !== undefined) texture.center.fromArray(data.center);
        if (data.rotation !== undefined) texture.rotation = data.rotation;

        if (data.wrap !== undefined) {
          texture.wrapS = parseConstant(data.wrap[0], this.TEXTURE_WRAPPING);
          texture.wrapT = parseConstant(data.wrap[1], this.TEXTURE_WRAPPING);
        }

        if (data.format !== undefined) texture.format = formatMap[data.format];
        if (data.type !== undefined) texture.type = typeMap[data.type];
        if (data.encoding !== undefined)
          texture.colorSpace = encodingMap[data.encoding];

        if (data.minFilter !== undefined)
          texture.minFilter = parseConstant(
            data.minFilter,
            this.TEXTURE_FILTER
          );
        if (data.magFilter !== undefined)
          texture.magFilter = parseConstant(
            data.magFilter,
            this.TEXTURE_FILTER
          );
        if (data.anisotropy !== undefined) texture.anisotropy = data.anisotropy;

        if (data.flipY !== undefined) texture.flipY = data.flipY;

        if (data.premultiplyAlpha !== undefined)
          texture.premultiplyAlpha = data.premultiplyAlpha;
        if (data.unpackAlignment !== undefined)
          texture.unpackAlignment = data.unpackAlignment;

        textures[data.uuid] = texture;
      }
    }

    return textures;
  }

  private parseImages(json, onLoad) {
    const images = {};
    const loadImage = (url: string) => {
      this.manager.itemStart(url);

      return loader.load(
        url,
        () => {
          this.manager.itemEnd(url);
        },
        undefined,
        () => {
          this.manager.itemError(url);
          this.manager.itemEnd(url);
        }
      );
    };

    let loader;

    if (json !== undefined && json.length > 0) {
      const manager = new LoadingManager(onLoad);

      loader = new ImageLoader(manager);
      // loader.setCrossOrigin( this.crossOrigin );

      for (let i = 0, il = json.length; i < il; i++) {
        const image = json[i];
        const url = image.url;

        if (Array.isArray(url)) {
          // load array of images e.g CubeTexture

          images[image.uuid] = [];

          for (let j = 0, jl = url.length; j < jl; j++) {
            const currentUrl = url[j];

            const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(currentUrl)
              ? currentUrl
              : this.resourcePath + currentUrl;

            images[image.uuid].push(loadImage(path));
          }
        } else {
          // load single image

          const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(image.url)
            ? image.url
            : this.resourcePath + image.url;

          images[image.uuid] = loadImage(path);
        }
      }
    }

    return images;
  }

  private parseMaterials(json, textures) {
    const cache = {}; // MultiMaterial
    const materials = {};

    if (json !== undefined) {
      const loader = new MaterialLoader();
      loader.setTextures(textures);

      for (let i = 0, l = json.length; i < l; i++) {

        const data = {
          type: 'MeshPhysicalMaterial',
          metadata: {
            generator: 'Material.toJSON',
            type: 'Material',
            version: 4.5,
          },
          ...json[i]
        }

        if (data.type === 'MultiMaterial') {
          // Deprecated

          const array = [];

          for (let j = 0; j < data.materials.length; j++) {
            const material = data.materials[j];

            if (cache[material.uuid] === undefined) {
              cache[material.uuid] = loader.parse(material);
            }

            array.push(cache[material.uuid]);
          }

          materials[data.uuid] = array;
        } else {
          if (cache[data.uuid] === undefined) {
            cache[data.uuid] = loader.parse(data);
          }

          materials[data.uuid] = cache[data.uuid];
        }
      }
    }

    return materials;
  }
}
