/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  Theme,
  Tooltip,
  Typography,
  createStyles,
  useTheme,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../components/Hooks/useLocalStorageState';
import GraphWidget from './GraphWidget';
import { createSelector } from 'reselect';
import { Payment, Scene } from '../../api';
import SceneTable from '../../components/Tables/SceneTable';
import { makeStyles } from '@mui/styles';
import MultiFilter from '../../components/MultiFilter/MultiFilter';
import {
  DateFilter,
  Filter,
  shouldFilter,
} from '../../components/MultiFilter/Filters';
import SceneStatus from '../../api/placez/selects/SceneStatus';
import { format, isAfter, isBefore, subYears } from 'date-fns';
import PaymentsTable from '../../components/Tables/PaymentTable';
import { formatTime } from '../../Constants/timeFormat';
import { CalendarDrawerEventsList } from '../Calendar/CalendarDrawerEventsList';
import { MiniCalendar } from '../Calendar/MiniCalendar';
import { GetSceneMetrics, getScenes } from '../../reducers/scenes';
import { getDateRange } from '../../components/MultiFilter/Filters/Filter';
import { SetSceneFilters } from '../../reducers/settings';

const DashboardGrid = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: repeat(4, 1fr) 400px;
  grid-template-rows: 200px minmax(0, 1fr);
  grid-gap: 20px;
  padding: 20px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
  @media (max-width: 768px) {
    background-color: red;
    display: flex;
    flex-direction: column;
  }
`;

const ListDiv = styled.div`
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const DayView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const Welcome = styled.div`
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  /* Additional styling for items */
`;

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    sceneCountColumn: {
      display: 'flex',
      flexDirection: 'column',
      borderRight:
        '2px solid rgba(0, 0, 0, 0.05)' /* Grey with 50% transparency */,
      padding: '0px 30px',
      margin: '10px 0px',
      /* Just for demonstration */
      '&:first-of-type': {
        paddingLeft: '0px',
      },
      '&:last-child': {
        borderRight: 'none',
      },
    },
    sceneCount: {
      fontSize: '20px',
      fontWeight: 500,
    },
    welcomeContent: {
      fontWeight: 600,
      fontSize: '27px',
      justifyContent: 'space-between',
      display: 'flex',
    },
    timeWrapper: {
      color: theme.palette.primary.main,
      fontSize: '27px',
    },
    calendarWrapper: {
      display: 'flex',
      flexDirection: 'column',
      ...theme.PlacezBorderStyles,
      paddingTop: '32px',
      border: '2px solid #8b49a1ff'
    },
  })
);

