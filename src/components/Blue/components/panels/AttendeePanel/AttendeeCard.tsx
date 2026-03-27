import { Button, IconButton, ListItem, ListItemText, Theme, Tooltip, Typography, useTheme } from "@mui/material"
import { createStyles, makeStyles } from "@mui/styles"
import { Attendee } from "../../../../../api"
import { useDispatch, useSelector } from "react-redux"
import { SelectAttendee, UnseatAttendee } from "../../../../../reducers/attendee"
import { HideChairAction } from "../../../../../reducers/blue"
import { Ref, useState } from "react"
import { EditOutlined, PermIdentity } from "@mui/icons-material"
import { ReduxState } from "../../../../../reducers"
import { guestUpdateAttendee, isGuest } from "../../../../../reducers/globalState"
import { HandlesFromBlue } from "../../../models"
import { ModalConsumer } from "../../../../Modals/ModalContext"
import AttendeeModal from "../../../../Modals/AttendeeModal"

type Props = {
  attendee: Attendee;
  selected?: boolean;
  handlesFromBlue: HandlesFromBlue;
  refs?: {[id: string]: Ref<HTMLLIElement>};
  setSeatsChanged?: (changed: boolean) => void;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    listItem: {
      cursor: 'grab',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
      },
      '&:disabled': {
        opacity: 0.5,
      },
    },
    selectedListItem: {
      border: `2px solid ${theme.palette.primary.main}`,
      cursor: 'grab',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      padding: '0px !important'
    },
    cardInfo: {
      display: 'flex',
      flexDirection: 'column',
      height: '60px',
      whiteSpace: 'nowrap',
    },
    infoHeader: {
      color: theme.palette.primary.main,
      fontSize: '10px',
    },
    infoBody: {
      fontSize: '12px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    collapsed: {
      display: 'flex',
      alignItems: 'center',
      height: '40px',
    },
    expanded: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    actions: {
      display: 'flex',
      justifyContent: 'center'

    },
    button: {
      margin: '4px !important',
      // width: '81px',
      // padding: '0px !important',
      // height: '22px',
      // borderRadius: '3px !important',
    }
  })
);

const AttendeeListItemText: React.FC<{ attendee: any }> = ({ attendee }) => {
  // Replace "any" with the correct type of "attendee"
  let secondaryText = '';

  if (attendee.tableId) {
    if (attendee.tableInfo) {
      secondaryText += `Table: ${attendee.tableInfo}`;
    }
    if (attendee.chairNumber) {
      secondaryText += secondaryText
        ? ` Chair: ${attendee.chairNumber}`
        : `Chair: ${attendee.chairNumber}`;
    }
  }

  return (
    <ListItemText
      primary={`${attendee.firstName} ${attendee.lastName}`}
      secondary={secondaryText}
    />
  );
};

const AttendeeCard = (props: Props) => {
  const { attendee, setSeatsChanged, selected, refs } = props;
  const classes = styles(props);
  const dispatch = useDispatch();

  const allowUpdateAttendee = useSelector((state: ReduxState) =>
    guestUpdateAttendee(state)
  );

  const isAGuest = useSelector((state: ReduxState) => isGuest(state));

  const [moved, setMoved] = useState<boolean>(false);

  const onMove = (e: TouchEvent) => {
    if (moved) return;
    setMoved(true);
  };

  const onSetAttendee = (e: TouchEvent & MouseEvent, attendee: Attendee) => {
    if (allowUpdateAttendee || !isAGuest) {
      props.handlesFromBlue.onDragAttendee(attendee);
    }
    setSeatsChanged(true);
  };

  const handleListItemClick = (event, selectedId) => {
    dispatch(SelectAttendee(selectedId));
    setMoved(false);
  };

  const theme: Theme = useTheme();



  return (
    <div key={attendee.id}
      className={ selected
        ? classes.selectedListItem
        : classes.listItem
      }>
      <ListItem
        ref={refs[attendee.id]}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
        draggable={true}
        onClick={(event) => handleListItemClick(event, attendee.id)}
        onDragEnd={(e: any) => onSetAttendee(e, attendee)}
        onTouchMove={(e: any) => onMove(e)}
        onMouseMove={(e: any) => onMove(e)}
        onTouchEnd={(e: any) => onSetAttendee(e, attendee)}
      >
        <div className={classes.collapsed}>
          <PermIdentity style={{
            marginRight: '20px',
            color: selected ? theme.palette.primary.main : theme.palette.text.primary,
          }}/>
          {selected ? (
            <ListItemText
              primary={`${attendee.firstName} ${attendee.lastName}`}
            />
          ) : (
            <AttendeeListItemText attendee={attendee} />
          )}
          {selected &&
            <ModalConsumer>
              {({ showModal, props }) => (
                <Tooltip title="Edit Guest">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal(AttendeeModal, { ...props, attendee });
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
              )}
            </ModalConsumer>
          }
        </div>

        {selected && (
          <div
            className={classes.expanded}
          >
            <Tooltip placement='top' title={attendee.tableInfo ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Table:</div>
              <div className={classes.infoBody}>{attendee.tableInfo ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.chairNumber ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Chair:</div>
              <div className={classes.infoBody}>{attendee.chairNumber ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.group ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Group:</div>
              <div className={classes.infoBody}>{attendee.group ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.meal ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Meal:</div>
              <div className={classes.infoBody}>{attendee.meal ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.allergies ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Allergies:</div>
              <div className={classes.infoBody}>{attendee.allergies ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.email ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Email:</div>
              <div className={classes.infoBody}>{attendee.email ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.phone ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>Phone:</div>
              <div className={classes.infoBody}>{attendee.phone ?? '?'}</div>
            </div>
            </Tooltip>
            <Tooltip placement='top' title={attendee.rsvp ?? '?'}>
            <div className={classes.cardInfo}>
              <div className={classes.infoHeader}>RSVP:</div>
              <div className={classes.infoBody}>{attendee.rsvp ?? '?'}</div>
            </div>
            </Tooltip>
          </div>
        )}
        {allowUpdateAttendee &&
          selected &&
          attendee.chairNumber !== undefined && (
            <div className={classes.actions}>
              <Button
                className={classes.button}
                aria-label="removeAttendee"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(
                    UnseatAttendee(attendee.chairNumber, attendee.tableId)
                  );
                  dispatch(SelectAttendee(undefined));

                  setSeatsChanged(true);
                }}
              >
                <Typography variant="button">Unseat</Typography>
              </Button>
              <Button
                className={classes.button}
                aria-label="removeChair"
                variant="outlined"
                onClick={(e) => {
                  dispatch(HideChairAction(attendee));
                  setSeatsChanged(true);
                }}
              >
                <Typography variant="button">Remove Seat</Typography>
              </Button>
            </div>
          )}
      </ListItem>
    </div>
  )
}

export default AttendeeCard
