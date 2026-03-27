import { FormLabel, Switch, Theme, Typography } from '@mui/material';
import { AssetModifierKeys, AssetModifiers } from '../../blue/items/asset';
import { useModifierEnabled } from '../../components/Hooks/useModifierEnabled';
import panelStyles from '../../components/Styles/panels.css';
import { useEffect } from 'react';
import { makeStyles } from '@mui/styles';

interface Props {
  modifier: AssetModifierKeys;
  params: AssetModifiers;
  onModifierChange: (prop: string, value: any) => void;
  nullable?: boolean;
}

const EditLinenMod = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  // props.params is going from undefined to an object this forces a rerender
  useEffect(() => {
    if (props.params?.[props.modifier]) setModEnabled(true);
  }, [props.params]);

  const [modEnabled, setModEnabled] = useModifierEnabled({
    initialParams: {
      linenDefaultSku: props.params?.linenMod?.linenDefaultSku,
    },
    assetModifiers: props.params,
    modifierKey: props.modifier,
    setModifier: props.onModifierChange,
  });

  return (
    <div className={classes.panelUpper}>
      <div className={classes.headingContainer}>
        <Typography className={classes.heading} align="center">
          Linen Settings
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
          <FormLabel className={classes.fieldHeading}>Linen ID</FormLabel>
          <div className={classes.sliderDiv}>
            <input
              name="linenDefaultSku"
              type="text"
              className={classes.field}
              value={props.params?.linenMod?.linenAssetId ?? ''}
              onChange={(e) =>
                props.onModifierChange(props.modifier, {
                  ...props.params?.linenMod,
                  linenDefaultSku: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditLinenMod;
