import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { Theme, createStyles } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SelectPlace } from '../../reducers/place';
import { InitializeFloorPlanDesign } from '../../reducers/designer';
import { ChangeViewState } from '../../reducers/globalState';
import { ViewState, GlobalViewState } from '../../models/GlobalState';
import { ReduxState } from '../../reducers';
import Designer from '../../components/Blue/components/Designer/Designer'

type Props = {};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    },
  })
);

const PlacePlanner = (props: Props) => {
  const dispatch = useDispatch();
  const classes = styles(props);
  const { id, floorPlanId } = useParams();
  const viewState = useSelector((state: ReduxState) => state.globalstate.viewState);

  useEffect(() => {
    dispatch(
      ChangeViewState(ViewState.Floorplan, viewState)
    );
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(SelectPlace(parseInt(id)));
    }
    if (floorPlanId) {
      dispatch(InitializeFloorPlanDesign(floorPlanId));
    } else {
      console.log('floorPlanId undefined');
    }
  }, [id, floorPlanId]);

  return (
    <div className={classes.root}>
      {id && floorPlanId &&
        <Designer globalViewState={GlobalViewState.Fixtures}/>
      }
    </div>
  );
};

export default PlacePlanner;
