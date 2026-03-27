import { FormLabel, Switch, Theme, Typography } from '@mui/material';
import { AssetModifierKeys, AssetModifiers } from '../../blue/items/asset';
import { useModifierEnabled } from '../../components/Hooks/useModifierEnabled';
import { TableTypes } from '../../blue/itemModifiers/ChairMod';
import { CenterpieceParams } from '../../blue/itemModifiers/CenterpieceMod';
import panelStyles from '../../components/Styles/panels.css';
import { useEffect } from 'react';
import { makeStyles } from '@mui/styles';

interface Props {
  modifier: AssetModifierKeys;
  params: AssetModifiers;
  onModifierChange: (prop: string, value: any) => void;
  nullable?: boolean;
}

const EditCenterpieceMod = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  // props.params is going from undefined to an object this forces a rerender
  useEffect(() => {
    if (props.params?.[props.modifier]) setModEnabled(true);
  }, [props.params]);

  const [modEnabled, setModEnabled] = useModifierEnabled({
    initialParams: {
      tableType: props.params?.chairMod?.tableType ?? TableTypes.Round,
    },
    assetModifiers: props.params,
    modifierKey: props.modifier,
    setModifier: props.onModifierChange,
  });

  const onModifierPropertyChange = (
    key: keyof CenterpieceParams,
    value: any
  ) => {
    props.onModifierChange(props.modifier, {
      ...props.params?.chairMod,
      [key]: value,
    });
  };

  return (
    <div className={classes.panelUpper}>
      <div className={classes.headingContainer}>
        <Typography className={classes.heading} align="center">
          Centerpiece Settings
        </Typography>
        {props.nullable && (
          <Switch
            checked={modEnabled}
            onChange={(e) => {
              setModEnabled(e.target.checked);
            }}
            name="modEnabled"
            color="primary"
          />
        )}
      </div>
      {modEnabled && (
        <>
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
        </>
      )}
    </div>
  );
};

export default EditCenterpieceMod;
