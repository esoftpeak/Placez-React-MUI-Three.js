import { GlobalViewState, ViewState } from './GlobalState';

export enum CameraLayers {
  Default = 0,
  TitleLabel = 1,
  NumberLabel = 2,
  Fixtures = 3,
  Walls = 4,
  BasePlanes = 5,
  Floorplanes = 6,
  Items = 7,
  FloorplaneImage = 8,
  Photospheres = 9,
  Mask = 10,
  PhotosphereCameras = 11,
  WallFixtures = 12,
  WallItems = 13,
  LayoutLabels = 14,
  Measurments = 15,
  AttendeeLabel = 16,
  Linen = 17,
  TableNumberLabel = 18,
  Grid = 19,
  ChairNumberLabel = 20,
  ArchitectureElement = 21,
}

export const labelLayers = [
  CameraLayers.TitleLabel,
  CameraLayers.NumberLabel,
  CameraLayers.LayoutLabels,
  CameraLayers.Measurments,
  CameraLayers.TableNumberLabel,
  CameraLayers.ChairNumberLabel,
];

export enum ControllerType {
  None = 0,
  Main = 1,
  Label = 2,
  Number = 3,
  Attendee = 4,
  Batch = 5,
  Floorplan = 6,
  Drawing = 7,
  Texture = 8,
}

export enum ControllerMode {
  MOVE,
  CREATE,
  DELETE,
}

export enum DrawingMode {
  NONE,
  DIMENSION,
}

export const DefaultCameraLayers = [
  CameraLayers.Default,
  CameraLayers.Items,
  CameraLayers.Linen,
  CameraLayers.Fixtures,
  CameraLayers.Floorplanes,
  CameraLayers.BasePlanes,
];

export const CAMERA_LAYERS_LOCAL_STATE_VAR = 'CameraLayersLocalState';

export const InitialCameraLayersLocalState = {
  [GlobalViewState.Layout]: {
    [ViewState.TwoDView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Fixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
      ],
    },
    [ViewState.ThreeDView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.WallItems,
        CameraLayers.Fixtures,
        CameraLayers.WallFixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.Walls,
      ],
    },
    [ViewState.PhotosphereView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Photospheres,
      ],
    },
    [ViewState.AttendeeView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Floorplanes,
        CameraLayers.TableNumberLabel,
        CameraLayers.BasePlanes,
        CameraLayers.AttendeeLabel,
        CameraLayers.Fixtures,
      ],
    },
    [ViewState.LabelView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Fixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.LayoutLabels,
      ],
    },
    [ViewState.NumberView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Fixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.TableNumberLabel,
      ],
    },
    [ViewState.StreetView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.WallItems,
        CameraLayers.Fixtures,
        CameraLayers.WallFixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.Walls,
      ],
    },
    [ViewState.ShapeView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Fixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
      ],
    },
  },
  [GlobalViewState.Fixtures]: {
    [ViewState.Floorplan]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.FloorplaneImage,
        CameraLayers.Grid,
      ],
    },
    [ViewState.TwoDView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.Mask,
      ],
    },
    [ViewState.ThreeDView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.WallItems,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.Walls,
        CameraLayers.Mask,
      ],
    },
    [ViewState.PhotosphereView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.BasePlanes,
        CameraLayers.Mask,
        CameraLayers.Photospheres,
      ],
    },
    [ViewState.LabelView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Fixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.LayoutLabels,
      ],
    },
    [ViewState.ShapeView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.Items,
        CameraLayers.Linen,
        CameraLayers.Fixtures,
        CameraLayers.Floorplanes,
        CameraLayers.BasePlanes,
        CameraLayers.Measurments,
      ],
    },
    [ViewState.TextureView]: {
      cameraLayers: [
        CameraLayers.Default,
        CameraLayers.BasePlanes,
        CameraLayers.Walls,
      ],
    },
  },
};

export const RequiredLayers = {
  [ViewState.TwoDView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Fixtures,
    ],
  },
  [ViewState.ThreeDView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Fixtures,
    ],
  },
  [ViewState.PhotosphereView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Photospheres,
    ],
  },
  [ViewState.AttendeeView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.AttendeeLabel,
      CameraLayers.Fixtures,
    ],
  },
  [ViewState.LabelView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Fixtures,
      CameraLayers.LayoutLabels,
    ],
  },
  [ViewState.NumberView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Fixtures,
      CameraLayers.TableNumberLabel,
    ],
  },
  [ViewState.StreetView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Fixtures,
    ],
  },
  [ViewState.ShapeView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.Items,
      CameraLayers.Linen,
      CameraLayers.Fixtures,
      CameraLayers.Measurments,
    ],
  },
  [ViewState.Floorplan]: {
    cameraLayers: [CameraLayers.Default, CameraLayers.Floorplanes],
  },
  [ViewState.PhotosphereEdit]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.BasePlanes,
      CameraLayers.Photospheres,
      CameraLayers.Floorplanes,
    ],
  },
  [ViewState.TextureView]: {
    cameraLayers: [
      CameraLayers.Default,
      CameraLayers.BasePlanes,
      CameraLayers.Walls,
      CameraLayers.Floorplanes,
    ],
  },
};

export const ProhibitedLayers = {
  [ViewState.Floorplan]: {
    cameraLayers: [
      CameraLayers.Photospheres,
      CameraLayers.Mask,
      CameraLayers.Items,
      CameraLayers.Walls,
      CameraLayers.WallItems,
      CameraLayers.WallFixtures,
    ],
  },
  [ViewState.TwoDView]: {
    cameraLayers: [CameraLayers.Photospheres, CameraLayers.Walls],
  },
  [ViewState.ThreeDView]: {
    cameraLayers: [CameraLayers.Photospheres],
  },
  [ViewState.PhotosphereView]: {
    cameraLayers: [
      CameraLayers.Floorplanes,
      CameraLayers.BasePlanes,
      CameraLayers.Grid,
      CameraLayers.FloorplaneImage,
      CameraLayers.Walls,
      CameraLayers.WallItems,
      CameraLayers.WallFixtures,
    ],
  },
  [ViewState.PhotosphereEdit]: {
    cameraLayers: [
      CameraLayers.Walls,
      CameraLayers.WallFixtures,
      CameraLayers.WallItems,
      CameraLayers.Floorplanes,
    ],
  },
  [ViewState.AttendeeView]: {
    cameraLayers: [CameraLayers.Photospheres, CameraLayers.Walls],
  },
  [ViewState.LabelView]: {
    cameraLayers: [CameraLayers.Photospheres, CameraLayers.Walls],
  },
  [ViewState.NumberView]: {
    cameraLayers: [CameraLayers.Photospheres, CameraLayers.Walls],
  },
  [ViewState.StreetView]: {
    cameraLayers: [CameraLayers.Photospheres],
  },
  [ViewState.ShapeView]: {
    cameraLayers: [CameraLayers.Photospheres, CameraLayers.Walls],
  },
  [ViewState.TextureView]: {
    cameraLayers: [CameraLayers.Grid],
  },
};
