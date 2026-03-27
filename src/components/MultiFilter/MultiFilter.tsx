import React, { forwardRef, Ref, useEffect, useState } from 'react';

import { Theme, Tooltip } from '@mui/material';

import { createStyles } from '@mui/styles';

// Components
import { ClickAwayListener, Paper, Grow, Popper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Filter } from './Filters';
import MultiFilterMenu from './MultiFilterMenu';

// Icons
import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { SetSceneFilters } from '../../reducers/settings';
import PlacezIconButton from '../PlacezUIComponents/PlacezIconButton';
import PlacezDatePicker from '../PlacezUIComponents/PlacezDatePicker';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';

interface Props {
  filters: Filter<any>[];
  disabled?: boolean;
  className?: string;
  closeOnSelect?: boolean;
  initialDateFilter?: number;
  isFromScene?: boolean;
  isFromDashboard?: boolean;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    popup: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: theme.spacing(),
      paddingTop: theme.spacing(2),
    },
    menuContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    menu: {
      margin: `0px ${theme.spacing(4)}px`,
    },
    menuHeading: {
      ...theme.typography.body2,
      fontSize: 11,
      color: theme.palette.grey[400],
      textTransform: 'uppercase',
      paddingBottom: theme.spacing(),
      borderBottom: `solid 1px ${theme.palette.grey[400]}`,
    },
    menuItem: {
      padding: `0px ${theme.spacing(6)}px 0px ${theme.spacing()}px`,
      fontSize: 14,
      fontWeight: 'bold',
    },
    button: {
      textEmphasis: 'bold',
      textTransform: 'capitalize',
    },
    expandIcon: {
      color: theme.palette.grey[500],
    },
    apply: {
      margin: '0px 8px 8px 0px',
    },
    cancleButton: {
      color: 'white',
    },
  })
);

