import { FormLabel, Switch, Theme, Typography } from '@mui/material';
import { AssetModifierKeys, AssetModifiers } from '../../blue/items/asset';
import { useModifierEnabled } from '../../components/Hooks/useModifierEnabled';
import { ArchitectureParams } from '../../blue/itemModifiers/ArchitectureMod';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import panelStyles from '../../components/Styles/panels.css';
import { useEffect } from 'react';
import { makeStyles } from '@mui/styles';

interface Props {
  modifier: AssetModifierKeys;
  params: AssetModifiers;
  onModifierChange: (prop: string, value: any) => void;
  nullable?: boolean;
}

const EditArchitectureMod = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  // props.params is going from undefined to an object this forces a rerender
  useEffect(() => {
    if (props.params?.[props.modifier]) setModEnabled(true);
  }, [props.params]);

  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);

  const [modEnabled, setModEnabled] = useModifierEnabled({
    initialParams: {
      linenDefaultSku: props.params?.linenMod?.linenDefaultSku,
    },
    assetModifiers: props.params,
    modifierKey: props.modifier,
    setModifier: props.onModifierChange,
  });

  const onModifierPropertyChange = (
    key: keyof ArchitectureParams,
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
          Architecture Settings
        </Typography>
        {props.nullable && (
          <Switch
            checked={modEnabled}
            onChange={(e) => {
              setModEnabled(e.target.checked);
            }}
            name="architectureModEnabled"
            color="primary"
          />
        )}
      </div>
      {modEnabled && (
        <div className={classes.fieldColumns}>
          <FormLabel className={classes.fieldHeading}>
            Architecture Asset
          </FormLabel>
          <div className={classes.sliderDiv}>
            <input
              name="architectureId"
              type="text"
              className={classes.field}
              value={
                props.params?.architectureMod?.architectureAsset?.resourcePath
              }
              onChange={(event) => {
                const value = event.target.value;
                onModifierPropertyChange(
                  'architectureAsset',
                  assetsBySku[value]
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditArchitectureMod;
