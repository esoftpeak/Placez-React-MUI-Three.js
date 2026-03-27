import {
  CubeTexture,
  CubeTextureLoader,
  FrontSide,
  MeshPhysicalMaterial,
} from 'three';
import negY from '../../../assets/cubeMap/negY.png';
import posX from '../../../assets/cubeMap/posX.png';
import posY from '../../../assets/cubeMap/posY.png';
import { Utils } from '../../../blue/core/utils';
import { MaterialManager } from '../../../blue/three/materialManager';
export interface PlacezMaterial {
  id: string;
  name?: string;
  threeJSMaterial?: any;
  scale?: number;
  tags?: string[];
  preview?: string;
  mediaAssetId?: number;
  placedAssetId?: number;
  organizationId?: number;
  map?: string;
  color?: string;
  transparent?: boolean;
  opacity?: number;
  url?: string;
  materialUrl?: string;
  appliedMaterialId?: string;
}

export interface PlacedMaterial extends PlacezMaterial {
  appliedMaterialId?: string;
}

export const MaterialCategories = [
  'Brick',
  // 'Ceiling',
  'Concrete',
  'Carpet',
  'Fabric',
  'Floor',
  'Foliage',
  // 'Glass',
  // 'Granite',
  'Ground',
  'Leather',
  'Linen',
  'Marble',
  'Metal',
  // 'Misc',
  // 'Paper',
  'Plaster',
  'Plastic',
  'Rock',
  // 'Roof',
  'Stone',
  'Tiles',
  'Wall',
  // 'Water',
  'Wood',
];

export const TypesOfMaps = [
  'map',
  'normalMap',
  'roughnessMap',
  'aoMap',
  // 'displacementMap',
];

export const PlacezEnvMap: CubeTexture = new CubeTextureLoader().load([
  posX,
  posX,
  posY,
  negY,
  posX,
  posX,
]);

export const GetImgUrlForMap = (
  placezMaterial: PlacezMaterial,
  mapType: string
) => {
  if (
    placezMaterial &&
    placezMaterial.threeJSMaterial &&
    placezMaterial.threeJSMaterial[mapType] &&
    placezMaterial.threeJSMaterial[mapType].length !== 0
  ) {
    const mapId = placezMaterial.threeJSMaterial[mapType];

    const texture = placezMaterial.threeJSMaterial.textures.find((texture) => {
      return texture.uuid === mapId;
    });

    const img = placezMaterial.threeJSMaterial.images.find((image) => {
      return image.uuid === texture.image;
    });
    if (img.url.startsWith('data:image')) {
      return img.url;
    }
    return Utils.buildPath(`${img.url}`);
  }
  return '';
};

export const DefaultTexture = {
  uuid: '',
  name: '',
  mapping: 300,
  repeat: [1, 1],
  offset: [0, 0],
  center: [0, 0],
  rotation: 0,
  wrap: [1000, 1000],
  format: 1022,
  type: 1009,
  encoding: 3001,
  minFilter: 1008,
  magFilter: 1006,
  anisotropy: 1,
  flipY: true,
  premultiplyAlpha: false,
  unpackAlignment: 4,
  image: '',
};

const EmptyGuid = '00000000-0000-0000-0000-000000000000';

export const MinifiedColors: string[] = [
  '#ffffff',
  '#fffff0',
  '#d32f2f',
  '#e91e63',
  '#9c27b0',
  '#3f51b5',
  '#2196f3',
  '#00bcd4',
  '#4caf50',
  '#ffeb3b',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#969696',
  '#000000',
];

