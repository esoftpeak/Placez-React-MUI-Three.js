import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { Theme, createStyles } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { InitializeLayoutDesign } from '../../reducers/designer';
import { ChangeViewState } from '../../reducers/globalState';
import { GlobalViewState, ViewState } from '../../models/GlobalState';
import Designer from '../../components/Blue/components/Designer/Designer'
import { ReduxState } from '../../reducers'
import { layoutConstants } from '../../Constants/layout'

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: `calc(100vh - ${layoutConstants.appBarHeight}px) !important`,
      width: '100%',
      overflow: 'hidden',
    },
  })
);

interface Props {}

const LayoutPlanner = (props: Props) => {
  const classes = styles(props);
  const dispatch = useDispatch();
  const { id, planId } = useParams();
  const viewState = useSelector((state: ReduxState) => state.globalstate.viewState);

  useEffect(() => {
    dispatch(ChangeViewState(ViewState.TwoDView, viewState));
  }, []);

  useEffect(() => {
    dispatch(InitializeLayoutDesign(planId));
  }, [planId]);

  return (
    <div className={classes.root}>
      {id && planId &&
        <Designer globalViewState={GlobalViewState.Layout}/>
      }
    </div>
  );
};

export default LayoutPlanner;
