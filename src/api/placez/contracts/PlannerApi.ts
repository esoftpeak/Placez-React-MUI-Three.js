import { IHttpResponse } from '../../AuthenticatedBase';
import { PlacezLayoutPlan, PlacezFixturePlan } from '../models';

interface PlannerApi {
  // Scene
  getSceneLayouts(sceneId: number): any;

  getPlaceFloorPlans(placeId: number): any;

  // Layouts
  getLayout(layoutId: string): Promise<IHttpResponse<PlacezLayoutPlan>>;
  getLayouts(): Promise<IHttpResponse<PlacezLayoutPlan[]>>;
  postLayout(
    layout: PlacezLayoutPlan
  ): Promise<IHttpResponse<PlacezLayoutPlan>>;
  putLayout(layout: PlacezLayoutPlan): Promise<IHttpResponse<PlacezLayoutPlan>>;
  deleteLayout(layoutId: string): Promise<IHttpResponse<any>>;

  // Floor Plan
  getFloorPlans(): Promise<IHttpResponse<PlacezFixturePlan[]>>;
  getFloorPlan(placeId: string): Promise<IHttpResponse<PlacezFixturePlan>>;
  postFloorPlan(
    floorPlan: PlacezFixturePlan
  ): Promise<IHttpResponse<PlacezFixturePlan>>;
  putFloorPlan(
    floorPlanId: string,
    floorplan: PlacezFixturePlan
  ): Promise<IHttpResponse<PlacezFixturePlan>>;

  // Asset Collection
  getAssetCollections(): Promise<IHttpResponse<any[]>>;
}

export default PlannerApi;
