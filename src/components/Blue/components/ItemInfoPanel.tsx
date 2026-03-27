import { useState, useEffect } from 'react';

import { Asset } from '../../../blue/items/asset';
import {
  createStyles,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import panelStyles from '../../Styles/panels.css';
import { BillingRate } from '../../../blue/core/utils';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import { userIsNotInRole } from '../../../sharing/utils/userHelpers';
import PlacezCurrency from '../../PlacezUIComponents/PlacezCurrency';
import PlacezTextField from '../../PlacezUIComponents/PlacezTextField';

interface Props {
  asset: Asset;
  updateAsset?(asset: Asset): void;
}

const useCustomStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(),
      paddingBottom: 0,
      minHeight: '46px',
    },
    fieldHeadingLight: {
      fontWeight: 'bold',
      fontSize: '12px !important',
    },
    labelInputLight: {
      margin: theme.spacing(2),
      width: 164,
      outline: 'none',
    },
  })
);

const ItemInfoPanel = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const customStyles = useCustomStyles(props);
  const classes = { ...styles(props), ...customStyles };

  const [customAsset, setCustomAsset] = useState(undefined);

  useEffect(() => {
    setCustomAsset(props.asset);
  }, []);

  useEffect(() => {
    if (customAsset) props.updateAsset(customAsset);
  }, [customAsset]);

  const user = useSelector((state: ReduxState) => state.oidc.user);

  const setProp = (prop: string) => (e) => {
    setCustomAsset({
      ...customAsset,
      [prop]: e.target.value,
    });
  };

  const onSetRate = (event: SelectChangeEvent<{ value: BillingRate }>) => {
    setCustomAsset({
      ...customAsset,
      priceRateInHours: event.target.value,
    });
  };

  const setLabel = (prop: string) => (e) => {
    setCustomAsset({
      ...customAsset,
      labels: {
        ...customAsset.labels,
        [prop]: e.target.value,
      },
    });
  };

  const handleToggle = (prop: string) => (e) => {
    setCustomAsset({
      ...customAsset,
      [prop]: e.target.checked,
    });
  };

  if (!customAsset) return <></>;
  return (
    <div className={classes.panel} style={{ padding: '20px' }}>
      <div className={classes.lightThemePanel}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className={classes.fieldContainer}>
              <FormLabel className={classes.fieldHeadingLight}>Name</FormLabel>
              <PlacezTextField
                className={classes.labelInputLight}
                name="label"
                type="text"
                onChange={setProp('name')}
                value={customAsset.name}
              />
            </div>
          </Grid>
          {/*<div className={classes.fieldContainer}>*/}
          {/*  <FormLabel className={classes.fieldHeadingLight}>Label</FormLabel>*/}
          {/*  <PlacezTextField*/}
          {/*    className={classes.labelInputLight}*/}
          {/*    name="label"*/}
          {/*    type="text"*/}
          {/*    onChange={setLabel('titleLabel')}*/}
          {/*    value={customAsset.labels.titleLabel ?? ''}*/}
          {/*  />*/}
          {/*</div>*/}
          <Grid item xs={6}>
            <div className={classes.fieldContainer}>
              <FormLabel className={classes.fieldHeadingLight}>Info</FormLabel>
              <PlacezTextField
                className={classes.labelInputLight}
                name="info"
                type="text"
                onChange={setLabel('titleLabel')}
                value={customAsset.labels.titleLabel ?? ''}
              />
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.fieldContainer}>
              <FormLabel className={classes.fieldHeadingLight}>SKU</FormLabel>
              <PlacezTextField
                className={classes.labelInputLight}
                name="sku"
                type="text"
                onChange={setProp('vendorSku')}
                value={customAsset.vendorSku ?? ''}
              />
            </div>
          </Grid>
          {userIsNotInRole(user, 'guest') && (
            <Grid item xs={6}>
              <div className={classes.fieldContainer}>
                <FormLabel className={classes.fieldHeadingLight}>
                  Price
                </FormLabel>
                <PlacezCurrency
                  value={customAsset?.price}
                  onValueChange={(e) => {
                    setCustomAsset({
                      ...customAsset,
                      price: e,
                    });
                  }}
                />
              </div>
            </Grid>
          )}
          {userIsNotInRole(user, 'guest') && (
            <Grid item xs={6}>
              <div className={classes.fieldContainer}>
                <FormLabel className={classes.fieldHeadingLight}>
                  Rate Per
                </FormLabel>
                <Select
                  style={{ flex: 1 }}
                  id="placeSelect"
                  variant="standard"
                  value={customAsset.priceRateInHours}
                  onChange={onSetRate}
                >
                  {Object.values(BillingRate)
                    .filter((v) => isNaN(Number(v)))
                    .map((rate) => (
                      <MenuItem key={rate} value={BillingRate[rate]}>
                        {rate}
                      </MenuItem>
                    ))}
                </Select>
              </div>
            </Grid>
          )}
          {/*<div className={classes.fieldContainer}>*/}
          {/*  <FormLabel className={classes.fieldHeadingLight}>*/}
          {/*    Show Info*/}
          {/*  </FormLabel>*/}
          {/*  <Switch*/}
          {/*    size="small"*/}
          {/*    checked={customAsset.showLabel}*/}
          {/*    onChange={handleToggle('showLabel')}*/}
          {/*    value={'test'}*/}
          {/*  />*/}
          {/*</div>*/}
        </Grid>
      </div>
    </div>
  );
};

export default ItemInfoPanel;
