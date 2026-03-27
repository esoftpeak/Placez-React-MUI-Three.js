import PlacezFixturePlan from '../api/placez/models/PlacezFixturePlan';
import PlacezCorner from '../api/placez/models/PlacezCorner';

//use these default values if needed
export const defaultCorners: { [id: string]: PlacezCorner } = {
  'f90da5e3-9e0e-eba7-173d-eb0b071e838e': {
    x: 0,
    y: 927.2,
    position: [0, 0, 927.2] as [number, number, number],
  },
  'da026c08-d76a-a944-8e7b-096b752da9ed': {
    x: 927.2,
    y: 927.2,
    position: [927.2, 0, 927.2] as [number, number, number],
  },
  '4e3d65cb-54c0-0681-28bf-bddcc7bdb571': {
    x: 927.2,
    y: 0,
    position: [927.2, 0, 0] as [number, number, number],
  },
  '71d4f128-ae80-3d58-9bd2-711c6ce6cdf2': {
    x: 0,
    y: 0,
    position: [0, 0, 0] as [number, number, number],
  },
};

export const defaultWalls = [
  {
    corner1: '71d4f128-ae80-3d58-9bd2-711c6ce6cdf2',
    corner2: 'f90da5e3-9e0e-eba7-173d-eb0b071e838e',
  },
  {
    corner1: 'f90da5e3-9e0e-eba7-173d-eb0b071e838e',
    corner2: 'da026c08-d76a-a944-8e7b-096b752da9ed',
  },
  {
    corner1: 'da026c08-d76a-a944-8e7b-096b752da9ed',
    corner2: '4e3d65cb-54c0-0681-28bf-bddcc7bdb571',
  },
  {
    corner1: '4e3d65cb-54c0-0681-28bf-bddcc7bdb571',
    corner2: '71d4f128-ae80-3d58-9bd2-711c6ce6cdf2',
  },
];

export const defaultFloorplan: PlacezFixturePlan = {
  name: 'default',
  corners: {},
  walls: [],
  floorTextures: {},
  hideWalls: false,
  wallHeight: 304.8,
  fixtures: [],
  floorplanImageScale: 1,
};
