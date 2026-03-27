import PlaceDetail from './PlaceDetail';

export default interface Place extends PlaceDetail {
  id: number;
  lastModifiedUtcDateTime?: string;
}
