interface Metric {
  placeId: number;
  placeName: string;
  actualBookings: number;
  possibleBookings: number;
  averageCapacity: number;
  maxCapacity: number;
  averageSpend: number;
  maxSpend: number;
}

export default interface PlaceMetrics {
  startUtcDate: Date;
  endUtcDate: Date;
  placeData: Metric[];
}
