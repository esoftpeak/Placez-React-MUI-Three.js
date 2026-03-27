import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Autocomplete,
  createStyles,
  FormLabel,
  Grid,
  Theme,
} from '@mui/material';

import { Add } from '@mui/icons-material';
import classnames from 'classnames';
// Components
import { IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';

// Models
import { Scene, Client, placezApi } from '../../api';

import AddClientModal from '../Modals/AddClientModal';
import { ReduxState } from '../../reducers';
import { SimpleModal } from '../Modals/SimpleModal';

import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import { ControlledPlacezAutocomplete } from '../PlacezUIComponents/PlacezAutoComplete';

import formStyles from '../Styles/formStyles.css';

import { Controller, UseFormReturn } from 'react-hook-form';
import { GetClients } from '../../reducers/client';

type Props = {
  hookForm: UseFormReturn<Scene, any, undefined>;
  disabled?: boolean;
};
const useCustomStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'nowrap',
      width: '94%',
      margin: '20px auto 60px auto',
      marginBottom: '10px',
      padding: 8,
    },
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      // padding: theme.spacing(),
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
const SceneForm = (props: Props) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = props.hookForm;
  const { disabled } = props;
  const styles = makeStyles<Theme>(formStyles);
  const customStyles = useCustomStyles(props);
  const classes = { ...styles(props), ...customStyles };

  const clients = useSelector((state: ReduxState) => state.client.clients);
  const picklists = useSelector(
    (state: ReduxState) => state.settings.pickLists
  );

  const [modifiedClients, setModifiedClients] = useState<Client[]>(clients);
  const dispatch = useDispatch();

  useEffect(() => {
    setModifiedClients(clients);
  }, [clients]);

  const handleNewClient = (value: any) => {
    (window as any).gtag('event', 'scene_form', 'create_new_client');
    const newClient = value;
    placezApi.postClient(newClient).then((response) => {
      const client = response.parsedBody as Client;
      setModifiedClients(modifiedClients.concat([client]));
      setValue('clientId', client.id);
      dispatch(GetClients());
    });
  };

  return (
    <div className={classnames(classes.root)}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div className={classes.fieldContainer}>
            <FormLabel className={classes.fieldHeadingLight}>
              Event Name
            </FormLabel>
            <PlacezTextField
              id="title"
              autoFocus
              {...register('name', {
                required: 'Event name is required',
              })}
              inputProps={{
                maxLength: 200,
              }}
              sx={{ marginTop: '5px' }}
              type="text"
              error={errors?.name?.message !== undefined}
              helperText={errors?.name?.message}
              disabled={disabled}
            />
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.fieldContainer}>
            <FormLabel className={classes.fieldHeadingLight}>Client</FormLabel>
            <Controller
              control={control}
              name="clientId"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <Autocomplete
                  sx={{ width: '100%' }}
                  options={modifiedClients?.map((client, index) => {
                    return {
                      label: client.name ?? '',
                      value: client.id,
                    };
                  })}
                  value={
                    modifiedClients?.find((client) => client.id === value)
                      ? {
                          label: modifiedClients.find(
                            (client) => client.id === value
                          ).name,
                          value,
                        }
                      : null
                  }
                  onChange={(e, v) => onChange((v as any)?.value)}
                  disabled={disabled}
                  renderInput={(params) => {
                    return (
                      <PlacezTextField
                        {...params}
                        error={errors?.clientId?.message !== undefined}
                        helperText={errors?.clientId?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <SimpleModal disabled={disabled}>
                              <IconButton
                                color="primary"
                                className={classes.addButton}
                                disabled={disabled}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                              <AddClientModal
                                handleSetNewClient={handleNewClient}
                                picklists={picklists}
                              />
                            </SimpleModal>
                          ),
                        }}
                      />
                    );
                  }}
                />
              )}
            />
          </div>
        </Grid>

        <Grid item xs={6}>
          <div className={classes.fieldContainer}>
            <FormLabel className={classes.fieldHeadingLight}>
              Event Manager
            </FormLabel>
            <PlacezTextField
              id="scene-manager"
              {...register('manager')}
              inputProps={{
                maxLength: 100,
              }}
              disabled={disabled}
            />
          </div>
        </Grid>

        {picklists && (
          <Grid item xs={6}>
            <div className={classes.fieldContainer}>
              <FormLabel className={classes.fieldHeadingLight}>
                Status
              </FormLabel>

              <ControlledPlacezAutocomplete
                control={control}
                {...register('status')}
                options={picklists
                  .find((list) => {
                    return list.name === 'Status';
                  })
                  ?.picklistOptions?.sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((setupStyle, index) => {
                    return {
                      label: setupStyle.name,
                      value: setupStyle.name,
                    };
                  })}
                disabled={disabled}
              />
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default SceneForm;
