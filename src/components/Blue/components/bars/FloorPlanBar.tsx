import { Theme, createStyles, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  BorderColorOutlined,
  ControlCameraSharp,
  DeleteOutlined,
  AspectRatio,
  DeleteSweep,
  CheckBoxOutlineBlankOutlined,
  Image,
} from '@mui/icons-material';

import { ToggleButtonGroup } from '@mui/lab';

import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../reducers';
import {
  FloorPlanModes,
  SetFloorPlanMode,
} from '../../../../reducers/floorPlan';
import { UniversalModalWrapper } from '../../../Modals/UniversalModalWrapper';
import { AreYouSurePermanentDelete } from '../../../Modals/UniversalModal';
import PlacezToggleButton from '../../../PlacezUIComponents/PlacezToggleButton';
import PlacezIconButton from '../../../PlacezUIComponents/PlacezIconButton';

const backgroundHighLight = '#bcb9b6';
const backgroundColor = '#2A2C32';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    border: {
      margin: `${theme.spacing(2)} 0px`,
      backgroundColor,
      '&:hover': {
        background: 'rgba(42, 44, 50, 0.4)',
      },
      border: `2px solid ${theme.palette.primary.main}`,
      borderTopRightRadius: '4px !important',
      borderTopLeftRadius: '4px !important',
      borderBottomRightRadius: '4px !important',
      borderBottomLeftRadius: '4px !important',
      borderLeft: `2px solid ${theme.palette.primary.main} !important`,
      textTransform: 'none',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.palette.common.white,
      padding: theme.spacing(),
      minWidth: 'unset',
      height: 'unset',
    },
    modeButtonGroup: {
      backgroundColor: 'transparent',
    },
    selected: {
      backgroundColor: `${backgroundHighLight} !important`,
      color: `${theme.palette.primary.main} !important`,
    },
  })
);

interface Props {
  handleSetFloorPlanImage: Function;
  onScaleFloorPlanClick?: (event: any) => void;
  onDeleteAllClick?: (event: any) => void;
  onSetFloorPlanImageClick?: (event: any) => void;
  onSetWallSettings?: (event: any) => void;
}

const FloorPlanBar = (props: Props) => {
  const floorPlanMode = useSelector(
    (state: ReduxState) => state.floorPlan.mode
  );
  const dispatch = useDispatch();

  const handleModeChange = (event, newFloorPlanMode) => {
    dispatch(SetFloorPlanMode(newFloorPlanMode ?? FloorPlanModes.MOVE));
  };

  const classes = styles(props);

  return (
    <div className={classes.root}>
      <ToggleButtonGroup
        value={floorPlanMode}
        exclusive
        orientation="vertical"
        className={classes.modeButtonGroup}
        onChange={handleModeChange}
        aria-label="floor plan mode"
      >
        <PlacezToggleButton
          classes={{ selected: classes.selected }}
          value={FloorPlanModes.MOVE}
        >
          <Tooltip title="Move Line">
            <ControlCameraSharp />
          </Tooltip>
        </PlacezToggleButton>
        <PlacezToggleButton
          classes={{ selected: classes.selected }}
          value={FloorPlanModes.DRAW}
        >
          <Tooltip title="Draw Line">
            <BorderColorOutlined />
          </Tooltip>
        </PlacezToggleButton>
        <PlacezToggleButton
          classes={{ selected: classes.selected }}
          value={FloorPlanModes.DELETE}
        >
          <Tooltip title="Delete Line">
            <DeleteOutlined />
          </Tooltip>
        </PlacezToggleButton>
        <PlacezToggleButton
          classes={{ selected: classes.selected }}
          value={FloorPlanModes.SCALE}
        >
          <Tooltip title="Scale">
            <AspectRatio />
          </Tooltip>
        </PlacezToggleButton>
      </ToggleButtonGroup>

      <hr style={{ width: '100%' }} />

      <UniversalModalWrapper
        onDelete={props.onDeleteAllClick}
        modalHeader="Are you sure?"
      >
        <Tooltip title="Delete All">
          <PlacezIconButton key={`delete-Floorplans-rooms`}>
            <DeleteSweep fontSize="small" />
          </PlacezIconButton>
        </Tooltip>
        {AreYouSurePermanentDelete('all floorplan walls')}
      </UniversalModalWrapper>
      <Tooltip title="Floor Plan Image">
        <PlacezIconButton onClick={props.onSetFloorPlanImageClick}>
          <Image />
        </PlacezIconButton>
      </Tooltip>
      <Tooltip title="Set Wall Information">
        <PlacezIconButton onClick={props.onSetWallSettings}>
          <CheckBoxOutlineBlankOutlined />
        </PlacezIconButton>
      </Tooltip>
    </div>
  );
};

export default FloorPlanBar;
