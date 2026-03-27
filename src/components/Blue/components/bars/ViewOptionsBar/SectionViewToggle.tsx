import { Theme, Tooltip, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../../reducers';
import { SetSectionView } from '../../../../../reducers/blue';
import viewOptionsStyles from '../../../../Styles/ViewOptions.css';
import {
  ViewState,
} from '../../../../../models/GlobalState';

import { BrokenImage } from '@mui/icons-material';
import { ZoomIconButton } from '../DesignerBottomBar'

interface Props {}

const SectionViewToggle = (props: Props) => {
  const sectionView = useSelector(
    (state: ReduxState) => state.blue.sectionView
  );
  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );

  const styles = makeStyles<Theme>(viewOptionsStyles);
  const classes = styles(props);

  const dispatch = useDispatch();


  const theme = useTheme();

  return (
    <>
      { viewState !== ViewState.PhotosphereView &&
        viewState !== ViewState.PhotosphereEdit &&
        viewState !== ViewState.Floorplan && (
        <Tooltip title="Section View">
          <ZoomIconButton
            name="sectionView"
            aria-label="label"
            onClick={() => dispatch(SetSectionView(!sectionView))}
            style={{
              color: sectionView ? theme.palette.primary.main : undefined,
            }}
          >
            <BrokenImage />
          </ZoomIconButton>
        </Tooltip>
      )}
    </>
  );
};

export default SectionViewToggle;
