import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../reducers';

import { Theme, Tooltip, Divider } from '@mui/material';

import { createStyles, makeStyles, styled } from '@mui/styles';

import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import {
  OpenWith,
  ThreeSixty,
  Save,
  Cancel,
  SwapVert,
  RemoveRedEye,
} from '@mui/icons-material';

import { UpdatePhotosphereSetup } from '../../../../reducers/globalState';
import { PhotosphereSetup } from '../../models';

import {
  toggleButtonGroupClasses,
} from '@mui/material/ToggleButtonGroup';


const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    border: 0,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  // [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
  //   {
  //     marginLeft: -1,
  //     borderLeft: '1px solid transparent',
  //   },
}));

interface Props {}

const TogglePhotosphereBar = (props: Props) => {
  const photosphereSetup = useSelector(
    (state: ReduxState) => state.globalstate.photoSphereSetup
  );

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home)));
  }, []);

  const handleClickEvent = (prop: any) => (event: any) => {
    switch (prop) {
      case 'homeButton':
        if (modified()) {
          dispatch(
            dispatch(UpdatePhotosphereSetup(PhotosphereSetup.HomeModified))
          );
        } else {
          dispatch(dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home)));
        }
        break;
      case 'moveFloorButton':
        if (modified()) {
          dispatch(UpdatePhotosphereSetup(PhotosphereSetup.MoveFloorModified));
        } else {
          dispatch(UpdatePhotosphereSetup(PhotosphereSetup.MoveFloor));
        }
        break;
      case 'rotateSphereButton':
        if (modified()) {
          dispatch(
            UpdatePhotosphereSetup(PhotosphereSetup.RotateSphereModified)
          );
        } else {
          dispatch(UpdatePhotosphereSetup(PhotosphereSetup.RotateSphere));
        }
        break;
      case 'changeHeightButton':
        if (modified()) {
          dispatch(
            UpdatePhotosphereSetup(PhotosphereSetup.ChangeHeightModified)
          );
        } else {
          dispatch(UpdatePhotosphereSetup(PhotosphereSetup.ChangeHeight));
        }
        break;
      case 'saveSetupButton':
        dispatch(UpdatePhotosphereSetup(PhotosphereSetup.SaveSetup));
        break;
      case 'cancelButton':
        dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Cancel));
        break;
      default:
        dispatch(UpdatePhotosphereSetup(PhotosphereSetup.Home));
    }
  };

  const modified = (): boolean => {
    return (
      photosphereSetup === PhotosphereSetup.HomeModified ||
      photosphereSetup === PhotosphereSetup.ChangeHeightModified ||
      photosphereSetup === PhotosphereSetup.MoveFloorModified ||
      photosphereSetup === PhotosphereSetup.RotateSphereModified
    );
  };

  const classes = styles(props);

  return (
    <div className={classes.root}>
      <StyledToggleButtonGroup
        exclusive
        aria-label="Toggle Labels"
        size="small"
      >
        <Tooltip title="Rotate Camera">
          <ToggleButton
            value="1"
            name="labelSelected"
            aria-label="label"
            selected={
              photosphereSetup === PhotosphereSetup.Home ||
              photosphereSetup === PhotosphereSetup.HomeModified ||
              photosphereSetup === PhotosphereSetup.SaveSetup
            }
            onClick={handleClickEvent('homeButton')}
            classes={{
              root: classes.button,
              selected: classes.selected,
            }}
          >
            <RemoveRedEye />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Move Floor">
          <ToggleButton
            value="2"
            name="labelSelected"
            aria-label="number"
            selected={
              photosphereSetup === PhotosphereSetup.MoveFloor ||
              photosphereSetup === PhotosphereSetup.MoveFloorModified
            }
            onClick={handleClickEvent('moveFloorButton')}
            classes={{
              root: classes.button,
              selected: classes.selected,
            }}
          >
            <OpenWith />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Rotate Floor">
          <ToggleButton
            value="3"
            name="labelSelected"
            aria-label="number"
            selected={
              photosphereSetup === PhotosphereSetup.RotateSphere ||
              photosphereSetup === PhotosphereSetup.RotateSphereModified
            }
            onClick={handleClickEvent('rotateSphereButton')}
            classes={{
              root: classes.button,
              selected: classes.selected,
            }}
          >
            <ThreeSixty />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Camera Height">
          <ToggleButton
            value="4"
            name="labelSelected"
            aria-label="number"
            selected={
              photosphereSetup === PhotosphereSetup.ChangeHeight ||
              photosphereSetup === PhotosphereSetup.ChangeHeightModified
            }
            onClick={handleClickEvent('changeHeightButton')}
            classes={{
              root: classes.button,
              selected: classes.selected,
            }}
          >
            <SwapVert />
          </ToggleButton>
        </Tooltip>
      </StyledToggleButtonGroup>
      <Divider orientation="vertical" className={classes.divider} />
      <StyledToggleButtonGroup
        exclusive
        aria-label="Toggle Labels"
        size="small"
        style={{ borderColor: 'red'}}
        classes={
          {
            // root: classes.border,
          }
        }
      >
        <Tooltip title="Save">
          <ToggleButton
            value="1"
            name="labelSelected"
            aria-label="label"
            disabled={
              photosphereSetup === PhotosphereSetup.Home ||
              photosphereSetup === PhotosphereSetup.MoveFloor ||
              photosphereSetup === PhotosphereSetup.RotateSphere ||
              photosphereSetup === PhotosphereSetup.ChangeHeight ||
              photosphereSetup === PhotosphereSetup.SaveSetup
            }
            onClick={handleClickEvent('saveSetupButton')}
            classes={{
              root: classes.saveButton,
              selected: classes.selected,
            }}
          >
            <Save />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <ToggleButton
            value="4"
            name="labelSelected"
            disabled={
              photosphereSetup === PhotosphereSetup.Home ||
              photosphereSetup === PhotosphereSetup.MoveFloor ||
              photosphereSetup === PhotosphereSetup.RotateSphere ||
              photosphereSetup === PhotosphereSetup.ChangeHeight ||
              photosphereSetup === PhotosphereSetup.SaveSetup
            }
            aria-label="number"
            selected={photosphereSetup === PhotosphereSetup.Cancel}
            onClick={handleClickEvent('cancelButton')}
            classes={{
              root: classes.cancelButton,
              selected: classes.selected,
            }}
          >
            <Cancel />
          </ToggleButton>
        </Tooltip>
      </StyledToggleButtonGroup>
    </div>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'stretch',
      backgroundColor: theme.palette.background.default,
      ...theme.PlacezBorderStyles,
      borderRadius: '9px !important',
      height: '40px',
      margin: '8px'
    },
    selected: {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: `${theme.palette.common.white} !important`,
    },
    button: {
      border: 'none',
      '&:hover': {
        background: theme.palette.secondary.main,
        color: `${theme.palette.common.white} !important`,
      },
    },
    saveButton: {
      border: 'none',
      '&:not(:disabled)': {
        color: `${theme.palette.primary.main} !important`,
      },
      '&:hover': {
        background: theme.palette.secondary.main,
        color: `${theme.palette.common.white} !important`,
      },
    },
    cancelButton: {
      border: 'none',
      '&:not(:disabled)': {
        color: `${theme.palette.error.main} !important`,
      },
      '&:hover': {
        background: theme.palette.secondary.main,
        color: `${theme.palette.common.white} !important`,
      },
    },
    divider: {
      alignSelf: 'stretch',
      height: 'auto',
      margin: theme.spacing(1, 0.5),
    },
    cameraHeight: {
      color: theme.palette.primary.main,
    },
  })
);

export default TogglePhotosphereBar;
