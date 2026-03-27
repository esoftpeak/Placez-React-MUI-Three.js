import ReactApexChart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import ChartData from './models/ChartData';
import { Theme, useTheme } from '@mui/material';

interface Props {
  data: ChartData[];
}

// TODO Determine alternate solution for chart constant storage
const colors = [
  '#0AD1CB', // Green
  '#DA83FF', // Purple
  '#4CB4F1', // Blue
  '#F776A3', // Red
  '#9549A8', // Purple
  '#9C72DF', // Purple
  '#DF46B5', // Magenta
];

const borderColor = '#CCCCCC';
const fontSize = '14px';

const BookingChart = (props: Props) => {
  const theme = useTheme<Theme>();

  const generateOptions = (
    props
  ): { options: ApexCharts.ApexOptions; series: ApexAxisChartSeries } => {
    return {
      options: {
        tooltip: {
          enabled: false,
        },
        states: {
          hover: {
            filter: {
              type: 'none',
              value: 0,
            },
          },
        },
        grid: {
          borderColor,
        },
        chart: {
          toolbar: {
            show: false,
          },
        },
        colors,
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        yaxis: {
          tickAmount:
            Math.max.apply(
              null,
              props.data.map((x: any) => x.value)
            ) + 1,
          labels: {
            style: {
              fontSize,
              colors: theme.palette.text.primary,
            },
          },
          axisBorder: {
            show: true,
            color: theme.palette.text.primary,
          },
        },
        xaxis: {
          axisTicks: {
            show: false,
          },
          axisBorder: {
            show: true,
            color: theme.palette.text.primary,
          },
          categories:
            props.data !== undefined ? props.data.map((x) => x.label) : [],
          labels: {
            style: {
              fontSize,
              colors: theme.palette.text.primary,
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.7,
            gradientToColors: undefined,
            inverseColors: false,
            stops: [0, 90, 100],
          },
        },
      },
      series: [
        {
          name: props.data !== undefined ? props.data.map((x) => x.name) : [],
          data: props.data !== undefined ? props.data.map((x) => x.value) : [],
        },
      ],
    };
  };

  const { data } = props;

  if (data === undefined || data === null) {
    return <div></div>;
  }

  return (
    <div>
      <ReactApexChart
        options={generateOptions(props).options}
        series={generateOptions(props).series}
        type="bar"
        height="240"
      />
    </div>
  );
};

export default BookingChart;