export const Colors: string[] = [
  '#ffcdd2',
  '#e57373',
  '#f44336',
  '#d32f2f',
  '#b71c1c',
  '#f8bbd0',
  '#f06292',
  '#e91e63',
  '#c2185b',
  '#880e4f',
  '#e1bee7',
  '#ba68c8',
  '#9c27b0',
  '#7b1fa2',
  '#41148c',
  '#d1c4e9',
  '#9575cd',
  '#673ab7',
  '#512da8',
  '#311b92',
  '#c5cae9',
  '#7986cb',
  '#3f51b5',
  '#303f9f',
  '#1a237e',
  '#bbdefb',
  '#64b5f6',
  '#2196f3',
  '#1976d2',
  '#0d47a1',
  '#b3e5fc',
  '#4fc3f7',
  '#03a9f4',
  '#0288d1',
  '#01579b',
  '#b2ebf2',
  '#4dd0e1',
  '#00bcd4',
  '#0097a7',
  '#006064',
  '#b2dfdb',
  '#4db6ac',
  '#009688',
  '#00796b',
  '#004d40',
  '#c8e6c9',
  '#81c784',
  '#4caf50',
  '#388e3c',
  '#194d33',
  '#dcedc8',
  '#aed581',
  '#8bc34a',
  '#689f38',
  '#33691e',
  '#f0f4c3',
  '#dce775',
  '#cddc39',
  '#afb42b',
  '#827717',
  '#fff9c4',
  '#fff176',
  '#ffeb3b',
  '#fbc02d',
  '#f57f17',
  '#ffecb3',
  '#ffd54f',
  '#ffc107',
  '#ffa000',
  '#ff6f00',
  '#ffe0b2',
  '#ffb74d',
  '#ff9800',
  '#f57c00',
  '#e65100',
  '#ffccbc',
  '#ff8a65',
  '#ff5722',
  '#e64a19',
  '#bf360c',
  '#d7ccc8',
  '#a1887f',
  '#795548',
  '#5d4037',
  '#3e2723',
  '#cfd8dc',
  '#90a4ae',
  '#607d8b',
  '#455a64',
  '#263238',
  '#ffffff',
  '#d9d9d9',
  '#969696',
  '#525252',
  '#000000',
];

export const colorNames = {
  red: ['#ffcdd2', '#e57373', '#f44336', '#d32f2f', '#b71c1c'],
  pink: ['#f8bbd0', '#f06292', '#e91e63', '#c2185b', '#880e4f'],
  purple: [
    '#e1bee7',
    '#ba68c8',
    '#9c27b0',
    '#7b1fa2',
    '#41148c',
    '#d1c4e9',
    '#9575cd',
    '#673ab7',
    '#512da8',
    '#311b92',
  ],
  blue: [
    '#c5cae9',
    '#7986cb',
    '#3f51b5',
    '#303f9f',
    '#1a237e',
    '#bbdefb',
    '#64b5f6',
    '#2196f3',
    '#1976d2',
    '#0d47a1',
  ],
  lightblue: ['#b3e5fc', '#4fc3f7', '#03a9f4', '#0288d1', '#01579b'],
  cyan: ['#b2ebf2', '#4dd0e1', '#00bcd4', '#0097a7', '#006064'],
  teal: ['#b2dfdb', '#4db6ac', '#009688', '#00796b', '#004d40'],
  green: ['#c8e6c9', '#81c784', '#4caf50', '#388e3c', '#194d33'],
  lightgreen: ['#dcedc8', '#aed581', '#8bc34a', '#689f38', '#33691e'],
  lime: ['#f0f4c3', '#dce775', '#cddc39', '#afb42b', '#827717'],
  yellow: ['#fff9c4', '#fff176', '#ffeb3b', '#fbc02d', '#f57f17'],
  amber: ['#ffecb3', '#ffd54f', '#ffc107', '#ffa000', '#ff6f00'],
  orange: ['#ffe0b2', '#ffb74d', '#ff9800', '#f57c00', '#e65100'],
  deeporange: ['#ffccbc', '#ff8a65', '#ff5722', '#e64a19', '#bf360c'],
  brown: ['#d7ccc8', '#a1887f', '#795548', '#5d4037', '#3e2723'],
  grey: ['#cfd8dc', '#90a4ae', '#607d8b', '#455a64', '#263238'],
  gray: ['#cfd8dc', '#90a4ae', '#607d8b', '#455a64', '#263238'],
  white: ['#ffffff', '#d9d9d9'],
  black: ['#000000', '#525252', '#969696'],
};

