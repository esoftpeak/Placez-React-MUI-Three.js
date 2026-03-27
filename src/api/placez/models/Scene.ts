import SceneDetail from './SceneDetail';

export default interface Scene extends SceneDetail {
  placeName: string;
  thumbnailUrl: string;
  lastModifiedUtcDateTime?: string;
}
