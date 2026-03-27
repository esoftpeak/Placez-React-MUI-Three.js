import PlacezLayoutPlan from '../../../api/placez/models/PlacezLayoutPlan';

export class DefaultSceneLayout implements PlacezLayoutPlan {
  constructor(sceneId: number, sceneName: string, floorPlanId: string) {
    this.id = null;
    this.imageUrl = '';
    this.name = `${sceneName} Layout`;
    this.layoutBlob = '[]';
    this.sceneId = sceneId;
    this.commentsCount = 0;
    this.viewsCount = 0;
    this.floorPlanId = floorPlanId;
    this.price = 0;
  }

  id: string;
  imageUrl: string;
  name: string;
  sceneId: number;
  layoutBlob: string;
  commentsCount: number;
  viewsCount: number;
  floorPlanId: string;
  price: number;
}
