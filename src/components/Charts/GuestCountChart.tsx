import { HTMLAttributes, useEffect, useState } from 'react';
import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import ReactApexChart from 'react-apexcharts';
import PercentageData from './models/PercentageData';

interface Props {
  data: PercentageData[];
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'row',
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'space-around',
      },
    },
    legend: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
    },
    key: {
      ...theme.typography.body1,
      color: theme.palette.text.primary,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      opacity: 0.9,
      textTransform: 'uppercase',
    },
    label: {
      margin: 2,
    },
    faded: {
      opacity: 0.7,
    },
  })
);

const colors = ['#009EA8', '#02A1D9', '#7E3FFF', '#E22A6F'];

const ApexCharts = (props: Props & HTMLAttributes<HTMLDivElement>) => {
  const [options, setOptions] = useState({
    states: {
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    colors,
    plotOptions: {
      chart: {},
      labels: props.data !== undefined ? props.data.map((x) => x.label) : [],
      radialBar: {
        offsetY: 5,
        startAngle: 0,
        endAngle: 360,
        hollow: {
          margin: 0,
          size: '30%',
          background: 'transparent',
          image: undefined,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
        track: {
          show: true,
          background: '#7A7A7A',
          strokeWidth: '97%',
          opacity: 0.8,
          margin: 6,
          dropShadow: {
            enabled: false,
            top: 1,
            left: 1,
            blur: 3,
            opacity: 0.5,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.5,
        gradientToColors: ['#FFFFFF'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 80, 100],
      },
    },
  });

  const [series, setSeries] = useState(
    props.data || props.data.length
      ? props.data.map((x) => (x.value / x.total) * 100)
      : []
  );

  useEffect(() => {
    setOptions({
      ...options,
      plotOptions: {
        ...options.plotOptions,
        labels: props.data.map((x: any) => x.label),
      },
    });

    setSeries(
      props.data || props.data.length
        ? props.data.map((x: any) =>
            x.total === 0 ? 0 : (x.value / x.total) * 100
          )
        : []
    );
  }, [props.data]);

  const classes = styles(props);
  const { data } = props;
  if (!data || !data.length) {
    return <div></div>;
  }
  return (
    <div id="chart" className={classes.root}>
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height="240"
      />
      <div className={classes.legend}>
        {data.map((row, index) => (
          <span key={`${row.label}-${index}`} className={classes.key}>
            <div
              style={{
                background: colors[index % 4],
                width: 8,
                height: 8,
                margin: 2,
              }}
            />
            <b className={classes.label}>{row.label} </b>
            <span className={classes.faded}>{row.value} Guests</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default ApexCharts;
