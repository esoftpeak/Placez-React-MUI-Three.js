import { Checkbox, FormLabel, Theme, Typography } from '@mui/material';
import panelStyles from '../../../Styles/panels.css';
import {
  AssetModifierKeys,
  AssetModifiers,
} from '../../../../blue/items/asset';
import { useModifierEnabled } from '../../../Hooks/useModifierEnabled';
import AdvancedColorPicker from '../utility/AdvancedColorPicker';
import { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import PlacezSlider from '../../../PlacezUIComponents/PlacezSlider'

interface Props {
  modifier: AssetModifierKeys;
  params: AssetModifiers;
  onModifierChange: (key: AssetModifierKeys, value: any) => void;
  nullable?: boolean;
}

const EditUplightMod = (props: Props) => {
  // props.params is going from undefined to an object this forces a rerender
  useEffect(() => {
    if (props.params?.[props.modifier]) setModEnabled(true);
  }, [props.params]);

  const [modEnabled, setModEnabled] = useModifierEnabled({
    initialParams: {
      color: '#5C236F',
    },
    assetModifiers: props.params,
    modifierKey: props.modifier,
    setModifier: props.onModifierChange,
    disabled: !props.nullable,
  });

  const onModifierPropertyChange = (key: string, value: any) => {
    props.onModifierChange(props.modifier, {
      ...props.params?.uplightMod,
      [key]: value,
    });
  };

  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  return (
    <div className={classes.panelUpper}>
      {props.nullable && (
        <div className={classes.headingContainer}>
          <Typography className={classes.heading} align="center">
            Uplight Settings
          </Typography>
            <Checkbox
              checked={modEnabled}
              onChange={(e) => {
                setModEnabled(e.target.checked);
              }}
              name="chairModEnabled"
            />
        </div>
      )}
      {modEnabled && (
        <>
          <AdvancedColorPicker
            color={props?.params?.uplightMod?.color ?? '#5C236F'}
            onChange={(e) => onModifierPropertyChange('color', e.hex)}
          />
          <div className={classes.fieldGrid}>
            <FormLabel className={classes.fieldHeading}>Angle</FormLabel>
            <PlacezSlider
              className={classes.spacingSlider}
              value={props?.params?.uplightMod?.angle ?? Math.PI / 3}
              step={1}
              min={1}
              max={90}
              valueLabelDisplay="auto"
              onChange={(e, v) => onModifierPropertyChange('angle', v)}
            />
            <FormLabel className={classes.fieldHeading}>Intensity</FormLabel>
            <PlacezSlider
              className={classes.spacingSlider}
              value={props?.params?.uplightMod?.intensity ?? 100}
              step={500}
              min={500}
              max={40000}
              onChange={(e, v) => onModifierPropertyChange('intensity', v)}
            />
            <FormLabel className={classes.fieldHeading}>Tilt</FormLabel>
            <PlacezSlider
              className={classes.spacingSlider}
              value={props?.params?.uplightMod?.tilt ?? 0}
              step={1}
              min={0}
              max={90}
              onChange={(e, v) => onModifierPropertyChange('tilt', v)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EditUplightMod;
