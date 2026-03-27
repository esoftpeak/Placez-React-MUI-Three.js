import { Theme, FormLabel, Checkbox } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../../reducers';
import { CameraLayers } from '../../../../../models/BlueState';
import { ChangeCameraLayersState } from '../../../../../reducers/blue';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../../../Hooks/useLocalStorageState';
import panelStyles from '../../../../Styles/panels.css';
import PlacezSlider from '../../../../PlacezUIComponents/PlacezSlider';

interface Props {
  children?: ReactNode;
  layers: CameraLayers[];
  conflictLayers?: CameraLayers[];
  excludeLayers?: CameraLayers[];
  label: LocalStorageKey;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  showLabel?: boolean;
  scale?: boolean;
  disabled?: boolean;
}

const CameraLayerSetting = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);
  const cameraLayers = useSelector(
    (state: ReduxState) => state.blue.cameraLayers
  );
  const [layerValue, setLayerValue] = useLocalStorageState(
    props.label,
    props.defaultValue || 0
  );

  const dispatch = useDispatch();

  const toggleLayers = (layers: CameraLayers[]) => () => {
    let newLayers: CameraLayers[] = [...cameraLayers];

    for (const layer of layers) {
      if (!cameraLayers.includes(layer)) {
        newLayers.push(layer);
        if (props.conflictLayers) {
          for (const conflictLayer of props.conflictLayers) {
            newLayers = newLayers.filter(
              (camLayer) => camLayer !== conflictLayer
            );
          }
        }
        if (props.excludeLayers) {
          for (const excludeLayer of props.excludeLayers) {
            newLayers = newLayers.filter(
              (camLayer) => camLayer !== excludeLayer
            );
          }
        }
      } else {
        newLayers = newLayers.filter((camLayer) => camLayer !== layer);
        if (props.excludeLayers) {
          for (const excludeLayer of props.excludeLayers) {
            newLayers.push(excludeLayer);
          }
        }
      }
    }
    dispatch(ChangeCameraLayersState(newLayers, true));
  };

  return (
    <div>
      <FormLabel className={classes.fieldHeading}>
        {props.label}
        <Checkbox
          checked={props.layers.some((cameraLayer) =>
            cameraLayers.includes(cameraLayer)
          )}
          onChange={toggleLayers(props.layers)}
        />
      </FormLabel>
      {(props.defaultValue || props.scale) && (
        <div
          style={{
            padding: '0px 15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          {!props.scale && (
            <PlacezSlider
              value={layerValue}
              onChange={(e, v) => setLayerValue(v)}
              onClick={(e) => e.stopPropagation()}
              min={props.min}
              max={props.max}
              step={0.2}
              valueLabelDisplay="auto"
            />
          )}
          {props.scale && (
            <PlacezSlider
              value={layerValue}
              onChange={(e, v) => setLayerValue(v)}
              onClick={(e) => e.stopPropagation()}
              min={-5}
              max={10}
              step={1}
              valueLabelDisplay="off"
              track={false}
              marks={[{ value: 0 }]}
            />
          )}
        </div>
      )}
    </div>

    // <Tooltip title={props.label}>
    //   <ToggleButton
    //     name="labelSelected"
    //     aria-label="Chair Number"
    //     value={props.layers.some((cameraLayer) =>
    //       cameraLayers.includes(cameraLayer)
    //     )}
    //     onClick={!props.disabled ? toggleLayers(props.layers) : () => {}}
    //     classes={{
    //       root: classes.button,
    //       selected: classes.selected,
    //     }}
    //   >
    //     {props?.children}
    //     {props.layers.some((cameraLayer) =>
    //       cameraLayers.includes(cameraLayer)
    //     ) &&
    //       (props.defaultValue || props.scale) && (
    //         <div className={classes.moreSettings}>
    //           {!props.scale && (
    //             <Slider
    //               value={layerValue}
    //               onChange={(e, v) => setLayerValue(v)}
    //               onClick={(e) => e.stopPropagation()}
    //               min={props.min}
    //               max={props.max}
    //               step={0.2}
    //               valueLabelDisplay="auto"
    //             />
    //           )}
    //           {props.scale && (
    //             <Slider
    //               value={layerValue}
    //               onChange={(e, v) => setLayerValue(v)}
    //               onClick={(e) => e.stopPropagation()}
    //               min={-5}
    //               max={10}
    //               step={1}
    //               valueLabelDisplay="off"
    //               track={false}
    //               marks={[{ value: 0 }]}
    //             />
    //           )}
    //         </div>
    //       )}
    //   </ToggleButton>
    // </Tooltip>
  );
};

export default CameraLayerSetting;
