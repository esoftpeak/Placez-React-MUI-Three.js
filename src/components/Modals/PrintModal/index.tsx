import { Dialog, Theme, createTheme } from '@mui/material';
import PrintPane from './PrintPane';
import { Scene } from '../../../api/';
import PlacezLayoutPlan from '../../../api/placez/models/PlacezLayoutPlan';
import { themeGenerator } from '../../../assets/themes/ThemeGenerator';
import { SimpleModalProps } from '../SimpleModal';
import modalStyles from '../../Styles/modalStyles.css';
import { ThemeProvider, makeStyles } from '@mui/styles';

interface Props extends SimpleModalProps {
  layout: PlacezLayoutPlan;
  scene: Scene;
  getInventory: any;
  onScreenshot: () => void;
}

const PrintModal = (props: Props) => {
  const styles = makeStyles<Theme>(modalStyles);
  const classes = styles(props);

  const { layout, scene, getInventory, onScreenshot, setOpen, ...dialogProps } = props;

  return (
    <Dialog
      className={classes.dialog}
      open={props.open}
      fullWidth={true}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      scroll={'paper'}
      maxWidth="lg"
      {...dialogProps}
    >
      <ThemeProvider theme={createTheme(themeGenerator('light'))}>
        <PrintPane
          layout={props.layout}
          scene={props.scene}
          getInventory={props.getInventory}
          onScreenshot={props.onScreenshot}
          hideModal={() => props.setOpen(false)}
        />
      </ThemeProvider>
    </Dialog>
  );
};

export default PrintModal;