// export const CustomMaterial: PlacezMaterial = {
//   id: null,
//   name: 'DefaultTexture',
//   threeJSMaterial: {
//     metadata: {
//       version: 4.5,
//       type: 'Material',
//       generator: 'Material.toJSON',
//     },
//     uuid: '1DFBA969-03B6-4FA0-B2FE-DD909135C3F9',
//     type: 'MeshPhysicalMaterial',
//     color: 16777215,
//     roughness: 1,
//     metalness: 0,
//     emissive: 0,
//     map: '05B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//     normalMap: '15B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//     roughnessMap: '25B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//     bumpMap: '35B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//     aoMap: '45B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//     side: 1,
//     stencilWrite: false,
//     stencilWriteMask: 255,
//     stencilFunc: 519,
//     stencilRef: 0,
//     stencilFuncMask: 255,
//     stencilFail: 7680,
//     stencilZFail: 7680,
//     stencilZPass: 7680,
//     textures: [
//       {
//         uuid: '05B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//         name: '',
//         mapping: 300,
//         repeat: [
//           1,
//           1,
//         ],
//         offset: [
//           0,
//           0,
//         ],
//         center: [
//           0,
//           0,
//         ],
//         rotation: 0,
//         wrap: [
//           1000,
//           1000,
//         ],
//         format: 1022,
//         type: 1009,
//         encoding: 3001,
//         minFilter: 1008,
//         magFilter: 1006,
//         anisotropy: 1,
//         flipY: true,
//         premultiplyAlpha: false,
//         unpackAlignment: 4,
//         image: '0D98CD51-12A1-41F0-8D05-AF465D566CF6',
//       },
//       {
//         uuid: '15B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//         name: '',
//         mapping: 300,
//         repeat: [
//           1,
//           1,
//         ],
//         offset: [
//           0,
//           0,
//         ],
//         center: [
//           0,
//           0,
//         ],
//         rotation: 0,
//         wrap: [
//           1000,
//           1000,
//         ],
//         format: 1022,
//         type: 1009,
//         encoding: 3001,
//         minFilter: 1008,
//         magFilter: 1006,
//         anisotropy: 1,
//         flipY: true,
//         premultiplyAlpha: false,
//         unpackAlignment: 4,
//         image: '1D98CD51-12A1-41F0-8D05-AF465D566CF6',
//       },
//       {
//         uuid: '25B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//         name: '',
//         mapping: 300,
//         repeat: [
//           1,
//           1,
//         ],
//         offset: [
//           0,
//           0,
//         ],
//         center: [
//           0,
//           0,
//         ],
//         rotation: 0,
//         wrap: [
//           1000,
//           1000,
//         ],
//         format: 1022,
//         type: 1009,
//         encoding: 3001,
//         minFilter: 1008,
//         magFilter: 1006,
//         anisotropy: 1,
//         flipY: true,
//         premultiplyAlpha: false,
//         unpackAlignment: 4,
//         image: '2D98CD51-12A1-41F0-8D05-AF465D566CF6',
//       },
//       {
//         uuid: '35B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//         name: '',
//         mapping: 300,
//         repeat: [
//           1,
//           1,
//         ],
//         offset: [
//           0,
//           0,
//         ],
//         center: [
//           0,
//           0,
//         ],
//         rotation: 0,
//         wrap: [
//           1000,
//           1000,
//         ],
//         format: 1022,
//         type: 1009,
//         encoding: 3001,
//         minFilter: 1008,
//         magFilter: 1006,
//         anisotropy: 1,
//         flipY: true,
//         premultiplyAlpha: false,
//         unpackAlignment: 4,
//         image: '3D98CD51-12A1-41F0-8D05-AF465D566CF6',
//       },
//       {
//         uuid: '45B2D697-E7E2-466E-A8CD-172D11EFB8CB',
//         name: '',
//         mapping: 300,
//         repeat: [
//           1,
//           1,
//         ],
//         offset: [
//           0,
//           0,
//         ],
//         center: [
//           0,
//           0,
//         ],
//         rotation: 0,
//         wrap: [
//           1000,
//           1000,
//         ],
//         format: 1022,
//         type: 1009,
//         encoding: 3001,
//         minFilter: 1008,
//         magFilter: 1006,
//         anisotropy: 1,
//         flipY: true,
//         premultiplyAlpha: false,
//         unpackAlignment: 4,
//         image: '4D98CD51-12A1-41F0-8D05-AF465D566CF6',
//       },
//     ],
//     images: [
//       {
//         uuid: '0D98CD51-12A1-41F0-8D05-AF465D566CF6',
//         name: 'color',
//         url: 'https://dev-placez-media.horizoncloud.com/Assets/3f62ce4c-a28f-470d-a912-1bd0127f924d.jpg',
//       },
//       {
//         uuid: '1D98CD51-12A1-41F0-8D05-AF465D566CF6',
//         name: 'normal',
//         url: 'https://dev-placez-media.horizoncloud.com/Assets/e86df8a6-f7fe-4726-96e3-21e827e86ac0.jpg',
//       },
//       {
//         uuid: '2D98CD51-12A1-41F0-8D05-AF465D566CF6',
//         name: 'roughness',
//         url: 'https://dev-placez-media.horizoncloud.com/Assets/347a323e-b1d6-4307-949a-09038d0078cf.jpg',
//       },
//       {
//         uuid: '3D98CD51-12A1-41F0-8D05-AF465D566CF6',
//         name: 'height',
//         url: 'https://dev-placez-media.horizoncloud.com/Assets/972b142c-c635-4417-8ec5-6e092520039a.png',
//       },
//       {
//         uuid: '4D98CD51-12A1-41F0-8D05-AF465D566CF6',
//         name: 'ambient',
//         url: 'https://dev-placez-media.horizoncloud.com/Assets/e493adc8-59fd-4848-92d7-444ab16e0c0a.jpg',
//       },
//     ],
//   },
// };

