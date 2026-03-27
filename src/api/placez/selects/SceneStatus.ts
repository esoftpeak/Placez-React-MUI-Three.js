enum SceneStatus {
  Proposal = 0,
  Confirmed = 1,
  Canceled = 2,
  Completed = 3,

  // migrate and remove
  Presentation = 4, // -> Proposal
  Negotiating = 5, // -> Proposal
  Committed = 6, // -> Confirmed

  Prospective = 7,
  new = 8,
  Definite = 9,
  Closed = 10,
  "closed forever" = 11,
}

export default SceneStatus;

// Define a type for the status-color mappings
type StatusProperties = {
  [key in SceneStatus]: { color: string; label: string }; // string can be replaced with a more specific type if you have predefined color values
};

// Example of using the mapping
export const sceneStatuses: StatusProperties = {
  [SceneStatus.Proposal]: {
    color: '#FAB436',
    label: 'Tenative',
  },
  [SceneStatus.Confirmed]: {
    label: 'Completed',
    color: '#0AAF60',
  },
  [SceneStatus.Canceled]: {
    color: 'red',
    label: 'Canceled',
  },
  [SceneStatus.Completed]: {
    color: 'black',
    label: 'Completed',
  },

  ////////////////////////////////////////////////////
  [SceneStatus.Presentation]: {
    color: '#FAB436',
    label: 'Canceled',
  },
  [SceneStatus.Negotiating]: {
    color: '#FAB436',
    label: 'Canceled',
  },
  [SceneStatus.Committed]: {
    color: '#0AAF60',
    label: 'Canceled',
  },
  ////////////////////////////////////////////////////
  [SceneStatus.Prospective]: {
    color: '#FAB436',
    label: 'Prospective',
  },
  [SceneStatus.new]: {
    color: '#4a82e8',
    label: 'New',
  },
  [SceneStatus.Definite]: {
    color: '#bd7e4a',
    label: 'Definite',
  },
  [SceneStatus.Closed]: {
    color: '#e43a3a',
    label: 'Closed',
  },
  [SceneStatus["closed forever"]]: {
    color: '#e43a3a',
    label: 'Closed',
  },
};
