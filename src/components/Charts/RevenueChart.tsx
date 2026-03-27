import { HTMLAttributes, useEffect } from 'react';
import { Theme, createStyles, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import ReactApexChart from 'react-apexcharts';
import PercentChart from './PercentChart';
import ChartData from './models/ChartData';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    metricContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    metric: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    percentage: {
      ...theme.typography.h4,
      fontWeight: 'bold',
      fontSize: 28,
      [theme.breakpoints.down('sm')]: {
        fontSize: 19,
      },
    },
    label: {
      ...theme.typography.body1,
      marginTop: theme.spacing(),
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 3.5,
      fontWeight: 600,
      opacity: 0.5,
    },
    percentChart: {
      margin: `0px ${theme.spacing(2)}px`,
    },
    divider: {
      height: 54,
      borderRight: 'solid 4px #DDDDDD',
    },
  })
);

interface Props {
  incomeRate: number;
  guestCountRate: number;
  data: ChartData[];
  showLabels: boolean;
  setShowLabels: (showLabels: boolean) => void;
}

const ApexCharts = (props: Props & HTMLAttributes<HTMLDivElement>) => {
  const theme: Theme = useTheme();
  let revenueCharts;

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
        colors: [theme.palette.secondary.main],
        chart: {
          toolbar: {
            show: false,
          },
          stacked: true,
        },
        plotOptions: {
          bar: {
            columnWidth: '50%',
            colors: {
              ranges: [
                {
                  from: 1,
                  to: 0,
                  color: theme.palette.secondary.main,
                },
              ],
              backgroundBarColors: [theme.palette.background.paper],
            },
            dataLabels: {
              position: 'top',
              hideOverflowingLabels: true,
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: any, opts: any) => {
            return `$${val}`;
          },
          offsetX: 20,
          textAnchor: 'middle',
        },
        responsive: [
          {
            breakpoint: 1224,
            options: {
              chart: {
                height: 200,
              },
            },
          },
        ],
        xaxis: {
          type: 'category',
          categories: props.data.map((x) => x.label),
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: [theme.palette.text.primary],
            },
          },
        },
        grid: {
          show: false,
        },
        yaxis: {
          labels: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.7,
            gradientToColors: [theme.palette.primary.main],
            inverseColors: true,
            stops: [0, 100],
          },
        },
      },
      series: [
        {
          name: 'Profit',
          data: props.data.map((x) => x.value),
        },
      ],
    };
  };

  const checkRevenewWidth = () => {
    const { showLabels } = props;
    const minToShowLabels = 830;
    const nextShowLabels = minToShowLabels < revenueCharts.offsetWidth;
    const switchShowLabels = showLabels !== nextShowLabels;

    if (switchShowLabels) {
      props.setShowLabels(nextShowLabels);
    }
  };

  const classes = styles(props);

  useEffect(() => {
    revenueCharts = document.querySelector(`.${CSS.escape(classes.root)}`);
    window.addEventListener('resize', checkRevenewWidth);
    checkRevenewWidth();

    return () => {
      window.removeEventListener('resize', checkRevenewWidth);
    };
  }, []);

  const { guestCountRate, incomeRate } = props;
  if (
    props.data === undefined ||
    guestCountRate === undefined ||
    incomeRate === undefined ||
    props.data === null ||
    guestCountRate === null ||
    incomeRate === null
  ) {
    return <div></div>;
  }

  return (
    <div className={classes.root}>
      <ReactApexChart
        options={generateOptions(props).options}
        series={[...generateOptions(props).series]}
        type="bar"
        height="240"
      />
      <div className={classes.metricContainer}>
        <div className={classes.metric}>
          <span className={classes.percentage}>
            {`${incomeRate >= 0 ? '+' : '-'}${Math.abs(incomeRate)}%`}
          </span>
          <span className={classes.label}>Income</span>
        </div>
        <PercentChart value={incomeRate} className={classes.percentChart} />
        <div className={classes.divider} />
        <PercentChart value={guestCountRate} className={classes.percentChart} />
        <div className={classes.metric}>
          <span className={classes.percentage}>
            {`${guestCountRate >= 0 ? '+' : '-'}${Math.abs(guestCountRate)}%`}
          </span>
          <span className={classes.label}>Guest Count</span>
        </div>
      </div>
    </div>
  );
};

export default ApexCharts;
