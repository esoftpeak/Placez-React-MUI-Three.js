import { Filter, FilterItem } from './Filter';
import { PickList, PickListOption, Scene } from '../../../api';

const buildFilterItems = (sceneTypes: PickList): FilterItem<Scene>[] => {
  if (!sceneTypes || !sceneTypes.picklistOptions) {
    return [];
  }

  return sceneTypes.picklistOptions
    .sort((a: PickListOption, b: PickListOption) => a.sortOrder - b.sortOrder)
    .map((sceneType: PickListOption, index: number) => ({
      id: index,
      name: sceneType.name,
      select: (scene) => scene.categories.includes(sceneType.id),
    }));
};

export class SceneCategoryFilter implements Filter<Scene> {
  constructor(sceneTypes: PickList) {
    this.name = 'Type';
    this.items = buildFilterItems(sceneTypes);
  }

  name: string;
  items: FilterItem<Scene>[];
}

export default SceneCategoryFilter;
