import { useRef } from 'react';
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartTitle,
  ChartArea,
} from '@progress/kendo-react-charts';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    graphContainer: {
      minHeight: '2px',
      flex: 1,
      alignSelf: 'stretch',
    },
    totalContainer: {
      alignItems: 'center',
      display: 'flex',
      fontSize: '18px',
      justifyContent: 'space-between',
    },
    totalDescription: {
      color: theme.palette.grey[200],
      fontSize: '12px',
    },
  })
);

const LineGraphWidget = (props) => {
  const classes = styles();

  const chartContainerRef = useRef();
  const chartRef = useRef();

  const {
    data,
    compare,
    title,
    compareColor,
    height = '100%',
    width = '100%',
  } = props;

  const theme = useTheme();
  const graphcolor = theme.palette.primary.main;

  return (
    <div ref={chartContainerRef} className={classes.graphContainer}>
      <Chart ref={chartRef} style={{ height, width }}>
        {title ? <ChartTitle text={title} /> : null}
        <ChartArea background={theme.palette.background.paper} />{' '}
        {/* Set the background color here */}
        <ChartCategoryAxis>
          <ChartCategoryAxisItem
            line={{ visible: false }}
            majorGridLines={{ visible: false }}
            visible={false}
          />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem
            line={{ visible: false }}
            majorGridLines={{ visible: false }}
            visible={false}
          />
        </ChartValueAxis>
        <ChartSeries>
          <ChartSeriesItem
            type="area"
            data={data}
            line={{ style: 'normal' }}
            markers={{ visible: false }}
            color={graphcolor}
            opacity={0.1}
          />
          <ChartSeriesItem
            type="line"
            data={data}
            line={{ style: 'normal' }}
            markers={{ visible: false }}
            color={graphcolor}
            opacity={1}
          />
          {compare && (
            <ChartSeriesItem
              type="line"
              data={compare}
              line={{ style: 'normal' }}
              markers={{ visible: false }}
              color={compareColor}
              opacity={0.3}
            />
          )}
        </ChartSeries>
      </Chart>
    </div>
  );
};

export default LineGraphWidget;
