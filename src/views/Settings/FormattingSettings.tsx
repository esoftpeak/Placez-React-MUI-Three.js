import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { UpdateSetting } from '../../reducers/settings';
import { Theme } from '@mui/material';

import { makeStyles, createStyles } from '@mui/styles';

import { Tooltip, Button, InputLabel, Select, MenuItem } from '@mui/material';

import Jumbotron from '../../components/Jumbotron';

interface Props {}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {},
    label: {
      fontSize: 16,
      color: 'black',
      marginBottom: theme.spacing(),
    },
    form: {
      padding: theme.spacing(5),
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
    },
    formControl: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(),
      marginRight: theme.spacing(5),
    },
    select: {
      width: 200,
    },
    actions: {
      marginTop: theme.spacing(4),
      borderTop: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    actionButton: {
      padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
      margin: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      width: 200,
      height: 40,
    },
  })
);

const betaFeature = 'Feature coming soon';

const FormattingSettings = (props: Props) => {
  const classes = styles(props);
  const dispatch = useDispatch();

  const [inEdit, setInEdit] = useState<boolean>(false);

  const propsLanguage = useSelector(
    (state: ReduxState) => state.settings.language
  );
  const propsCurrency = useSelector(
    (state: ReduxState) => state.settings.currency
  );
  const propsTimeFormat = useSelector(
    (state: ReduxState) => state.settings.timeFormat
  );
  const propsDateFormat = useSelector(
    (state: ReduxState) => state.settings.dateFormat
  );

  const [settings, setSettings] = useState({
    language: propsLanguage,
    currency: propsCurrency,
    timeFormat: propsTimeFormat,
    dateFormat: propsDateFormat,
  });

  const handleChange = (name) => (event) => {
    setSettings({
      ...settings,
      [name]: event.target.value,
    });
    dispatch(UpdateSetting({ [name]: event.target.value }));
  };

  const onCancel = () => {
    setInEdit(false);
  };

  const onSubmit = () => {
    setInEdit(false);
  };

  return (
    <div className={classes.root}>
      <Jumbotron title="Formatting" />
      <div className={classes.form}>
        <div className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="language-select">
            Language
          </InputLabel>
          <Tooltip title={betaFeature}>
            <Select
              disabled
              className={classes.select}
              value={settings.language}
              onChange={handleChange('language')}
              inputProps={{
                name: 'language',
                id: 'language-select',
              }}
            >
              <MenuItem value={0}>English</MenuItem>
            </Select>
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="currency-select">
            Currency
          </InputLabel>
          <Tooltip title={betaFeature}>
            <Select
              disabled
              className={classes.select}
              value={settings.currency}
              onChange={handleChange('currency')}
              inputProps={{
                name: 'currency',
                id: 'currency-select',
              }}
            >
              <MenuItem value={0}>Dollars</MenuItem>
            </Select>
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="time-format-select">
            Time
          </InputLabel>
          <Tooltip title={betaFeature}>
            <Select
              disabled
              className={classes.select}
              value={settings.timeFormat}
              onChange={handleChange('timeFormat')}
              inputProps={{
                name: 'timeFormat',
                id: 'time-format-select',
              }}
            >
              <MenuItem value={0}>12 hr</MenuItem>
              <MenuItem value={1}>24 hr</MenuItem>
            </Select>
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="date-format-select">
            Date
          </InputLabel>
          <Tooltip title={betaFeature}>
            <Select
              disabled
              className={classes.select}
              value={settings.dateFormat}
              onChange={handleChange('dateFormat')}
              inputProps={{
                name: 'dateFormat',
                id: 'date-format-select',
              }}
            >
              <MenuItem value={0}>mm/dd/yyyy</MenuItem>
              <MenuItem value={1}>yyyy-mm-dd</MenuItem>
              <MenuItem value={1}>mmmm dd, yyyy</MenuItem>
            </Select>
          </Tooltip>
        </div>
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

export default FormattingSettings;
