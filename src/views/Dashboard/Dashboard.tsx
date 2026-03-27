import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { KeyboardArrowDown } from '@mui/icons-material';

import {
  GuestCountChart,
  RevenueChart,
  BookingChart,
} from '../../components/Charts';

import { MenuItem, Select, CircularProgress, Tooltip } from '@mui/material';

import {
  RefreshMetrics,
  UpdateDashboardDateOption,
  SetCurrentLocation,
} from '../../reducers/dashboard';
import { getTimeDateRange, TimeRangeOption } from '../../sharing/utils/DateHelper';
import { dashboardTimeRangeOptions } from './DashboardFilter';
import { Metric, MetricReport } from '../../api';
import { ReduxState } from '../../reducers';
import { getOrgTheme } from '../../api/placez/models/UserSetting';
import { createSelector } from 'reselect';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      padding: theme.spacing(3),
      height: '100%',
      overflowY: 'auto',
    },
    temp: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    header: {
      width: '100%',
      minHeight: 54,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    heading: {
      ...theme.typography.h1,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    subHeading: {
      color: theme.palette.primary.main,
      marginBottom: theme.spacing(),
      fontWeight: 'bold',
    },
    chartTitle: {
      ...theme.typography.h2,
      textTransform: 'uppercase',
      fontSize: 12,
      letterSpacing: 0.9,
      fontWeight: 500,
      margin: 0,
    },
    halfSize: {
      width: '50%',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    fullSize: {
      flex: '1 0 100%',
      width: '100%',
    },
    progress: {
      height: 16,
      width: 16,
      margin: 2,
      marginRight: 8,
    },
    location: {
      margin: '0 10px',
    },
    datePicker: {
      margin: '20px',
      '& .Mui-focused': {
        color: 'red',
      },
    },
  })
);

const appName = ''
  // ENV.ENV_APP_NAME.substring(0, 1).toUpperCase() +
  // ENV.ENV_APP_NAME.substring(1);

interface Props {}

