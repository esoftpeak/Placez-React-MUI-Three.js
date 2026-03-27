import { RouteSection } from './Route';

// Icons

// Views
import { ListProducts, EditProductAsset } from '../DAM/product/';
import { EditPlacezMaterial, ShowMaterials } from '../DAM/material/';
import { Environment } from '../sharing/environment';

const baseUrl = '/media';

export const mediaAssets: RouteSection =
  import.meta.env.VITE_APP_ENVIRONMENT !== Environment.Production
    ? {
        main: {
          path: `${baseUrl}`,
          name: 'Room Library',
          icon: null,
          component: ListProducts,
        },
        new: {
          path: `${baseUrl}/new`,
          name: 'New Room',
          component: EditProductAsset,
        },
        edit: {
          path: `${baseUrl}/:id`,
          name: 'Edit Event',
          component: EditProductAsset,
        },
        materialList: {
          path: `${baseUrl}/material/list`,
          name: 'List Materials',
          component: ShowMaterials,
        },
        newMaterial: {
          path: `${baseUrl}/material/new`,
          name: 'New Material',
          component: EditPlacezMaterial,
        },
        material: {
          path: `${baseUrl}/material/:id`,
          name: 'Edit Material',
          component: EditPlacezMaterial,
        },
      }
    : {
        main: {
          path: '/',
          name: 'Home',
          icon: null,
          component: null,
        },
      };
export default mediaAssets;
