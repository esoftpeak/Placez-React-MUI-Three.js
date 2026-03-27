import { RouteSection } from './Route';

// Icons

// Views
import { Catalog, CatalogEdit } from '../DAM/catalog';
import { Environment } from '../sharing/environment';

const baseUrl = '/catalog';
export const mediaAssets: RouteSection =
  import.meta.env.VITE_APP_ENVIRONMENT !== Environment.Production
    ? {
        main: {
          path: `${baseUrl}`,
          name: 'list catalog',
          icon: null,
          component: Catalog,
        },
        edit: {
          path: `${baseUrl}/edit/:cat/:pri/:sub`,
          name: 'Edit Event',
          component: CatalogEdit,
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
