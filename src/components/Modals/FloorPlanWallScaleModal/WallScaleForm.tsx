import React from 'react';
import { WithModalContext } from '../withModalContext';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Utils } from '../../../blue/core/utils';
import modalStyles from '../../Styles/modalStyles.css';
import NumberEditor from '../../NumberEditor';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    ...modalStyles,
    details: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    field: {
      minWidth: '40%',
      margin: '10px 24px',
    },
    rowLabel: {
      minWidth: '100%',
      margin: '0px 24px',
    },
  })
);
interface Props extends WithModalContext {
  handleSetWallSettings: (wallSettings: {
    hideWalls: boolean;
    wallHeight: number;
  }) => void;
  wallHeight: number;
  hideWalls: boolean;
}

const WallScaleForm = (props: Props) => {
  const [includeWall, setIncludeWall] = React.useState(!props.hideWalls);
  const [wallHeight, setWallHeight] = React.useState(props.wallHeight);

  const handleWallHeightChange = (v) => {
    setWallHeight(v !== undefined ? v : 0);
  };

  const handleCheck = (e, v) => {
    setIncludeWall(v);
  };

  const onSetWall = () => {
    props.handleSetWallSettings({ hideWalls: !includeWall, wallHeight });
    props.modalContext.hideModal();
  };

  const { hideModal } = props.modalContext;

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  return (
    <>
      <DialogTitle className={classes.dialogTitle}>Wall Height</DialogTitle>
      <DialogContent className={classes.content}>
        <FormControlLabel
          labelPlacement="start"
          onChange={handleCheck}
          control={<Checkbox checked={includeWall} onChange={handleCheck} />}
          label={'Include Walls'}
        />
        <NumberEditor
          value={wallHeight}
          onChange={handleWallHeightChange}
          step={1}
          round={0}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <PlacezActionButton className={classes.button} onClick={hideModal}>
          Cancel
        </PlacezActionButton>
        <PlacezActionButton className={classes.button} onClick={onSetWall}>
          OK
        </PlacezActionButton>
      </DialogActions>
    </>
  );
};

export default WallScaleForm;
