import { Theme, createStyles, Tooltip, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';

import {
  RotateRight,
  RotateLeft,
  ArrowForward,
  ArrowDownward,
  ArrowUpward,
  ArrowBack,
} from '@mui/icons-material';

import classnames from 'classnames';
import { ArrowDirection } from '../../../../blue/three/controller';
import RepeatIconButton from '../utility/RepeatIconButtton';

interface Props {
  onRotate?: (direction: ArrowDirection) => void;
  onMove?: (direction: ArrowDirection) => void;
}

const FPVBar = (props: Props) => {
  const { onRotate, onMove } = props;

  const classes = styles(props);

  return (
    <div className={classnames(classes.root)}>
      <Tooltip title="Rotate Counterclockwise">
        <Paper className={classes.buttonContainer}>
          <RepeatIconButton
            className={classnames(classes.iconButton)}
            onRepeat={() => onRotate('left')}
            label="Rotate Counterclockwise"
          >
            <RotateLeft />
          </RepeatIconButton>
        </Paper>
      </Tooltip>
      <Tooltip title="Forward">
        <Paper className={classes.buttonContainer}>
          <RepeatIconButton
            className={classnames(classes.iconButton)}
            onRepeat={() => onMove('up')}
            label="Move Forward"
          >
            <ArrowUpward />
          </RepeatIconButton>
        </Paper>
      </Tooltip>
      <Tooltip title="Rotate Clockwise">
        <Paper className={classes.buttonContainer}>
          <RepeatIconButton
            className={classnames(classes.iconButton)}
            onRepeat={() => onRotate('right')}
            label="Rotate Clockwise"
          >
            <RotateRight />
          </RepeatIconButton>
        </Paper>
      </Tooltip>
      <Tooltip title="Left">
        <Paper className={classes.buttonContainer}>
          <RepeatIconButton
            className={classnames(classes.iconButton)}
            onRepeat={() => onMove('left')}
            label="Move Left"
          >
            <ArrowBack />
          </RepeatIconButton>
        </Paper>
      </Tooltip>
      <Tooltip title="Back">
        <Paper className={classes.buttonContainer}>
          <RepeatIconButton
            className={classnames(classes.iconButton)}
            onRepeat={() => onMove('down')}
            label="Move Back"
          >
            <ArrowDownward />
          </RepeatIconButton>
        </Paper>
      </Tooltip>
      <Tooltip title="Right">
        <Paper className={classes.buttonContainer}>
          <RepeatIconButton
            className={classnames(classes.iconButton)}
            onRepeat={() => onMove('right')}
            label="Move Right"
          >
            <ArrowForward />
          </RepeatIconButton>
        </Paper>
      </Tooltip>
    </div>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(),
      display: 'grid',
      width: '120px',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridGap: '5px',
      pointerEvents: 'auto',
    },
    border: {
      textTransform: 'none',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.palette.common.white,
      padding: 2,
      minWidth: 'unset',
    },
    iconButton: {
      padding: theme.spacing(),
    },
    labelInput: {
      outline: 'none',
      width: '60px',
    },
    buttonContainer: {
      border: `2px solid ${theme.palette.common.black}`,
      borderRadius: 4,
      '&:hover': {
        background: theme.palette.secondary.main,
      },
      display: 'flex',
      alignItems: 'center',
      padding: '5px',
      minWidth: '50px',
      justifyContent: 'center',
    },
  })
);

export default FPVBar;
