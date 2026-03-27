import withModalContext, { WithModalContext } from '../withModalContext';

import { Theme, Dialog } from '@mui/material';

import { makeStyles } from '@mui/styles';

import {} from '@mui/material';

import WallScaleForm from './WallScaleForm';
import formModalStyles from '../../Styles/FormModal.css'

interface Props extends WithModalContext {
  handleSetWallSettings: (wallSettings: {hideWalls: boolean, wallHeight: number}) => void;
  wallHeight: number;
  hideWalls: boolean;
}

const FloorPlanWallScaleModal = (modalProps: Props) => {

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(modalProps);
  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      open={true}
      aria-labelledby="place-modal"
      fullWidth={true}
      scroll="paper"
    >
      <WallScaleForm
        handleSetWallSettings={modalProps.handleSetWallSettings}
        hideWalls={modalProps.hideWalls}
        wallHeight={modalProps.wallHeight}
        modalContext={modalProps.modalContext}
      />
    </Dialog>
  );
};

export default withModalContext(FloorPlanWallScaleModal);
