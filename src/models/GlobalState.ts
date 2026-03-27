export enum PhotosphereSetup {
  View,
  Home,
  HomeModified,
  MoveFloor,
  MoveFloorModified,
  RotateSphere,
  RotateSphereModified,
  ChangeHeight,
  ChangeHeightModified,
  SaveSetup,
  Cancel,
}

export enum GlobalViewState {
  Layout,
  Fixtures,
  Guest,
}

export enum ViewState {
  Floorplan,
  TwoDView,
  ThreeDView,
  PhotosphereView,
  PhotosphereEdit,
  StreetView,
  AttendeeView,
  LabelView,
  NumberView,
  ShapeView,
  BatchView,
  ItemView,
  TextureView,
}

export enum ToolState {
  AddBatch = 3,
  NewBatch = 4,
  Default = 6,
  Favorites = 7,
}

export enum SaveBarState {
  None = 0,
  Read = 1,
  Edit = 2,
  Save = 3,
  Cancel = 4,
}
