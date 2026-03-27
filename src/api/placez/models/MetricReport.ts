import Metric from './Metric';

export default interface MetricReport {
  startUtcDate: Date;
  endUtcDate: Date;
  bestTimesBooked: number;
  bestTotalGuests: number;
  bestTotalRevenue: number;
  metricsData: Metric[];
}
