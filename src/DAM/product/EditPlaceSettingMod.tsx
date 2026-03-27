import { Switch, Theme, Typography } from '@mui/material';
import { AssetModifierKeys, AssetModifiers } from '../../blue/items/asset';
import { useModifierEnabled } from '../../components/Hooks/useModifierEnabled';
import { TableTypes } from '../../blue/itemModifiers/ChairMod';
import panelStyles from '../../components/Styles/panels.css';
import { useEffect } from 'react';
import { makeStyles } from '@mui/styles';

interface Props {
  modifier: AssetModifierKeys;
  params: AssetModifiers;
  onModifierChange: (prop: string, value: any) => void;
  nullable?: boolean;
}

const EditPlaceSettingMod = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  // props.params is going from undefined to an object this forces a rerender
  useEffect(() => {
    if (props.params?.[props.modifier]) setModEnabled(true);
  }, [props.params]);

  const [modEnabled, setModEnabled] = useModifierEnabled({
    initialParams: {
      tableType: TableTypes.Round,
      maxSeats: 2,
      seats: 2,
    },
    assetModifiers: props.params,
    modifierKey: props.modifier,
    setModifier: props.onModifierChange,
  });

  return (
    <div className={classes.panelUpper}>
      <div className={classes.headingContainer}>
        <Typography className={classes.heading} align="center">
          Placesetting Settings
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
    </div>
  );
};

export default EditPlaceSettingMod;