export enum DefaultMaterialIds {
  defaultWallMaterial = '41c8b80b-4ad0-44c1-a6e8-657a79fad6a4',
  defaultFloorMaterial = 'c39394fd-5b15-46e8-8cc5-f1cbbf156000',
  DefaultWhite = '4db2448a-2606-4ce9-b959-87b55a0f71a3',
}

export const DefaultWallMaterial: PlacedMaterial = {
  id: EmptyGuid,
  appliedMaterialId: DefaultMaterialIds.defaultWallMaterial,
  name: 'White',
  threeJSMaterial: {
    color: 16777215,
    emissive: 0xffffff,
    emissiveIntensity: 0.35,
    metalness: 0,
    roughness: 0.5,
    transparent: false,
    opacity: 1,
    toneMapped: true,
    metadata: {
      version: 4.5,
      type: 'Material',
      generator: 'Material.toJSON',
    },
    type: 'MeshPhysicalMaterial',
    images: [],
    textures: [{ repeat: [1, 1] }],
  },
};

export const DefaultFloorMaterial: PlacedMaterial = {
  id: EmptyGuid,
  appliedMaterialId: DefaultMaterialIds.defaultWallMaterial,
  name: 'White',
  threeJSMaterial: {
    color: 16777215,
    emissive: 0xffffff,
    emissiveIntensity: 0.35,
    metalness: 0,
    roughness: 0.5,
    transparent: false,
    opacity: 1,
    toneMapped: true,
    metadata: {
      version: 4.5,
      type: 'Material',
      generator: 'Material.toJSON',
    },
    type: 'MeshPhysicalMaterial',
    images: [],
    textures: [{ repeat: [1, 1] }],
  },
};

export const DefaultMaterial: PlacedMaterial = {
  id: EmptyGuid,
  appliedMaterialId: DefaultMaterialIds.DefaultWhite,
  name: 'White',
  threeJSMaterial: {
    color: 16777215,
    emissive: 0x000000,
    metalness: 0,
    roughness: 0.5,
    transparent: false,
    opacity: 1,
    toneMapped: true,
    metadata: {
      version: 4.5,
      type: 'Material',
      generator: 'Material.toJSON',
    },
    type: 'MeshPhysicalMaterial',
    images: [],
    textures: [{ repeat: [1, 1] }],
  },
};

export const FallbackWallMaterial = new MeshPhysicalMaterial({
  color: 16777215,
  roughness: 0.5,
});

export const FallbackFloorMaterial = new MeshPhysicalMaterial({
  color: 16777215,
  roughness: 0.5,
});

export const DefaultWallMaterialPromise = (material: PlacezMaterial) => {
  return new Promise((resolve) => {
    new MaterialManager(material, (mat: MeshPhysicalMaterial) => {
      mat.depthTest = true;
      mat.side = FrontSide;
      resolve(mat);
    });
  });
};

export const DefaultFloorMaterialPromise = (material: PlacezMaterial) => {
  return new Promise((resolve) => {
    new MaterialManager(material, (mat: MeshPhysicalMaterial) => {
      mat.depthTest = false; // TODO still not working
      resolve(mat);
    });
  });
};
