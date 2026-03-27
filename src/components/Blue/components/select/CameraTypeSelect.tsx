import { useDispatch, useSelector } from 'react-redux';

import {
  Select,
  FormControl,
  MenuItem,
} from '@mui/material';

// Loading
import { ReduxState } from '../../../../reducers';
import { ViewState } from '../../../../models/GlobalState';
import { ChangeViewState } from '../../../../reducers/globalState'

const CameraTypeSelect = () => {
  const dispatch = useDispatch();
  const viewState = useSelector((state: ReduxState) => state.globalstate.viewState);

  return (
    <FormControl variant="standard" sx={{ m: 1, width: 60 }}>
      {(viewState === ViewState.TwoDView || viewState === ViewState.ThreeDView) &&
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={viewState}
          disableUnderline
          onChange={(e) => {
            dispatch(ChangeViewState(e.target.value as ViewState, viewState))
          }}
        >
          <MenuItem value={ViewState.TwoDView}>2D</MenuItem>
          <MenuItem value={ViewState.ThreeDView}>3D</MenuItem>
        </Select>
      }
    </FormControl>
  );
};

export default CameraTypeSelect;
