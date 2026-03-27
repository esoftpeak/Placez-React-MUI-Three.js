import { Filter, FilterItem } from './Filter';
import { Scene } from '../../../api';

const filterItems: FilterItem<Scene>[] = [
  {
    id: 0,
    name: '0$ - $100',
    select: (scene) => scene.guaranteedSpend <= 100,
  },
  {
    id: 1,
    name: '$100 - $500',
    select: (scene) =>
      100 < scene.guaranteedSpend && scene.guaranteedSpend <= 500,
  },
  {
    id: 2,
    name: '$500 - $1000',
    select: (scene) =>
      500 < scene.guaranteedSpend && scene.guaranteedSpend <= 1000,
  },
  {
    id: 3,
    name: '$1000+',
    select: (scene) => 1000 < scene.guaranteedSpend,
  },
];

export class SceneValueFilter implements Filter<Scene> {
  name = 'Value';
  items = filterItems;
}

export default SceneValueFilter;