const NewDashboard: React.FC = () => {
  // Example data, replace with real data

  const eventMetrics = useSelector((state: ReduxState) =>
    getEventMetrics(state.scenes.metrics)
  );
  const clients = useSelector((state: ReduxState) => state.client.clients);
  // add client metrics
  const clientMetrics = useSelector(
    (state: ReduxState) => state.scenes.metrics
  );
  const scneMetrics = useSelector((state: ReduxState) => state.scenes.metrics);

  //fix
  const eventStatus = useSelector((state: ReduxState) =>
    getEventMetrics(state.scenes.metrics)
  );
  //
  const revenue = useSelector((state: ReduxState) =>
    getRevenue(state.scenes.metrics)
  );
  const averageRevenue = useSelector((state: ReduxState) =>
    getAverageRevenue(state.scenes.metrics)
  );

  const items = []; // Replace with real item data
  const dispatch = useDispatch();
  const user = useSelector((state: ReduxState) => state.oidc.user);
  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );
  const [date, setDate] = React.useState(new Date());

  // Add metrics data

  const scenes = useSelector(getScenes);
  const [filters, setFilters] = useState<Filter<Scene>[]>([]);
  const filterMap = useSelector(
    (state: ReduxState) => state.settings.sceneFilters
  );

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const resetFilters = () => {
    setFilters([new DateFilter()]);
  };

  useEffect(() => {
    resetFilters();
    const localFilter = localStorage.getItem('dashboardFilters');
    if (localFilter) {
      const filterData = JSON.parse(localFilter);
      dispatch(SetSceneFilters(filterData));
    } else {
      dispatch(SetSceneFilters({}));
    }
  }, []);

  useEffect(() => {
    const isContent = !!Object.keys(filterMap).length;
    const range = getDateRange(filterMap, filters);
    dispatch(
      GetSceneMetrics(
        isContent
          ? range
          : { startDate: subYears(new Date(), 5), endDate: new Date() }
      )
    );
  }, [filters, filterMap]);

  const classes = styles();

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      setDate(new Date());
    }, 60000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [date]);

  const dayOfTheMonth = format(date, 'P');
  const time = format(date, formatTime(twentyFourHourTime));
  const theme = useTheme();

  const [filteredScenes, setFilteredScenes] = useState(scenes);
  const payments = useSelector((state: ReduxState) => state.payment.payments);

  useEffect(() => {
    setFilteredScenes(
      scenes
        // .filter(scene => isAfter(new Date(scene.startUtcDateTime),  subMonths(new Date(), 1)))
        .filter((scene) =>
          isAfter(new Date(scene.startUtcDateTime), subYears(new Date(), 1))
        )
        .filter((scene) => shouldFilter<Scene>(filterMap, filters, scene))
        .sort((a, b) =>
          isBefore(a.startUtcDateTime, b.startUtcDateTime) ? 1 : -1
        )
    );
  }, [filters, filterMap, scenes]);

  const filteredPayments = useMemo(() => {
    return payments
      .map((payment) => ({
        ...payment,
        startUtcDateTime: new Date(payment.dateApplied),
      }))
      .filter((payment) =>
        isAfter(new Date(payment.startUtcDateTime), subYears(new Date(), 1))
      )
      .filter((payment) => shouldFilter<Payment>(filterMap, filters, payment))
      .sort((a, b) =>
        isBefore(a.startUtcDateTime, b.startUtcDateTime) ? 1 : -1
      );
  }, [payments, filters, filterMap]);

  const [calendarDate, setCalendarDate] = useState(new Date());

  return (
    <DashboardGrid>
      <Welcome>
        <div className={classes.welcomeContent}>
          {`Good Morning ${user.profile.name.split(' ')[0]}!`}

          <Tooltip title="Time Filter">
            <MultiFilter
              closeOnSelect
              className={classes.dateSelect}
              filters={filters}
              initialDateFilter={2}
              isFromDashboard
            />
          </Tooltip>
        </div>
        <div className={classes.timeWrapper}>
          <span>{`${dayOfTheMonth} | ${time}`}</span>
        </div>
        <div
          style={{
            display: 'flex',
          }}
        >
          <div className={classes.sceneCountColumn}>
            <div className={classes.sceneCount}>
              {eventStatus[SceneStatus.Proposal] ?? 0}
            </div>
            <Typography variant="caption">NEW</Typography>
          </div>
          <div className={classes.sceneCountColumn}>
            <div className={classes.sceneCount}>
              {eventStatus[SceneStatus.Confirmed] ?? 0}
            </div>
            <Typography variant="caption">IN PROGRESS</Typography>
          </div>
          <div className={classes.sceneCountColumn}>
            <div className={classes.sceneCount}>
              {eventStatus[SceneStatus.Completed] ?? 0}
            </div>
            <Typography variant="caption">COMPLETE</Typography>
          </div>
        </div>
      </Welcome>
      <GraphWidget label="Events" metrics={eventMetrics} />
      <GraphWidget label="Revenue" metrics={revenue} />
      <GraphWidget label="Average Revenue" metrics={averageRevenue} />
      <ListDiv>
        <SceneTable isFromDashboard scenes={filteredScenes} height={'calc(100vh - 322px)'} />
      </ListDiv>
      <ListDiv>
        <PaymentsTable
          filteredPayments={filteredPayments}
          isFromDashboard
          height={'calc(100vh - 325px)'}
        />
      </ListDiv>
      <div className={classes.calendarWrapper}>
        <MiniCalendar
          events={scenes}
          selectedDate={calendarDate}
          setSelectedDate={setCalendarDate}
        />
        <CalendarDrawerEventsList selectedDate={calendarDate} scenes={scenes} />
      </div>
      {/* <CustomerList
        scenes={filteredScenes}
        /> */}
    </DashboardGrid>
  );
};

export default NewDashboard;

const getMetricsState = (metrics) => metrics;

const getRevenue = createSelector([getMetricsState], (metrics: any) => {
  if (metrics === undefined || metrics === null) {
    return {
      rate: 0,
      data: [],
    };
  }

  return {
    rate: metrics?.revenueMetrics?.rate,
    total: metrics?.revenueMetrics?.total,
    data: metrics?.revenueMetrics?.dailyTallies || [],
  };
});

const getAverageRevenue = createSelector([getMetricsState], (metrics: any) => {
  if (metrics === undefined || metrics === null) {
    return {
      rate: 0,
      data: [],
    };
  }

  return {
    rate: metrics?.averageRevenueMetric?.rate,
    total: metrics?.averageRevenueMetric?.total,
    data: metrics?.averageRevenueMetric?.dailyTallies || [],
  };
});

const getEventMetrics = createSelector([getMetricsState], (metrics: any) => {
  if (metrics === undefined || metrics === null) {
    return {
      rate: 0,
      data: [],
    };
  }
  return {
    rate: metrics?.sceneMetrics?.rate,
    total: metrics?.sceneMetrics?.total,
    data: metrics?.sceneMetrics?.dailyTallies || [],
  };
});

const getEventStatus = createSelector([getMetricsState], (metrics: any) => {
  return metrics.eventStatus;
});

// const getClientMetrics = createSelector([getMetricsState], (metrics: any) => {
//   if (
//     metrics === undefined ||
//     metrics === null ||
//     metrics.eventCount === undefined ||
//     metrics.eventCountPercentChange === undefined
//   ) {
//     return {
//       rate: 0,
//       data: [],
//     };
//   }

//   return {
//     rate: metrics.eventCountPercentageChange,
//     data: metrics.revenueData.slice(0, 7).map((metric) => {
//       return {
//         id: metric.id,
//       };
//     }),
//   };
// });
