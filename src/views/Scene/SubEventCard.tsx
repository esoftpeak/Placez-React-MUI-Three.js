import { createStyles, makeStyles } from '@mui/styles';
import { Box, Theme, Typography, Menu, MenuItem, Button } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { PlacezLayoutPlan } from '../../api';
import { CreateLayout, DeleteLayout } from '../../reducers/layouts';
import { useNavigate } from 'react-router';
import { sceneRoutes } from '../../routes';
import SubEventModal from '../../components/Modals/SubEventModal';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatTime } from '../../Constants/timeFormat';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../components/Hooks/useLocalStorageState';

interface Props {
  sceneId: number;
  data: PlacezLayoutPlan;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      alignItems: 'stretch',
      ...theme.PlacezBorderStyles,
      padding: '12px',
    },
    details: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    title: {
      ...theme.typography.h5,
      fontSize: 22,
    },
    itemName: {
      marginRight: '20px',
      minWidth: 'fit-content',
    },
    itemValue: {
      marginRight: '20px',
      marginBottom: '10px',
      minWidth: 'fit-content',
      color: 'gray',
    },
    rows: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
      width: '100%',
    },
    rowsBetween: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    colsBetween: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
  })
);

const SubEventCard = (props: Props) => {
  const { data } = props;
  const classes = styles(props);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [localData, setLocalData] = useState<PlacezLayoutPlan>(data);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const options = [
    'Edit Details',
    'Copy Sub Event',
    'Delete Sub Event',
    'Edit Sub Event',
  ];

  const onCopyLayout = (layout: PlacezLayoutPlan) => {
    const layoutCopy = {
      ...layout,
      name: `${layout.name} - Copy`,
    };
    layoutCopy.id = null;
    dispatch(CreateLayout(layoutCopy));
  };

  const goToSpecificPlan = (planId: string | number) =>
    navigate(
      sceneRoutes.planner.path
        .replace(':id', props.sceneId.toString())
        .replace(':planId', planId.toString())
    );

  const onDelete = (id: string) => {
    dispatch(DeleteLayout(id));
  };

  const handleOptionClick = (
    option: string,
    showModal?: (component: any, props: any) => void,
    modalProps?: any
  ) => {
    handleClose();

    switch (option) {
      case 'Edit Details':
        if (showModal) {
          showModal(SubEventModal, { ...modalProps, layout: localData });
        }
        break;

      case 'Copy Sub Event':
        onCopyLayout(localData);
        break;

      case 'Delete Sub Event':
        onDelete(localData.id);
        break;

      case 'Edit Sub Event':
        goToSpecificPlan(localData.id);
        break;

      default:
        console.warn('No handler defined for:', option);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.details}>
        <div className={classes.colsBetween}>
          <div className={classes.rowsBetween}>
            <div className={classes.title}>{localData.name}</div>
            <div>
              <Button
                onClick={handleClick}
                style={{
                  padding: '2px',
                  width: 'fit-content',
                  minWidth: 'auto',
                }}
              >
                <MoreVert />
              </Button>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    style: {
                      maxHeight: 48 * 4.5,
                      width: '20ch',
                    },
                  },
                }}
              >
                {options.map((option) => (
                  <ModalConsumer key={option}>
                    {({ showModal, props: modalProps }) => (
                      <MenuItem
                        onClick={() =>
                          handleOptionClick(option, showModal, modalProps)
                        }
                      >
                        {option}
                      </MenuItem>
                    )}
                  </ModalConsumer>
                ))}
              </Menu>
            </div>
          </div>
          <div className={classes.rows}>
            <div>
              <div className={classes.itemName}>{'Start Date'}</div>
              <div className={classes.itemValue}>
                {format(localData.startUtcDateTime, 'MMM d yyyy')}
              </div>
            </div>
            <div>
              <div className={classes.itemName}>{'End Date'}</div>
              <div className={classes.itemValue}>
                {format(localData.endUtcDateTime, 'MMM d yyyy')}
              </div>
            </div>
            <div>
              <div>{'Start Time'}</div>
              <div className={classes.itemValue}>
                {format(
                  localData.startUtcDateTime,
                  formatTime(twentyFourHourTime)
                )}
              </div>
            </div>
          </div>
          <div className={classes.rows} style={{ gap: '20px' }}>
            <div>
              <div className={classes.itemName}>{'End Time'}</div>
              <div className={classes.itemValue}>
                {format(
                  localData.endUtcDateTime,
                  formatTime(twentyFourHourTime)
                )}
              </div>
            </div>
            {/*
            <div>
              <div className={classes.itemName}>
                {'Guest Count'}
              </div>
              <div className={classes.itemValue}>{'0'}</div>
            </div>
            */}
            <div>
              <div>{'Total'}</div>
              <div className={classes.itemValue}>
                {data.price.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubEventCard;

const PropertyDisplay = (props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1">{props.label}</Typography>
      <Typography variant="caption">{props.value}</Typography>
    </Box>
  );
};
