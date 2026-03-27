import LineGraphWidget from './LineGraphWidget';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import PlacezPaper from '../../components/PlacezUIComponents/PlacezPaper';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0px',
    },
    heading: {
      color: theme.palette.grey['500'],
      fontSize: 12,
      height: 18,
      fontWeight: 'normal',
      textAlign: 'center',
      textTransform: 'uppercase',
      width: '100%',
    },
    number: {
      height: 50,
      width: '100%',
      fontSize: 36,
      textAlign: 'center',
    },
    percent: {
      width: '100%',
      textAlign: 'center',
      color: 'green',
      height: 22,
    },
  })
);

interface GraphWidgetProps {
  label: string;
  dashboardEventsSettings?: any;
  metrics?: { data?: any[]; rate?: number; total?: number };
}

const GraphWidget = (props: GraphWidgetProps) => {
  const classes = styles();
  const { dashboardEventsSettings, metrics } = props;
  // const tallies = props.metrics?.data.map((item) => item.count) ?? [12, 19, 7, 15, 14, 21, 5];
  const tallies = props.metrics?.data.map((item) => item.count) ?? [
    0, 0, 0, 0, 0, 0, 0,
  ];
  // const tallies = props.metrics?.data.map((item) => item.count) ?? [];
  const rate = props.metrics?.rate ?? 0;

  return (
    <PlacezPaper className={classes.card}>
      {props.metrics && (
        <>
          <div className={classes.heading}>{props.label}</div>
          <div className={classes.number}>{props.metrics.total ?? 0}</div>
          <div
            className={classes.percent}
            style={{ color: rate > 1 ? 'green' : 'red' }}
          >
            {/*{rate > 1 ? '+' : '-'}{(rate * 100).toFixed(2)}%*/}
            {rate}%
          </div>
          <LineGraphWidget
            // TODO: cleanup
            data={tallies}
            settings={dashboardEventsSettings}
          />
        </>
      )}
    </PlacezPaper>
  );
};

export default GraphWidget;
