interface Metric {
  label: string;
  actual: number;
  possible: number;
  lost: number;
}

export default interface SceneMetrics {
  id: number;
  startUtcDate: Date;
  endUtcDate: Date;
  revenueData: Metric[];
  revenuePercentChange: number;
  guestCountData: Metric[];
  guestCountPercentChange: number;
}
