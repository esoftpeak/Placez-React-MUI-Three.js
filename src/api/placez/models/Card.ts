export default interface PostCard {
  clientId: number;
  token: string;
  ccLastFour: string;
  nameOnCard: string;
  cardType: string;
  dateAdded: string;
  isDefault: boolean;
}

export interface SavedCard {
  id: number;
  createdUtcDateTime: string;
  lastModifiedUtcDateTime: string;
  createdBy: string;
  lastModifiedBy: string;
  deleted: boolean;
  clientId: number;
  token: string;
  ccLastFour: string;
  nameOnCard: string;
  cardType: string;
  dateAdded: string;
  isDefault: boolean;
}

export interface SavedCardsResponse {
  savedCards: SavedCard[];
}