const MultiFilter = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const classes = styles(props);

  const [open, setOpen] = useState(false);
  const stateFilterMap = useSelector(
    (state: ReduxState) => state.settings.sceneFilters
  );

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [customMonthUtcDateTime, setCustomMonthUtcDateTime] = useState<Date>(
    stateFilterMap?.customMonth
      ? new Date(stateFilterMap?.customMonth)
      : new Date(new Date().getFullYear(), new Date().getMonth())
  );
  const [customYearUtcDateTime, setCustomYearUtcDateTime] = useState<Date>(
    stateFilterMap?.customYear
      ? new Date(stateFilterMap?.customYear)
      : new Date()
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.initialDateFilter !== undefined) {
      dispatch(
        SetSceneFilters({
          Date: props.initialDateFilter,
        })
      );
    } else {
      // dispatch(SetSceneFilters({}))
    }
  }, []);

  useEffect(() => {
    if (stateFilterMap?.customMonth) {
      setCustomMonthUtcDateTime(new Date(stateFilterMap?.customMonth));
    }
    if (stateFilterMap?.customYear) {
      setCustomYearUtcDateTime(new Date(stateFilterMap?.customYear));
    }
  }, [stateFilterMap]);

  const resetFilters = () => {
    dispatch(SetSceneFilters({}));
  };

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
    if (open) {
      resetFilters();
    }
  };

  const handleClose = (event: any) => {
    if (anchorEl && anchorEl.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const removeLocalFilters = () => {
    localStorage.removeItem('sceneFilters');
    localStorage.removeItem('dashboardFilters');
  };

  const clearFilters = () => {
    removeLocalFilters();
    dispatch(SetSceneFilters({}));
    setOpen(false);
  };

  const setFilterToLocalStorage = (filterValue) => {
    if (!filterValue) return;
    localStorage.setItem('sceneFilters', JSON.stringify(filterValue));
  };

  const onChange = (filterName: string) => (value: any) => {
    const currentValue = stateFilterMap[filterName];
    const filterValue = {
      ...stateFilterMap,
      [filterName]: value === currentValue ? undefined : value,
    };

    if (value === 5) {
      filterValue.customMonth = Date.now();
      filterValue.customYear = undefined;
    }
    if (value === 6) {
      filterValue.customMonth = undefined;
      filterValue.customYear = Date.now();
    }

    if (props.isFromScene) setFilterToLocalStorage(filterValue);

    if (props.isFromDashboard)
      localStorage.setItem('dashboardFilters', JSON.stringify(filterValue));

    dispatch(SetSceneFilters(filterValue));
    if (props.closeOnSelect && ![5, 6].includes(filterValue.Date)) {
      setOpen(false);
    }
  };

  const handleApply = (event: any) => {
    if (anchorEl && anchorEl.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleSetCustomMonth = (customMonthUtcDateTime: Date) => {
    const filterValue = {
      ...stateFilterMap,
      customMonth: customMonthUtcDateTime.getTime(),
      customYear: undefined,
    };
    setFilterToLocalStorage(filterValue);
    dispatch(SetSceneFilters(filterValue));
    setCustomMonthUtcDateTime(customMonthUtcDateTime);

    if (props.closeOnSelect) {
      setOpen(false);
    }
  };

  const handleSetCustomYear = (customYearUtcDateTime: Date) => {
    const filterValue = {
      ...stateFilterMap,
      customMonth: undefined,
      customYear: customYearUtcDateTime.getTime(),
    };
    setFilterToLocalStorage(filterValue);
    dispatch(SetSceneFilters(filterValue));
    setCustomYearUtcDateTime(customYearUtcDateTime);

    if (props.closeOnSelect) {
      setOpen(false);
    }
  };

  const getFilterText = (): string => {
    const { filters } = props;
    const filterNames = [];
    if (filters && stateFilterMap) {
      const keys = Object.keys(stateFilterMap);
      filters.forEach((filter: Filter<any>) => {
        if (keys.includes(filter.name)) {
          const selectedId = stateFilterMap[filter.name];
          if (
            selectedId !== undefined &&
            filter.items[selectedId] !== undefined
          ) {
            filterNames.push(filter.items[selectedId].name);
          }
        }
      });
    }
    return filterNames.length > 0 ? filterNames.join(', ') : 'Filter By';
  };

  const { filters } = props;

  return (
    <div ref={ref}>
      {/* <Button
          disabled={props.disabled}
          className={classnames(props.className, classes.button)}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          {getFilterText()}
          <ExpandIcon className={classes.expandIcon}/>
        </Button> */}
      <Tooltip title="Filter">
        <PlacezIconButton onClick={handleToggle}>
          {Object.values(stateFilterMap).some(
            (value) => value !== undefined
          ) ? (
            <FilterAltOff color="primary" />
          ) : (
            <FilterAlt />
          )}
        </PlacezIconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorEl}
        transition
        style={{ zIndex: 980 }}
        placement="top-end"
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <div className={classes.popup}>
                  <div className={classes.menuContainer}>
                    {filters.map((filter: Filter<any>) => (
                      <MultiFilterMenu
                        key={`filter-${filter.name}`}
                        selectedId={stateFilterMap[filter.name]}
                        filter={filter}
                        onChange={onChange(filter.name)}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ width: '160px', marginRight: '10px' }}>
                      {stateFilterMap.Date === 5 && (
                        <PlacezDatePicker
                          className={classes.dateSelector}
                          views={['month']}
                          openTo="month"
                          value={customMonthUtcDateTime}
                          onChange={handleSetCustomMonth}
                          format="MMMM yyyy"
                        />
                      )}
                      {stateFilterMap.Date === 6 && (
                        <PlacezDatePicker
                          className={classes.dateSelector}
                          views={['year']}
                          openTo="year"
                          value={customYearUtcDateTime}
                          onChange={handleSetCustomYear}
                          format="yyyy"
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex' }}>
                      <PlacezActionButton
                        style={{ marginRight: '8px' }}
                        onClick={() => {
                          clearFilters();
                        }}
                      >
                        Clear
                      </PlacezActionButton>
                      {!props.closeOnSelect && (
                        <PlacezActionButton onClick={handleApply}>
                          Close
                        </PlacezActionButton>
                      )}
                    </div>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
});

export default MultiFilter;