const Dashboard = (props: Props) => {
  const dispatch = useDispatch();
  const classes = styles(props);

  const [showLabels, setShowLabels] = useState(true);

  const isLoading = useSelector(
    (state: ReduxState) => state.dashboard.isLoading
  );
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );
  const revenue = useSelector((state: ReduxState) =>
    getRevenue(state.scenes.metrics)
  );
  const bookings = useSelector((state: ReduxState) =>
    getBookings(state.place.metrics)
  );
  const guestCount = useSelector((state: ReduxState) =>
    getGuestCountData(state.scenes.metrics)
  );
  const dateOption = useSelector(
    (state: ReduxState) => state.dashboard.dateOption
  );
  const locations = useSelector(
    (state: ReduxState) => state.dashboard.locations
  );
  const currentLocationKey = useSelector(
    (state: ReduxState) => state.dashboard.currentLocationKey
  );

  useEffect(() => {
    const range = getTimeDateRange(dateOption ? dateOption : TimeRangeOption.ThisWeek);
    dispatch(RefreshMetrics(range));
  }, []);

  const handleDateOptionChange = () => (event) => {
    dispatch(UpdateDashboardDateOption(event.target.value));
  };

  const handleSetCurrentLoaction = (event) => {
    dispatch(SetCurrentLocation(event.target.value));
  };

  const renderLoading = () => {
    return (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </div>
    );
  };

  const renderLocation = () => {
    const locationsEnabled = !!currentLocationKey;
    const locationKeys = locationsEnabled ? Object.keys(locations) : [];

    return (
      <div className={classes.subHeading}>
        {userProfile.organization_name === undefined
          ? ''
          : `${getOrgTheme(userProfile.organization_id).name}`}
        {locationsEnabled && (
          <Select
            className={classes.location}
            value={currentLocationKey}
            onChange={handleSetCurrentLoaction}
            disableUnderline
            IconComponent={KeyboardArrowDown}
            inputProps={{
              name: 'locationKey',
              id: 'location-key-select',
            }}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            }}
          >
            {locationKeys.map((locationKey, index) => (
              <MenuItem key={`${locationKey}-${index}`} value={locationKey}>
                {locations[locationKey]}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.temp}>
        <div className={classes.header}>
          <div>
            <h1 className={classes.heading}>
              {userProfile.name === undefined
                ? 'Hello'
                : `Hello ${userProfile.name}!`}
            </h1>
            {renderLocation()}
          </div>

          <div>
            {isLoading ? (
              <CircularProgress className={classes.progress} />
            ) : null}
            <Tooltip title="Time Filter" placement="left">
              <Select
                className={classes.datePicker}
                value={dateOption}
                onChange={handleDateOptionChange()}
                disableUnderline
                IconComponent={KeyboardArrowDown}
                inputProps={{
                  name: 'dateOption',
                  id: 'date-option-select',
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                }}
              >
                {dashboardTimeRangeOptions.map((option, index) => (
                  <MenuItem
                    key={`${option.label}-${index}`}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Tooltip>
          </div>
        </div>
        <div className={classes.halfSize}>
          <h2 className={classes.chartTitle}>{`Top 5 ${appName} Booked`}</h2>
          <BookingChart data={bookings.data} />
        </div>
        <div className={classes.halfSize}>
          <h2 className={classes.chartTitle}>
            {'Top 5 Scene Types By Guest Count'}
          </h2>
          <GuestCountChart data={guestCount.data} />
        </div>
        <div className={classes.fullSize}>
          <h2 className={classes.chartTitle}>Revenue</h2>
          <RevenueChart
            data={revenue.data}
            incomeRate={revenue.rate}
            guestCountRate={guestCount.rate}
            showLabels={showLabels}
            setShowLabels={(showLabels: boolean) => setShowLabels(showLabels)}
          />
        </div>
      </div>
    </div>
  );
};

const getMetricsState = (metrics) => metrics;

const getRevenue = createSelector([getMetricsState], (metrics: any) => {
  if (
    metrics === undefined ||
    metrics === null ||
    metrics.revenueData === undefined ||
    metrics.revenuePercentChange === undefined
  ) {
    return {
      rate: 0,
      data: [],
    };
  }

  return {
    rate: metrics.revenuePercentChange,
    data: metrics.revenueData.slice(0, 7).map((obj) => {
      return {
        label: obj.label,
        value: Math.round(obj.actual),
        lost: obj.lost,
      };
    }),
    // data: metrics.revenueData.reduce(
    //   (acc, obj) => {
    //     const found = acc.findIndex(entry => {
    //       return entry.label === obj.label;
    //     });
    //     if (found === -1) {
    //       acc.push({
    //         label: obj.label,
    //         value: obj.actual,
    //         lost: obj.lost,
    //       });
    //       return acc;
    //     }
    //     acc[found].value += obj.actual;
    //     acc[found].lost += obj.lost;
    //     return acc;
    //   },
    //   []
    // ),
  };
});

const getGuestCountData = createSelector([getMetricsState], (metrics: any) => {
  if (
    metrics === undefined ||
    metrics === null ||
    metrics.guestCountPercentChange === undefined ||
    metrics.guestCountData === undefined
  ) {
    return {
      rate: 0,
      data: [],
    };
  }

  return {
    rate: metrics.guestCountPercentChange,
    data: metrics.guestCountData.map((metric: any) => ({
      label: metric.label,
      value: metric.actual,
      total: metric.possible,
    })),
  };
});

const getBookings = createSelector(
  [getMetricsState],
  (metrics: MetricReport) => {
    if (
      metrics === undefined ||
      metrics === null ||
      metrics.metricsData === undefined
    ) {
      return {
        data: [],
      };
    }

    return {
      data: metrics.metricsData.map((metric: Metric) => ({
        label: metric.metricName,
        value: metric.timesBooked,
      })),
    };
  }
);

export default Dashboard;
