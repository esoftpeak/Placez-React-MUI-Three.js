import { useState, useEffect, createRef, RefObject } from 'react';
import {
  Typography,
  Tooltip,
  Button,
  IconButton,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ModalConsumer } from '../../../../Modals/ModalContext';

import panelStyles from '../../../../Styles/panels.css';
import { HandlesFromBlue } from '../../../models';
import { Add, Cancel } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  UpdateAttendees,
  SelectAttendee,
  SelectTable,
} from '../../../../../reducers/attendee';
import { ReduxState } from '../../../../../reducers';
import { Attendee } from '../../../../../api';
import { guestUpdateAttendee, isGuest } from '../../../../../reducers/globalState';
import AttendeeCard from './AttendeeCard'
import GuestListModal from '../../../../Modals/GuestListModal'
import AttendeeModal from '../../../../Modals/AttendeeModal'

interface Props {
  handlesFromBlue: HandlesFromBlue;
  onBack: Function;
  exitAttendees: Function;
}

const AttendeePanel = (props: Props) => {
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  const [refs, setRefs] = useState({});
  const [seatsChanged, setSeatsChanged] = useState(false);

  const attendees = useSelector(
    (state: ReduxState) => state.attendee.attendees
  );
  const selectedAttendeeId = useSelector(
    (state: ReduxState) => state.attendee.selectedId
  );
  const selectedTableId = useSelector(
    (state: ReduxState) => state.attendee.selectedTableId
  );
  const allowUpdateAttendee = useSelector((state: ReduxState) =>
    guestUpdateAttendee(state)
  );
  const isAGuest = useSelector((state: ReduxState) => isGuest(state));


  const handleAddAttendees = (attendees: Attendee[]) => {
    dispatch(UpdateAttendees(attendees));
  };

  const clearTable = (selectedTableId: string, attendees: Attendee[]): void => {
    const unseatedAttendees = attendees.map((attendee: Attendee): Attendee => {
      if (attendee.tableId === selectedTableId) {
        return {
          ...attendee,
          chairNumber: undefined,
          tableId: undefined,
          tableInfo: undefined,
        };
      }
      return attendee;
    });
    dispatch(UpdateAttendees(unseatedAttendees));
    dispatch(SelectAttendee(undefined));
    dispatch(SelectTable(undefined));
  };

  useEffect(() => {
    updateRefs(attendees);
  }, []);

  const updateRefs = (attendees: Attendee[]) => {
    const refs = attendees.reduce((acc: {[id: string]: RefObject<HTMLLIElement>}, attendee: Attendee) => {
      const ref = createRef<HTMLLIElement>();
      acc[attendee.id] = ref;
      return acc;
    }, {});
    setRefs(refs);
  };

  useEffect(() => {
    updateRefs(attendees);
  }, [attendees]);

  useEffect(() => {
    if (selectedAttendeeId) {
      refs[selectedAttendeeId].current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedAttendeeId]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
    }
  };


  const attendeelistItems = attendees
    .filter((attendee: Attendee) => {
      if (selectedTableId !== undefined) {
        return attendee.tableId === selectedTableId;
      }
      return true;
    })
    .map((attendee) => (
      <AttendeeCard
        key={attendee.id}
        refs={refs}
        handlesFromBlue={props.handlesFromBlue}
        attendee={attendee}
        selected={attendee.id === selectedAttendeeId}
        setSeatsChanged={setSeatsChanged}
      />
    ));

  return (
    <div className={classes.root}>
      <div className={classes.panelUpper}>
        <div className={classes.mainHeadingContainer}>
          <div style={{ width: '10px'}}></div>
          <Typography className={classes.title}>Assign Guests</Typography>
          <ModalConsumer>
            {({ showModal, props }) => (
              <Tooltip title="Add Guest">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    showModal(AttendeeModal, { ...props });
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            )}
          </ModalConsumer>

        </div>
      </div>
      {selectedTableId && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ minWidth: '40px' }}></div>
          <Typography variant="h6" style={{ alignSelf: 'center' }}>
            Table Selected
          </Typography>
          <IconButton
            onClick={() => {
              dispatch(SelectTable(undefined));
            }}
          >
            <Cancel />
          </IconButton>
        </div>
      )}
      <div className={classes.panelLower}>
        <div className={classes.listItemContainer}>{attendeelistItems}</div>
      </div>
      <div className={classes.panelFooter}>
        {selectedTableId && (
          <div className={classes.buttonDiv}>
            <Button
              variant="outlined"
              onClick={(e) => {
                clearTable(selectedTableId, attendees);
              }}
                classes={{
                  root: classes.button,
                }}
            >
                Clear Table
            </Button>
          </div>
        )}
        <div className={classes.buttonDiv}>
          {/*<Button*/}
          {/*  // className={classes.button}*/}
          {/*  onClick={(e) => {*/}
          {/*    dispatch(UpdateAttendees());*/}
          {/*  }}*/}
          {/*  variant='outlined'*/}
          {/*  disabled*/}
          {/*      classes={{*/}
          {/*        root: classes.button,*/}
          {/*      }}*/}
          {/*>*/}
          {/*    Refresh (is this necessary?)*/}
          {/*</Button>*/}
          {(allowUpdateAttendee || !isAGuest) && (
              <ModalConsumer>
                {({ showModal, props }) => (
                  <Tooltip title="Edit Guest List">
                    <Button
                      className={classes.button}
                      onClick={() => {
                        dispatch(SelectAttendee(undefined));
                        showModal(GuestListModal, {
                          ...props,
                          handleAddAttendees: handleAddAttendees,
                          currentAttendees: props.attendees,
                        });
                      }}
                      onKeyDown={handleKeyDown}
                      variant="outlined"
                      classes={{
                        root: classes.button,
                      }}
                    >
                        Guest List
                    </Button>
                  </Tooltip>
                )}
              </ModalConsumer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeePanel;
