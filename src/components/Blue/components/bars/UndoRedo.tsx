import { useDispatch } from 'react-redux';
import { canEditLayout } from '../../../../reducers/globalState';

import {
  Theme,
  createStyles,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Cancel, Redo, Save as SaveIcon, Undo } from '@mui/icons-material';

import { Save, Reset } from '../../../../reducers/blue';
import { UndoHistory, RedoHistory } from '../../../../reducers/undoRedo';
import { ViewState, GlobalViewState } from '../../../../models/GlobalState';
import { ReduxState } from '../../../../reducers';

import { useSelector } from 'react-redux';
import { UniversalModalWrapper } from '../../../Modals/UniversalModalWrapper';

interface Props {}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    iconButton: {
      padding: '4px',
      '&:hover': {
        color: `${theme.palette.common.white} !important`,
      },
    },
    progress: {
      margin: '8px',
    },
  })
);

const UndoRedo = (props: Props) => {
  const viewState: ViewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const globalViewState: GlobalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const floorPlanMode = useSelector(
    (state: ReduxState) => state.floorPlan.mode
  );
  const future: any[] = useSelector(
    (state: ReduxState) => state.undoRedo.future
  );
  const past: any[] = useSelector((state: ReduxState) => state.undoRedo.past);
  const blueReady: boolean = useSelector(
    (state: ReduxState) => state.blue.blueInitialized
  );

  const allowUpdateLayout: boolean = useSelector((state: ReduxState) =>
    canEditLayout(state)
  );
  const needSave: boolean = useSelector(
    (state: ReduxState) => state.blue.needSave
  );
  const saving: boolean = useSelector((state: ReduxState) => state.blue.saving);

  const dispatch = useDispatch();

  const classes = styles(props);

  const validViewState = [
    ViewState.Floorplan,
    ViewState.TwoDView,
    ViewState.ThreeDView,
    ViewState.LabelView,
    ViewState.NumberView,
    ViewState.ShapeView,
    ViewState.TextureView,
  ].includes(viewState);

  const undoRedoValidLayoutState =
    [ViewState.TwoDView, ViewState.ThreeDView].includes(viewState) &&
    globalViewState === GlobalViewState.Layout;

  const save = (e) => {
    dispatch(Save());
  };

  return (
    <span className={classes.root}>
      {(validViewState || validViewState) && allowUpdateLayout && blueReady && (
        <>
          <Tooltip title={saving ? 'Saving' : needSave ? 'Save' : 'Saved'}>
            <>
              {saving && (
                <CircularProgress
                  variant="indeterminate"
                  color="primary"
                  size={24}
                  className={classes.progress}
                />
              )}
              {!saving && (
                <IconButton
                  disabled={!needSave}
                  onClick={save}
                  aria-label="Save"
                  onKeyDown={(e) => {
                    e.preventDefault();
                  }}
                  className={classes.iconButton}
                >
                  <SaveIcon fontSize="medium" />
                </IconButton>
              )}
            </>
          </Tooltip>
          <UniversalModalWrapper
            onDelete={() => {
              (window as any).gtag('event', 'cancel-reset', {
                globalState: globalViewState,
                viewState:
                  globalViewState === GlobalViewState.Layout
                    ? ViewState
                    : ViewState,
                floorplanMode:
                  globalViewState === GlobalViewState.Fixtures
                    ? floorPlanMode
                    : undefined,
              });
              dispatch(Reset());
            }}
            modalHeader="Are you sure?"
          >
            <Tooltip title="Reset">
              <IconButton
                aria-label="Cancel"
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                className={classes.iconButton}
              >
                <Cancel fontSize="medium" />
              </IconButton>
            </Tooltip>
            {
              'This will clear all changes since the beginning of your session. \n Are you Sure you want to Delete Changes?'
            }
          </UniversalModalWrapper>
        </>
      )}
      {(undoRedoValidLayoutState || validViewState) && (
        <>
          {(past.length !== 0 || future.length !== 0) && (
            <Tooltip title="Undo">
              <IconButton
                onClick={() => {
                  dispatch(UndoHistory());
                }}
                disabled={past.length === 0}
                aria-label="Undo"
                className={classes.iconButton}
              >
                <Undo fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
          {(past.length !== 0 || future.length !== 0) && (
            <Tooltip title="Redo">
              <IconButton
                onClick={() => {
                  dispatch(RedoHistory());
                }}
                disabled={future.length === 0}
                aria-label="Redo"
                className={classes.iconButton}
              >
                <Redo fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </span>
  );
};

export default UndoRedo;
