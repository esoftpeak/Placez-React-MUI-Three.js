import { FormLabel, Slider, Switch, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChairParams, TableTypes } from '../../blue/itemModifiers/ChairMod';
import { AssetModifierKeys, AssetModifiers } from '../../blue/items/asset';
import { useModifierEnabled } from '../../components/Hooks/useModifierEnabled';
import panelStyles from '../../components/Styles/panels.css';
import { useEffect } from 'react';

interface Props {
  modifier: AssetModifierKeys;
  params: AssetModifiers;
  onModifierChange: (prop: string, value: any) => void;
  nullable?: boolean;
}

const EditChairMod = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  // props.params is going from undefined to an object this forces a rerender
  useEffect(() => {
    if (props.params?.[props.modifier]) setModEnabled(true);
  }, [props.params]);

  const [modEnabled, setModEnabled] = useModifierEnabled({
    initialParams: {
      maxSeats: 2,
      seats: 2,
    },
    assetModifiers: props.params,
    modifierKey: props.modifier,
    setModifier: props.onModifierChange,
  });

  const onModifierPropertyChange = (key: keyof ChairParams, value: any) => {
    props.onModifierChange(props.modifier, {
      ...props.params?.chairMod,
      [key]: value,
    });
  };

  return (
    <div className={classes.panelUpper}>
      <div className={classes.headingContainer}>
        <Typography className={classes.heading} align="center">
          Chair Settings
        </Typography>
        {props.nullable && (
          <Switch
            checked={modEnabled}
            onChange={(e) => {
              setModEnabled(e.target.checked);
            }}
            name="chairModEnabled"
            color="primary"
          />
        )}
      </div>
      {modEnabled && (
        <div className={classes.fieldColumns}>
          <FormLabel className={classes.fieldHeading}>Max Seats</FormLabel>
          <div className={classes.sliderDiv}>
            <Slider
              className={classes.spacingSlider}
              value={props.params?.chairMod?.maxSeats ?? 0}
              step={1}
              min={0}
              max={32}
              valueLabelDisplay="auto"
              onChange={(e, v) => onModifierPropertyChange('maxSeats', v)}
              color="secondary"
            />
          </div>
        </div>
      )}
      {modEnabled && (
        <div className={classes.fieldColumns}>
          <FormLabel className={classes.fieldHeading}>Table Shape</FormLabel>
          <div className={classes.sliderDiv}>
            <select
              name="tableType"
              value={props?.params?.chairMod?.tableType}
              onChange={(e) =>
                onModifierPropertyChange('tableType', e.target.value)
              }
            >
              {Object.keys(TableTypes).map((key) => {
                return <option value={TableTypes[key]}>{key}</option>;
              })}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditChairMod;
