import { useEffect, useState } from 'react';
import { Theme, useTheme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

import classnames from 'classnames';
import ReactApexChart from 'react-apexcharts';

interface Props {
  value: number;
  className;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      width: 54,
    },
  })
);

const negative = '#E94F37';
interface ChartData {
  options: ApexCharts.ApexOptions;
  series: ApexAxisChartSeries;
}

const ApexCharts = (props: Props) => {
  const theme = useTheme<Theme>();

  const [chartData, setChartData] = useState<ChartData>({
    options: {
      states: {
        hover: {
          filter: {
            type: 'none',
            value: 0,
          },
        },
      },
      chart: {
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        radialBar: {
          offsetY: 30,
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 0,
            size: '73%',
            position: 'front',
          },
          track: {
            background: '#BDBDBD',
            strokeWidth: '80%',
            margin: 0,
          },

          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: [
            props.value > 0 ? theme.palette.primary.main : negative,
          ],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      colors: [props.value > 0 ? theme.palette.primary.main : negative],
    },
    series: [
      {
        name: '',
        data: [Math.abs(props.value)],
      },
    ],
  });

  useEffect(() => {
    setChartData({
      options: {
        ...chartData.options,
        fill: {
          ...chartData.options.fill,
          gradient: {
            ...chartData.options.fill.gradient,
            gradientToColors: [
              props.value > 0 ? theme.palette.primary.main : negative,
            ],
          },
        },
        colors: [props.value > 0 ? theme.palette.primary.main : negative],
      },
      series: [
        {
          name: '',
          data: [Math.abs(props.value)],
        },
      ],
    });
  }, [props.value]);

  const classes = styles(props);

  if (props.value === undefined) {
    return <div></div>;
  }
  return (
    <div id="chart" className={classnames(classes.root, props.className)}>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="radialBar"
        height="120"
        width="100"
      />
    </div>
  );
};

export default ApexCharts;
