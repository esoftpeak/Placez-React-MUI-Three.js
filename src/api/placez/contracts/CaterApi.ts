import { Place, PickListOption } from '../models';
import { IHttpResponse } from '../../AuthenticatedBase';

export interface CaterApi {
  // Scenes
  getScenes(): any;
  getScene(sceneId: number): any;
  postScene(scene: any): any;
  putScene(scene: any): any;
  deleteScene(sceneId: number): any;
  getSceneMetrics(startUtcDate: Date, endUtcDate: Date): any;

  // Places
  getPlaces(): any;
  getPlace(placeId: number): Promise<IHttpResponse<Place>>;
  postPlace(place: any): any;
  putPlace(place: any): any;
  deletePlace(placeId: number): any;
  getPlaceMetrics(startUtcDate: Date, endUtcDate: Date): any;

  // Clients
  getClients(): any;
  postClient(client: any): any;
  putClient(client: any): any;
  deleteClient(clientId: number): any;

  // Picklists
  getPickListAll(): any;
  getPickList(id: number): any;
  getPickListOptions(): any;
  postPickListOption(opition: PickListOption);
  deletePickListOption(id: number);

  resetDemoDatabase(): Promise<IHttpResponse<number>>;
}

export default CaterApi;
