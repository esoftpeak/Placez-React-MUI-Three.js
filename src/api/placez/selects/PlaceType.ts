export enum PlaceType {
  None = 0,
  OnSite = 1,
  OffSite = 2,
  Venue = 3,
  VIP = 4,
}

const placeTypes = [
  { value: PlaceType.None, label: 'None' },
  { value: PlaceType.OnSite, label: 'On-Site' },
  { value: PlaceType.OffSite, label: 'Off-Site' },
  { value: PlaceType.Venue, label: 'Venue' },
  { value: PlaceType.VIP, label: 'VIP' },
];

export default placeTypes;
