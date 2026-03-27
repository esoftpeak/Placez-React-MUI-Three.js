import { Fragment } from 'react';

import { Theme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Client, PickList } from '../../../api';
import { SimpleModalProps } from '../SimpleModal';
import modalStyles from '../../Styles/modalStyles.css';
import { makeStyles } from '@mui/styles';
import ClientForm from '../../Forms/ClientForm';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';

const localStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    title: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(2),
      fontSize: '26px',
      textAlign: 'center',
    },
    content: {
      paddingRight: 0,
      paddingLeft: 0,
      paddingBottom: '100px',
    },
    field: {
      minWidth: '40%',
      width: '80%',
      margin: '10px 24px',
    },
    field2: {
      minWidth: '40%',
      width: '80%',
      margin: '10px 24px 10px 24px',
    },
    button: {
      padding: '4px 30px',
      borderRadius: theme.shape.borderRadius,
      width: '120px',
    },
    actions: {
      borderTop: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      padding: theme.spacing(),
      textAlign: 'center',
    },
  })
);
interface Props extends SimpleModalProps {
  handleSetNewClient: Function;
  clientName?: string;
  picklists: PickList[];
}

const ClientDialog = (props: Props) => {
  const localClasses = localStyles(props);
  const modalStyle = makeStyles<Theme>(modalStyles);
  const modalClasses = modalStyle(props);
  const classes = {
    ...modalClasses,
    ...localClasses,
  };

  const clients = useSelector((state: ReduxState) => state.client.clients);

  const client = {
    ...clients.find((c) => c.name === props.clientName),
    name: props.clientName,
  };

  const onSave = (event) => {
    const newClient = { ...getValues() };
    props.handleSetNewClient(newClient);
    props.setOpen(false);
  };

  const clientHookForm = useForm<Client>({
    mode: 'onSubmit',
    defaultValues: {
      ...client,
    },
  });

  const {
    formState: { isValid },
    getValues,
  } = clientHookForm;

  return (
    <Fragment>
      <DialogTitle className={classes.dialogTitle}>Add New Client</DialogTitle>
      <DialogContent className={classes.content}>
        <ClientForm hookForm={clientHookForm} />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <PlacezActionButton
          className={classes.button}
          onClick={() => props.setOpen(false)}
        >
          Cancel
        </PlacezActionButton>
        <PlacezActionButton
          disabled={!isValid}
          className={classes.button}
          color="primary"
          onClick={onSave}
        >
          Save
        </PlacezActionButton>
      </DialogActions>
    </Fragment>
  );
};

export default ClientDialog;
