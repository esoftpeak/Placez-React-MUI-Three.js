import { Slider, Theme, ToggleButton, Tooltip, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import viewOptionsStyles from '../../../../Styles/ViewOptions.css';
import { Height } from '@mui/icons-material';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../../../Hooks/useLocalStorageState';
import { Utils } from '../../../../../blue/core/utils';

interface Props {
  min?: number;
  max?: number;
  step?: number;
}

const DimensionSlider = styled(Slider)({
  '& .PrivateValueLabel-circle-365': {
    width: 48, // Adjust these values
    height: 48, // Adjust these values
    textTransform: 'none !important' as any,
  },
});

const DimensionCutoffToggle = (props: Props) => {
  const styles = makeStyles<Theme>(viewOptionsStyles);
  const classes = styles(props);

  const [hideDimensions, setHideDimensions] = useLocalStorageState<boolean>(
    LocalStorageKey.HideFloorplanDimensions,
    false
  );
  const [dimensionCutOff, setDimensionCutOff] = useLocalStorageState(
    LocalStorageKey.DimensionCutoff
  );

  return (
    <Tooltip title={'Dimension Cutoff'}>
      <ToggleButton
        aria-label="Dimension Cutoff"
        value={!hideDimensions}
        onClick={() => setHideDimensions(!hideDimensions)}
        classes={{
          root: classes.button,
          selected: classes.selected,
        }}
      >
        <Height />
        {!hideDimensions && (
          <div className={classes.moreSettings}>
            <DimensionSlider
              value={dimensionCutOff}
              onChange={(e, v) => setDimensionCutOff(v)}
              onClick={(e) => e.stopPropagation()}
              min={props.min}
              max={props.max}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(e) =>
                Utils.unitsOutString(e, undefined, undefined, true)
              }
              track="inverted"
            />
          </div>
        )}
      </ToggleButton>
    </Tooltip>
  );
};

export default DimensionCutoffToggle;
