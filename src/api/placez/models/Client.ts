import ClientDetail from './ClientDetail';

export default interface Client extends ClientDetail {
  lastModifiedUtcDateTime?: string;
}
