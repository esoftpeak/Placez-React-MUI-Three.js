import { useDispatch, useSelector } from 'react-redux';

import { TextField, Tooltip, Theme, useTheme, FormLabel, Checkbox } from '@mui/material';
import { makeStyles } from '@mui/styles';

import panelStyles from '../../../Styles/panels.css';
import { HandlesFromBlue } from '../../models';
import { ReduxState } from '../../../../reducers';
import {
  SetNextTableNumber,
  ToggleDeleteTableNumberModeAction,
} from '../../../../reducers/blue';

type Props = {
  handlesFromBlue: HandlesFromBlue;
  onBack: Function;
  onClosePanel: Function;
};

const NumberPanel = (props: Props) => {
  const nextTableNumber: number = useSelector(
    (state: ReduxState) => state.blue.nextTableNumber
  );
  const deleteTableNumber: boolean = useSelector(
    (state: ReduxState) => state.blue.deleteTableNumber
  );

  const styles = makeStyles<Theme>(panelStyles);

  const dispatch = useDispatch();

  const nextTableNumberChange = (e: any) => {
    const tableNumber = isNaN(parseInt(e.target.value, 10))
      ? 0
      : parseInt(e.target.value, 10);
    dispatch(SetNextTableNumber(tableNumber));
  };

  const classes = styles(props);
  const theme = useTheme()
  return (
    <div className={classes.root}>
      <div className={classes.panelUpper}>
        <TextField
          margin="dense"
          disabled={deleteTableNumber}
          id="scene-total"
          value={nextTableNumber}
          variant='standard'
          onChange={nextTableNumberChange}
          className={classes.textArea}
          inputProps={{
            style: {
              ...theme.PlacezBorderStyles,
              fontSize: 80,
              textAlign: 'center',
              height: '190px',
            },
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </div>
      <div className={classes.panelLower}>
        <div className={classes.fieldGrid}>
          <>
            <FormLabel className={classes.fieldHeading}>
              {/* <FormatLineSpacing fontSize='small'/> */}
              Delete Drag Mode
            </FormLabel>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Tooltip title="Delete Tables">
                <Checkbox
                  checked={deleteTableNumber}
                  onChange={() =>
                    dispatch(ToggleDeleteTableNumberModeAction(!deleteTableNumber))
                  }
                  name="deleteTableNumber"
                  />
              </Tooltip>
            </div>
          </>
        </div>
      </div>
      <div
        className={classes.panelFooter}
      >
        <div style={{textAlign: 'center'}}>* Click or Drag Over Cursor</div>
      </div>
    </div>
  );
};

export default NumberPanel;
