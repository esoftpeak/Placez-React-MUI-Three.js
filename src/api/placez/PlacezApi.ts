import { AuthenticatedBase, IHttpResponse } from '../AuthenticatedBase';
import queryString from 'query-string';
import CaterApi from './contracts/CaterApi';
import PlannerApi from './contracts/PlannerApi';
import {
  PlaceDetail,
  Place,
  Scene,
  ChatSession,
  ChatMessage,
  PickList,
  PickListOption,
  UserSetting,
  Attendee,
  PlacezLayoutPlan,
  PlacezFixturePlan,
  ShareLayoutRequest,
  LayoutLabel,
  AssetCatalog,
} from './models';
import HPayPayment from '../payments/models/Payment';
import { Asset, AssetGroup } from '../../blue/items';
import { PlacezMaterial } from './models/PlacezMaterial';
import PostCard, { SavedCardsResponse } from './models/Card';
import InvoiceFormat from './models/InvoiceFormat';
import BusinessDetails from './models/BusinessDetails';

export default class PlacezApi
  extends AuthenticatedBase
  implements CaterApi, PlannerApi
{
  private url: string = 'tempUrl';

  constructor(url: string) {
    super();
    this.url = url;

    this.getAssetCollections = this.getAssetCollections.bind(this);

    this.getClients = this.getClients.bind(this);
    this.postClient = this.postClient.bind(this);
    this.putClient = this.putClient.bind(this);
    this.deleteClient = this.deleteClient.bind(this);

    this.getFloorPlan = this.getFloorPlan.bind(this);
    this.getFloorPlans = this.getFloorPlans.bind(this);
    this.postFloorPlan = this.postFloorPlan.bind(this);
    this.putFloorPlan = this.putFloorPlan.bind(this);
    this.deleteFloorPlan = this.deleteFloorPlan.bind(this);

    this.getLayout = this.getLayout.bind(this);
    this.getLayouts = this.getLayouts.bind(this);
    this.postLayout = this.postLayout.bind(this);
    this.putLayout = this.putLayout.bind(this);
    this.putLayouts = this.putLayouts.bind(this);
    this.deleteLayout = this.deleteLayout.bind(this);
    this.shareLayout = this.shareLayout.bind(this);
    this.viewLayout = this.viewLayout.bind(this);
    this.getTemplates = this.getTemplates.bind(this);

    this.getPlaces = this.getPlaces.bind(this);
    this.getPlace = this.getPlace.bind(this);
    this.postPlace = this.postPlace.bind(this);
    this.putPlace = this.putPlace.bind(this);
    this.deletePlace = this.deletePlace.bind(this);
    this.getPlaceMetrics = this.getPlaceMetrics.bind(this);
    this.getPlaceFloorPlans = this.getPlaceFloorPlans.bind(this);

    this.getScenes = this.getScenes.bind(this);
    this.getScene = this.getScene.bind(this);
    this.postScene = this.postScene.bind(this);
    this.putScene = this.putScene.bind(this);
    this.deleteScene = this.deleteScene.bind(this);
    this.getSceneMetrics = this.getSceneMetrics.bind(this);
    this.getSceneLayouts = this.getSceneLayouts.bind(this);

    this.getChatSession = this.getChatSession.bind(this);
    this.createChatSessionMessage = this.createChatSessionMessage.bind(this);

    this.getPickListAll = this.getPickListAll.bind(this);
    this.getPickList = this.getPickList.bind(this);
    this.getPickListOptions = this.getPickListOptions.bind(this);
    this.postPickListOption = this.postPickListOption.bind(this);
    this.putPickListOption = this.putPickListOption.bind(this);
    this.deletePickListOption = this.deletePickListOption.bind(this);

    this.getUserSettings = this.getUserSettings.bind(this);
    this.putUserSetting = this.putUserSetting.bind(this);

    this.getAttendees = this.getAttendees.bind(this);
    this.getAttendeeByLayoutId = this.getAttendeeByLayoutId.bind(this);
    this.updateAttendeeByLayoutId = this.updateAttendeeByLayoutId.bind(this);
    this.postAttendee = this.postAttendee.bind(this);
    this.putAttendee = this.putAttendee.bind(this);
    this.deleteAttendee = this.deleteAttendee.bind(this);

    this.getLayoutChatSessions = this.getLayoutChatSessions.bind(this);

    this.resetDemoDatabase = this.resetDemoDatabase.bind(this);

    this.getLabels = this.getLabels.bind(this);
    this.postLabel = this.postLabel.bind(this);
    this.deleteLabel = this.deleteLabel.bind(this);

    this.getPayments = this.getPayments.bind(this);
    this.createPayment = this.createPayment.bind(this);
    this.updatePayment = this.updatePayment.bind(this);

    this.getCustomInvoiceLineItem = this.getCustomInvoiceLineItem.bind(this);
    this.createCustomInvoiceLineItem =
      this.createCustomInvoiceLineItem.bind(this);
    this.updateCustomInvoiceLineItem =
      this.updateCustomInvoiceLineItem.bind(this);
    this.deleteCustomInvoiceLineItem =
      this.deleteCustomInvoiceLineItem.bind(this);

    this.postBlob = this.postBlob.bind(this);
    this.postMediaAsset = this.postMediaAsset.bind(this);
    this.getMediaAssets = this.getMediaAssets.bind(this);
    this.getMediaAssetsByCollection =
      this.getMediaAssetsByCollection.bind(this);
    this.deleteMediaAsset = this.deleteMediaAsset.bind(this);

    this.getAssetCatalog = this.getAssetCatalog.bind(this);
    this.getAssetCatalogById = this.getAssetCatalogById.bind(this);
    this.postAssetCatalog = this.postAssetCatalog.bind(this);
    this.postCustomAsset = this.postCustomAsset.bind(this);
    this.deleteCustomAsset = this.deleteCustomAsset.bind(this);
    this.getCustomAssets = this.getCustomAssets.bind(this);
    this.getMaterials = this.getMaterials.bind(this);
    this.getMaterial = this.getMaterial.bind(this);
    this.postMaterial = this.postMaterial.bind(this);
    this.deleteMaterial = this.deleteMaterial.bind(this);
    this.postGroup = this.postGroup.bind(this);
    this.getAssetGroups = this.getAssetGroups.bind(this);
    this.deleteAssetGroup = this.deleteAssetGroup.bind(this);

    this.createPlacezPayment = this.createPlacezPayment.bind(this);
  }

  // AssetCollection
  public async getAssetCollections(): Promise<IHttpResponse<any[]>> {
    return await super.get<any[]>(`${this.url}/assetcollection`);
  }

  // Clients
  public async getClients() {
    return await super.get<any[]>(`${this.url}/client`);
  }

  public async postClient(client: any) {
    return await super.post<any>(`${this.url}/client`, client);
  }

  public async putClient(client: any) {
    return await super.put<any>(`${this.url}/client/${client.id}`, client);
  }

  public async deleteClient(clientId: number) {
    return await super.delete<number>(`${this.url}/client/${clientId}`);
  }

  public async postClientCard(clientId: number, card: PostCard) {
    return await super.post<number>(
      `${this.url}/client/${clientId}/cards`,
      card
    );
  }

  public async getClientCards(clientId: number) {
    return await super.get<SavedCardsResponse>(
      `${this.url}/client/${clientId}/cards`
    );
  }

  public async deleteClientCard(clientId: number, cardId: number) {
    return await super.delete<number>(
      `${this.url}/client/${clientId}/card/${cardId}`
    );
  }

  // Floor Plan

  public async getFloorPlan(
    floorPlanId: string
  ): Promise<IHttpResponse<PlacezFixturePlan>> {
    return await super.get<PlacezFixturePlan>(
      `${this.url}/floorplan/${floorPlanId}`
    );
  }

  public async getFloorPlans(): Promise<IHttpResponse<PlacezFixturePlan[]>> {
    return await super.get<PlacezFixturePlan[]>(`${this.url}/floorplan`);
  }

  public async putFloorPlan(
    floorPlanId: string,
    floorplan: PlacezFixturePlan
  ): Promise<IHttpResponse<PlacezFixturePlan>> {
    return await super.put<PlacezFixturePlan>(
      `${this.url}/floorplan/${floorPlanId}`,
      floorplan
    );
  }

  public async deleteFloorPlan(floorPlanId: string) {
    return await super.delete<number>(`${this.url}/floorplan/${floorPlanId}`);
  }

  public async postFloorPlan(
    floorplan: PlacezFixturePlan
  ): Promise<IHttpResponse<PlacezFixturePlan>> {
    return await super.post<PlacezFixturePlan>(
      `${this.url}/floorplan`,
      floorplan
    );
  }

  // Layout
  public async getLayouts(): Promise<IHttpResponse<any[]>> {
    const response = await super.get<any[]>(`${this.url}/layout`);
    if (response.parsedBody !== undefined) {
      response.parsedBody = response.parsedBody.map((scene) => ({
        ...scene,
        startUtcDateTime: new Date(scene.startUtcDateTime),
        endUtcDateTime: new Date(scene.endUtcDateTime),
      }));
    }
    return response;
  }

  public async getLayout(
    layoutId?: string
  ): Promise<IHttpResponse<PlacezLayoutPlan>> {
    const response = await super.get<any>(`${this.url}/layout/${layoutId}`);
    if (response.parsedBody !== undefined) {
      response.parsedBody = {
        ...response.parsedBody,
        startUtcDateTime: new Date(response.parsedBody.startUtcDateTime),
        endUtcDateTime: new Date(response.parsedBody.endUtcDateTime),
      };
    }
    return response;
  }

  public async getTemplates(): Promise<IHttpResponse<PlacezLayoutPlan>> {
    return await super.get<PlacezLayoutPlan>(`${this.url}/layout/templates`);
  }

  public async getLayoutChatSessions(
    layoutId?: string
  ): Promise<IHttpResponse<any[]>> {
    return await super.get<any[]>(`${this.url}/layout/${layoutId}/chatSession`);
  }

  public async putLayout(
    layout: PlacezLayoutPlan
  ): Promise<IHttpResponse<PlacezLayoutPlan>> {
    const payload = {
      ...layout,
      startUtcDateTime: layout.startUtcDateTime.toISOString(),
      endUtcDateTime: layout.endUtcDateTime.toISOString(),
    };
    const response = await super.put<PlacezLayoutPlan>(
      `${this.url}/layout/${layout.id}`,
      payload
    );
    if (response.parsedBody !== undefined) {
      response.parsedBody = {
        ...response.parsedBody,
        startUtcDateTime: new Date(response.parsedBody.startUtcDateTime),
        endUtcDateTime: new Date(response.parsedBody.endUtcDateTime),
      };
    }
    return response;
  }

  public async putLayouts(
    layouts: PlacezLayoutPlan[]
  ): Promise<IHttpResponse<PlacezLayoutPlan[]>> {
    const payload = layouts.map((layout) => ({
      ...layout,
      startUtcDateTime: layout.startUtcDateTime.toISOString(),
      endUtcDateTime: layout.endUtcDateTime.toISOString(),
    }));
    const response = await super.put<PlacezLayoutPlan[]>(
      `${this.url}/layouts`,
      payload
    );
    if (response.parsedBody !== undefined) {
      response.parsedBody = response.parsedBody.map((scene) => ({
        ...scene,
        startUtcDateTime: new Date(scene.startUtcDateTime),
        endUtcDateTime: new Date(scene.endUtcDateTime),
      }));
    }
    return response;
  }

  public async deleteLayout(layoutId: string): Promise<IHttpResponse<any>> {
    return await super.delete<any>(`${this.url}/layout/${layoutId}`);
  }

  public async postLayout(
    layout: PlacezLayoutPlan
  ): Promise<IHttpResponse<any>> {
    const payload = {
      ...layout,
      startUtcDateTime:
        typeof layout.startUtcDateTime === 'string'
          ? layout.startUtcDateTime
          : layout.startUtcDateTime.toISOString(),
      endUtcDateTime:
        typeof layout.endUtcDateTime === 'string'
          ? layout.endUtcDateTime
          : layout.endUtcDateTime.toISOString(),
    };

    const response = await super.post<any>(`${this.url}/layout`, payload);
    if (response.parsedBody !== undefined) {
      response.parsedBody = {
        ...response.parsedBody,
        startUtcDateTime: new Date(response.parsedBody.startUtcDateTime),
        endUtcDateTime: new Date(response.parsedBody.endUtcDateTime),
      };
    }
    return response;
  }

  public async shareLayout(
    shareModel: ShareLayoutRequest
  ): Promise<IHttpResponse<any>> {
    return await super.post<any>(`${this.url}/share`, shareModel);
  }

  public async viewLayout(layoutId: string): Promise<IHttpResponse<any>> {
    return await super.put<any>(`${this.url}/layout/${layoutId}/view`, null);
  }

  // Places

  public async getPlaces() {
    return await super.get<Place[]>(`${this.url}/place`);
  }

  public async getPlace(placeId: number): Promise<IHttpResponse<Place>> {
    return await super.get<Place>(`${this.url}/place/${placeId}`);
  }

  public async postPlace(place: PlaceDetail) {
    return await super.post<Place>(`${this.url}/place`, place);
  }

  public async putPlace(place: Place) {
    return await super.put<Place>(`${this.url}/place/${place.id}`, place);
  }

  public async deletePlace(placeId: number) {
    return await super.delete<number>(`${this.url}/place/${placeId}`);
  }

  public async getPlaceMetrics(
    startUtcDate: Date,
    endUtcDate: Date,
    takeFirst?: number,
    byClients?: boolean
  ) {
    let qs = '';

    if (startUtcDate || endUtcDate || takeFirst || byClients) {
      qs = `?${queryString.stringify({ startUTCDate: startUtcDate ? startUtcDate.toISOString() : null, endUtcDate: endUtcDate ? endUtcDate.toISOString() : null, takeFirst, byClients })}`;
    }

    return await super.get<any[]>(`${this.url}/place/metrics${qs}`);
  }

  public async getPlaceFloorPlans(
    placeId: number
  ): Promise<IHttpResponse<any[]>> {
    return await super.get<any[]>(`${this.url}/place/${placeId}/floorplan`);
  }

  // Scenes

  public async getScenes() {
    return await super.get<Scene[]>(`${this.url}/scene`);
  }

  public async getScene(sceneId: number): Promise<IHttpResponse<Scene>> {
    return await super.get<Scene>(`${this.url}/scene/${sceneId}`);
  }

  public async postScene(scene: any) {
    return await super.post<Scene[]>(`${this.url}/scene`, scene);
  }

  public async putScene(scene: any) {
    return await super.put<Scene>(`${this.url}/scene/${scene.id}`, scene);
  }

  public async deleteScene(sceneId: number) {
    return await super.delete<number>(`${this.url}/scene/${sceneId}`);
  }

  public async getSceneMetrics(startUtcDate: Date, endUtcDate: Date) {
    // tslint:disable-next-line
    return await super.get<any[]>(
      `${this.url}/scene/metrics${startUtcDate.toISOString() || endUtcDate.toISOString() ? `?startUtcDate=${startUtcDate.toISOString()}&endUtcDate=${endUtcDate.toISOString()}` : ''}`
    );
  }

  public async getSceneLayouts(sceneId: number): Promise<IHttpResponse<any[]>> {
    const response = await super.get<any[]>(
      `${this.url}/scene/${sceneId}/layout`
    );
    if (response.parsedBody !== undefined) {
      response.parsedBody = response.parsedBody.map((scene) => ({
        ...scene,
        startUtcDateTime: new Date(scene.startUtcDateTime),
        endUtcDateTime: new Date(scene.endUtcDateTime),
      }));
    }
    return response;
  }

  // Chat

  public async getChatSession(
    sessionId: string,
    lastMessageId?: number
  ): Promise<IHttpResponse<ChatSession[]>> {
    const result = await super.get<ChatSession[]>(
      `${this.url}/chat/chatsession/${sessionId}?minMessageId=${lastMessageId ? lastMessageId : ''}`
    );
    return result;
  }

  public async createChatSessionMessage(sessionId: string, message: string) {
    return await super.post<ChatMessage>(
      `${this.url}/chat/chatsession/${sessionId}?message=${message}`,
      null
    );
  }

  // Picklists
  public async getPickListAll(): Promise<IHttpResponse<PickList[]>> {
    return await super.get<PickList[]>(`${this.url}/picklist`);
  }

  public async getPickList(id: number): Promise<IHttpResponse<PickList[]>> {
    return await super.get<PickList[]>(`${this.url}/picklist/${id}`);
  }

  public async getPickListOptions(): Promise<IHttpResponse<PickListOption[]>> {
    return await super.get<PickListOption[]>(`${this.url}/picklistoption`);
  }

  public async postPickListOption(
    option: PickListOption
  ): Promise<IHttpResponse<PickListOption>> {
    return await super.post<PickListOption>(
      `${this.url}/picklistoption`,
      option
    );
  }

  public async putPickListOption(
    option: PickListOption
  ): Promise<IHttpResponse<PickListOption>> {
    return await super.put<PickListOption>(
      `${this.url}/picklistoption/${option.id}`,
      option
    );
  }

  public async deletePickListOption(
    id: number
  ): Promise<IHttpResponse<PickListOption>> {
    return await super.delete<PickListOption>(
      `${this.url}/picklistoption/${id}`
    );
  }

  // User Settings
  public async getUserSettings(): Promise<IHttpResponse<UserSetting[]>> {
    return await super.get<UserSetting[]>(`${this.url}/setting`);
  }

  public async putUserSetting(
    userSetting: UserSetting
  ): Promise<IHttpResponse<UserSetting>> {
    return await super.put<UserSetting>(
      `${this.url}/setting/${userSetting.id}`,
      userSetting
    );
  }

  // Attendees
  public async getAttendees() {
    return await super.get<Attendee[]>(`${this.url}/attendee`);
  }

  public async getAttendeeByLayoutId(layoutId: string) {
    return await super.get<Attendee[]>(
      `${this.url}/layout/${layoutId}/attendee`
    );
  }

  public async updateAttendeeByLayoutId(
    layoutId: string,
    updatedAttendees: Attendee[]
  ) {
    return await super.post<Attendee[]>(
      `${this.url}/layout/${layoutId}/attendee`,
      updatedAttendees
    );
  }

  public async postAttendee(attendee: Attendee) {
    return await super.post<Attendee>(`${this.url}/attendee`, attendee);
  }

  public async putAttendee(attendee: Attendee) {
    return await super.put<Attendee>(
      `${this.url}/attendee/${attendee.id}`,
      attendee
    );
  }

  public async deleteAttendee(attendeeId: number) {
    return await super.delete<number>(`${this.url}/attendee/${attendeeId}`);
  }

  public async resetDemoDatabase(): Promise<IHttpResponse<number>> {
    return await super.post(`${this.url}/admin/reset`, null);
  }

  public async getLabels(): Promise<IHttpResponse<LayoutLabel[]>> {
    return await super.get<LayoutLabel[]>(`${this.url}/label`);
  }

  public async postLabel(label: LayoutLabel) {
    return await super.post<LayoutLabel>(`${this.url}/label`, label);
  }

  public async deleteLabel(labelId: string) {
    return await super.delete<string>(`${this.url}/label/${labelId}`);
  }

  //Payments
  public async getPayments() {
    return await super.get<HPayPayment[]>(`${this.url}/payments`);
  }

  public async createPayment(payment: HPayPayment) {
    return await super.post<any>(`${this.url}/payments/`, payment);
  }

  public async createPlacezPayment(payment: HPayPayment) {
    return await super.post<any>(`${this.url}/payments`, payment);
  }

  public async updatePayment(payment: HPayPayment) {
    return await super.put<any>(`${this.url}/payments/${payment.id}`, payment);
  }

  public async getRecentPayments() {
    return await super.get<any>(`${this.url}/payments/last-updated`);
  }

  // Custom line Items
  public async getCustomInvoiceLineItem(id: number) {
    return await super.get<any>(`${this.url}/custom-invoice-line-item/${id}`);
  }

  public async getCustomInvoiceLineItemByScene(sceneId: number) {
    return await super.get<any>(
      `${this.url}/scene/${sceneId}/custom-invoice-line-item/`
    );
  }

  public async createCustomInvoiceLineItem(customInvoiceLineItem: any) {
    return await super.post<any>(
      `${this.url}/custom-invoice-line-item/`,
      customInvoiceLineItem
    );
  }

  public async updateCustomInvoiceLineItem(customInvoiceLineItem: any) {
    return await super.put<any>(
      `${this.url}/custom-invoice-line-item/${customInvoiceLineItem.id}`,
      customInvoiceLineItem
    );
  }

  public async deleteCustomInvoiceLineItem(customInvoiceLineItem: any) {
    return await super.delete<any>(
      `${this.url}/custom-invoice-line-item/${customInvoiceLineItem.id}`
    );
  }

  // Favorite custom line Items
  public async getFavoriteInvoiceLineItems() {
    return await super.get<any>(`${this.url}/favorite-invoice-line-item/`);
  }

  public async createFavoriteInvoiceLineItem(favoriteInvoiceLineItem: any) {
    return await super.post<any>(
      `${this.url}/favorite-invoice-line-item/${favoriteInvoiceLineItem.id}`,
      favoriteInvoiceLineItem
    );
  }

  public async deleteFavoriteInvoiceLineItem(favoriteInvoiceLineItem: any) {
    return await super.delete<any>(
      `${this.url}/favorite-invoice-line-item/${favoriteInvoiceLineItem.id}`
    );
  }

  // Payment Link (Request) Settings
  public async createPaymentLinkSettings(paymentLinkSettings: any) {
    return await super.post<any>(
      `${this.url}/paymentlinksettings/`,
      paymentLinkSettings
    );
  }

  public async getPaymentLinkSettings() {
    return await super.get<any>(`${this.url}/paymentlinksettings/`);
  }

  // Invoice Format Settings

  public async getInvoiceFormatSettings() {
    return await super.get<any>(`${this.url}/invoiceformatsettings/`);
  }

  public async createInvoiceFormatSettings(
    invoiceFormatSettings: InvoiceFormat
  ) {
    return await super.post<any>(
      `${this.url}/invoiceformatsettings/`,
      invoiceFormatSettings
    );
  }
  //Previously DamApi

  // Business Information Settings

  public async getBusinessInformationSettings() {
    return await super.get<any>(
      `${this.url}/setting/group/BusinessInformation`
    );
  }

  public async createBusinessInformationSettings(
    businessInformationSettings: BusinessDetails
  ) {
    return await super.put<any>(
      `${this.url}/setting/business-information`,
      businessInformationSettings
    );
  }

  // FIXME This doesn't actually post a blob but files
  public async postBlob(formData: FormData, id?: string) {
    return await super.postFile<any>(
      `${this.url}/MediaAssetFile${id ? '/' + id : ''}`,
      formData
    );
  }

  public async postMediaAsset(payload: any) {
    return await super.postMediaAsset<any>(`${this.url}/MediaAsset`, payload);
  }

  public async getMediaAssets(ignoreCustomization: boolean = false) {
    const headers = super.getHeader();
    if (ignoreCustomization) {
      headers['placez_ignore_customizations'] = 'true';
    }

    return await super.get<any>(`${this.url}/MediaAsset`, {
      method: 'get',
      headers,
    });
  }

  public async getMediaAssetsByCollection(collectionName: string) {
    return await super.get<any>(`${this.url}/MediaAsset/${collectionName}`);
  }

  public async getMediaAsset(id: number, ignoreCustomization: boolean = false) {
    const headers = super.getHeader();
    if (ignoreCustomization) {
      headers['placez_ignore_customizations'] = 'true';
    }

    return await super.get<any>(`${this.url}/MediaAsset/${id}`, {
      method: 'get',
      headers,
    });
  }

  public async deleteMediaAsset(id: number) {
    return await super.delete<any>(`${this.url}/MediaAsset/${id}`);
  }

  public async getAssetCatalog() {
    return await super.get<any>(`${this.url}/MediaAssetCatalog`);
  }

  public async getAssetCatalogById(id: number) {
    return await super.get<any>(`${this.url}/MediaAssetCatalog/${id}`);
  }

  public async postAssetCatalog(catalog: AssetCatalog) {
    return await super.post<any>(`${this.url}/MediaAssetCatalog`, catalog);
  }

  public async postCustomAsset(customAsset: Asset) {
    return await super.post<Asset>(
      `${this.url}/MediaAsset/Custom`,
      customAsset
    );
  }

  public async deleteCustomAsset(assetId: number) {
    return await super.delete(`${this.url}/MediaAsset/Custom/${assetId}`);
  }

  public async getCustomAssets() {
    return await super.get<any>(`${this.url}/MediaAsset/Custom`);
  }

  public async getMaterials() {
    return await super.get<any>(`${this.url}/Material?includeDeleted=false`);
  }

  public async getMaterial(id: string) {
    return await super.get<any>(`${this.url}/Material/${id}`);
  }

  public async postMaterial(material: PlacezMaterial) {
    return await super.post<PlacezMaterial>(`${this.url}/Material`, material);
  }

  public async deleteMaterial(id: string) {
    return await super.delete<PlacezMaterial>(`${this.url}/Material/${id}`);
  }

  public async postGroup(assetGroup: AssetGroup) {
    return await super.post<Asset>(`${this.url}/MediaAssetGroup/`, assetGroup);
  }

  public async getAssetGroups() {
    return await super.get<Asset>(`${this.url}/MediaAssetGroup/`);
  }

  public async deleteAssetGroup(id: string) {
    return await super.delete<Asset>(`${this.url}/MediaAssetGroup/${id}`);
  }
}
