import { Filter, FilterItem } from './Filter';
import { Scene } from '../../../api';

const filterItems: FilterItem<Scene>[] = [
  {
    id: 0,
    name: '1-50',
    select: (scene) =>
      1 <= scene.estimatedGuestCount && scene.estimatedGuestCount <= 50,
  },
  {
    id: 1,
    name: '50-100',
    select: (scene) =>
      50 <= scene.estimatedGuestCount && scene.estimatedGuestCount <= 100,
  },
  {
    id: 2,
    name: '100-200',
    select: (scene) =>
      100 <= scene.estimatedGuestCount && scene.estimatedGuestCount <= 200,
  },
  {
    id: 4,
    name: '200-300',
    select: (scene) =>
      200 <= scene.estimatedGuestCount && scene.estimatedGuestCount <= 300,
  },
  {
    id: 5,
    name: '400-500',
    select: (scene) =>
      400 <= scene.estimatedGuestCount && scene.estimatedGuestCount <= 500,
  },
  {
    id: 5,
    name: '500+',
    select: (scene) =>
      500 <= scene.estimatedGuestCount,
  },
];

export class GuestCountFilter implements Filter<Scene> {
  name = 'Guest Count';
  items = filterItems;
}

export default GuestCountFilter;
