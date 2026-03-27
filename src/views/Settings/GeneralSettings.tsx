import { useState } from 'react';
import { Checkbox, Divider, Theme } from '@mui/material';

import { Button, Select, MenuItem, Tooltip, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

import { ValidUnits } from '../../api/placez/models/UserSetting';

import settingStyles from '../../components/Styles/SettingStyles.css';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../components/Hooks/useLocalStorageState';
import placezLogoPurple from '../../assets/images/placezLogoPurplex512.png';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { createSelector } from 'reselect';
import { UpdateUserSetting } from '../../reducers/settings';
import LogoForm from '../../components/Modals/LoadImageModal/LogoForm';
import PlacezActionButton from '../../components/PlacezUIComponents/PlacezActionButton';

interface Props {}

const useCustomStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    formControl: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(1),
    },
  })
);

const GeneralSettings = (props: Props) => {
  const styles = makeStyles<Theme>(settingStyles);
  const [inEdit, setInEdit] = useState<boolean>(false);
  const customStyles = useCustomStyles();
  const classes = { ...styles(props), ...customStyles };

  const [unitSetting, setUnitSetting] = useLocalStorageState(
    LocalStorageKey.Units
  );
  const [twentyFourHourTime, setTwentyFourHourTime] = useLocalStorageState(
    LocalStorageKey.TwentyFourHourTime
  );
  const userRole = useSelector(
    (state: ReduxState) => state.oidc.user.profile.role
  );

  const companyLogo = useSelector((state: ReduxState) => getCompanyLogo(state));

  const [hideHelp, setHideHelp] = useLocalStorageState(
    LocalStorageKey.HideHelp
  );
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorageState(
    LocalStorageKey.HideHelpIndividaully
  );

  const onCancel = () => {
    setInEdit(false);
  };

  const onSubmit = () => {
    setInEdit(false);
  };

  const dispatch = useDispatch();

  return (
    <div className={classes.root}>
      <div className={classes.form}>
        <div className={classes.formControl}>
          <Typography variant="body1">Hide Help Tips</Typography>
          <Tooltip title="Hide Help">
            <Checkbox
              checked={hideHelp}
              value={hideHelp}
              onChange={(e) => setHideHelp(e.target.checked)}
            />
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Help Tips</Typography>
          <Tooltip title="Reset Hidden Help">
            <PlacezActionButton onClick={() => setDoNotShowAgain(null)}>
              Reset Help Tips
            </PlacezActionButton>
          </Tooltip>
        </div>
        <Divider />
        <div className={classes.formControl}>
          <Typography variant="body1">Unit Type</Typography>
          <Tooltip title="Current Units">
            <Select
              className={classes.select}
              value={unitSetting ?? 'ft'}
              onChange={(e) => setUnitSetting(e.target.value)}
            >
              {Object.values(ValidUnits).map((unit: string, index: number) => {
                return (
                  <MenuItem key={index} value={unit}>
                    {unit === ValidUnits.ftIn ? 'ft in' : unit}
                  </MenuItem>
                );
              })}
            </Select>
          </Tooltip>
        </div>
        <Divider />
        <div className={classes.formControl}>
          <Typography variant="body1">24 Hour Time</Typography>
          <Tooltip title="24 Hour Time">
            <Checkbox
              checked={twentyFourHourTime}
              value={twentyFourHourTime}
              onChange={(e) => setTwentyFourHourTime(e.target.checked)}
            />
          </Tooltip>
        </div>
        <Divider />
        <LogoForm
          defaultImage={placezLogoPurple}
          currentImage={companyLogo?.settingValue}
          autoSetImage={true}
          isFromSettings
          handleSetImage={
            userRole === 'Admin' || userRole === 'Subscription Owner'
              ? (image) => {
                  dispatch(
                    UpdateUserSetting({ ...companyLogo, settingValue: image })
                  );
                }
              : undefined
          }
        />
        {inEdit && (
          <div className={classes.actions}>
            <Button
              onClick={onCancel}
              className={classes.actionButton}
              variant="contained"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className={classes.actionButton}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const getUserSettings = (state) => {
  return state.settings.userSettings;
};

const getCompanyLogo = createSelector([getUserSettings], (userSettings) =>
  userSettings.find((setting) => setting.name === 'Company Logo')
);

export default GeneralSettings;
