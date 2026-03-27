import { RouteSection } from './Route';

// Icons
import { RulerIcon } from '../assets/icons';

import {
  SettingsOutlined as SettingsIcon,
  ArrowDropDownCircleOutlined as QuickPicksIcon,
  ReportProblemOutlined as CollisionIcon,
} from '@mui/icons-material';

// Views
import { MainRoute } from '.';
import Settings from '../views/Settings/Settings';

interface SettingRoutes {
  general: MainRoute;
  // formatting?: MainRoute,
  quickpicks: MainRoute;
  collision: MainRoute;
}

export enum SettingsRoute {
  General = 'general',
  // Formatting = 'formatting',
  Quickpicks = 'quickpicks',
  Collision = 'collision',
  Payments = 'payments',
  Invoices = 'invoices',
  Business = 'business',
  Setup = 'setup',
  Settings = 'settings',
}

const baseUrl = '/settings';
export const settings: RouteSection & SettingRoutes = {
  main: {
    path: `${baseUrl}/general`,
    name: 'Settings',
    icon: SettingsIcon,
    // component: QuickPickSettings,
    component: Settings,
  },
  [SettingsRoute.General]: {
    path: `${baseUrl}/${SettingsRoute.General}`,
    name: 'General',
    component: Settings,
    icon: RulerIcon,
  },
  // [SettingsRoute.Formatting]: {
  //   path: `${baseUrl}/formatting`,
  //   name: 'Formatting',
  //   // component: FormattingSettings,
  //   component: Settings,
  //   icon: LanguageIcon,
  // },
  [SettingsRoute.Quickpicks]: {
    path: `${baseUrl}/quickpicks`,
    name: 'Quickpicks',
    // component: QuickPickSettings,
    component: Settings,
    icon: QuickPicksIcon,
  },
  [SettingsRoute.Collision]: {
    path: `${baseUrl}/collision`,
    name: 'Collision',
    // component: CollisionSettings,
    component: Settings,
    icon: CollisionIcon,
  },
};

export default settings;
