import { forwardRef, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Tab, Theme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../reducers';
import {
  GlobalViewState,
  ToolState,
  ViewState,
} from '../../../../models/GlobalState';
import {
  ChangeToolState,
  ChangeViewState,
} from '../../../../reducers/globalState';
import { HandlesFromBlue } from '../../models';
import LabelPanel from './LabelPanel';
import NumberPanel from './NumberPanel';
import ShapePanel from './ShapePanel';
import panelStyles from '../../../Styles/panels.css';
import PlacezTabs from '../../../PlacezUIComponents/PlacezTabs';
import PlacezTooltip from '../../../PlacezUIComponents/PlacezTooltip';

interface Props {
  handlesFromBlue: HandlesFromBlue;
}

const AnnotationsPanel = forwardRef<HTMLDivElement, Props>(
  (props: Props, ref) => {
    const styles = makeStyles<Theme>(panelStyles);
    const classes = styles(props);
    const dispatch = useDispatch();
    const closePanel = () => {};
    const viewState = useSelector(
      (state: ReduxState) => state.globalstate.viewState
    );
    const toolState = useSelector(
      (state: ReduxState) => state.globalstate.toolState
    );

    const [tabIndex, setTabIndex] = useState('Notes');

    useEffect(() => {
      const config = tabConfigurations.find(
        (c) => c.viewState === viewState && c.toolState === toolState
      );
      if (config) {
        setTabIndex(config.label);
      }
    }, [viewState, toolState]);

    const globalViewState = useSelector(
      (state: ReduxState) => state.globalstate.globalViewState
    );

    const tabConfigurations =
      globalViewState === GlobalViewState.Layout
        ? [
            {
              viewState: ViewState.LabelView,
              toolState: ToolState.Default,
              label: 'Notes',
            },
            {
              viewState: ViewState.LabelView,
              toolState: ToolState.Favorites,
              label: 'Favorite Notes',
            },
            {
              viewState: ViewState.NumberView,
              toolState: ToolState.Default,
              label: 'Table Number',
            },
            {
              viewState: ViewState.ShapeView,
              toolState: ToolState.Default,
              label: 'Measurements',
            },
          ]
        : [
            {
              viewState: ViewState.LabelView,
              toolState: ToolState.Default,
              label: 'Notes',
            },
            {
              viewState: ViewState.LabelView,
              toolState: ToolState.Favorites,
              label: 'Favorite Notes',
            },
            {
              viewState: ViewState.ShapeView,
              toolState: ToolState.Default,
              label: 'Measurements',
            },
          ];

    const handleChange = (e: React.ChangeEvent<{}>, v: string) => {
      setTabIndex(v);
      const config = tabConfigurations.find((c) => c.label === v);
      dispatch(ChangeViewState(config.viewState, viewState));
      dispatch(ChangeToolState(config.toolState));
    };

    return (
      <div className={classes.root}>
        <PlacezTabs
          variant="scrollable"
          scrollButtons={true}
          value={tabIndex}
          onChange={(e, v) => handleChange(e, v)}
        >
          {tabConfigurations.map((config) => (
            <Tab
              key={`${config.viewState}${config.toolState}`}
              value={config.label}
              label={
                  <PlacezTooltip title={config.label}>
                    <span>{config.label}</span>
                  </PlacezTooltip>
              }
            />
          ))}
        </PlacezTabs>
        {viewState === ViewState.LabelView && <LabelPanel />}
        {viewState === ViewState.NumberView && (
          <NumberPanel
            handlesFromBlue={props.handlesFromBlue}
            onClosePanel={closePanel}
            onBack={() => {}}
          />
        )}
        {viewState === ViewState.ShapeView && (
          <ShapePanel
            handlesFromBlue={props.handlesFromBlue}
            onClosePanel={closePanel}
            onBack={() => {}}
          />
        )}
      </div>
    );
  }
);

export default AnnotationsPanel;
