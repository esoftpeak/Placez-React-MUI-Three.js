import StatBox from '../StatBox/StatBox';
import { Metric, MetricReport } from '../../api';

interface Props {
  metrics: MetricReport;
  selectedMetric: Metric;
}
const PlaceCharts = (props: Props) => {
  const { selectedMetric, metrics } = props;
  return (
    <>
      <StatBox
        label="Total Bookings"
        value={selectedMetric.timesBooked || 0}
        total={metrics.bestTimesBooked || 0}
        isCurrency={false}
      />
      <StatBox
        label="Total Guests"
        value={selectedMetric.totlGuests || 0}
        total={metrics.bestTotalGuests || 0}
        isCurrency={false}
      />
      <StatBox
        label="Average Guest"
        value={
          !selectedMetric.timesBooked || !selectedMetric.totlGuests
            ? 0
            : Math.round(
                (selectedMetric.totlGuests / selectedMetric.timesBooked) * 100
              ) / 100
        }
        total={selectedMetric.maxGuests || 0}
        isCurrency={false}
      />
      <StatBox
        label="Total Revenue"
        value={selectedMetric.totalRevenue || 0}
        total={metrics.bestTotalRevenue || 0}
        isCurrency={true}
      />
      <StatBox
        label="Average Revenue"
        value={
          !selectedMetric.timesBooked || !selectedMetric.totalRevenue
            ? 0
            : Math.round(
                (selectedMetric.totalRevenue / selectedMetric.timesBooked) * 100
              ) / 100
        }
        total={selectedMetric.maxRevenue || 0}
        isCurrency={true}
      />
    </>
  );
};

export default PlaceCharts;
