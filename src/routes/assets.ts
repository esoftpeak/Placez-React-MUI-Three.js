import { RouteSection } from './Route';

// Icons

// Views
import AssetsPreview from '../views/Assets/AssetsPreview';
import { EventSeatOutlined } from '@mui/icons-material';

const baseUrl = '/assets';
export const assets: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Model Libraries',
    icon: EventSeatOutlined,
    component: AssetsPreview,
  },
};

export default assets;
