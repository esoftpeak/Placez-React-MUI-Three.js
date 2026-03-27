import withModalContext, { WithModalContext } from '../withModalContext';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { Client } from '../../../api';
import ClientForm from '../../Forms/ClientForm';
import { useDispatch } from 'react-redux';
import {
  CreateClient,
  DeleteClient,
  UpdateClient,
} from '../../../reducers/client';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { UniversalModalWrapper } from '../UniversalModalWrapper';
import { AreYouSureDelete } from '../UniversalModal';
import { useForm } from 'react-hook-form';

import formModalStyles from '../../Styles/FormModal.css';
import formStyles from '../../Styles/formStyles.css';

interface Props extends WithModalContext {
  client?: Client;
  onClose: () => void;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const ClientModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;

  const stylesForForm = makeStyles<Theme>(formStyles);
  const formClasses = stylesForForm(props);

  const stylesForModal = makeStyles<Theme>(formModalStyles);
  const modalClasses = stylesForModal(props);

  const classes = {
    ...formClasses,
    ...modalClasses,
  };
  const dispatch = useDispatch();

  const onSubmit = () => {
    const modifiedClient = {
      ...props?.client,
      ...getValues(),
    };
    if (modifiedClient.id !== undefined) {
      dispatch(UpdateClient(modifiedClient));
    } else {
      dispatch(CreateClient(modifiedClient));
    }
    // modalProps.modalContext.hideModal();
  };

  const onSave = async () => {
    handleSubmit(onSubmit)();
  };

  const onDelete = () => {
    dispatch(DeleteClient(props?.client.id));
    modalProps.modalContext.hideModal();
  };

  const clientHookForm = useForm<Client>({
    mode: 'onSubmit',
    defaultValues: {
      ...props?.client,
    },
  });

  const { handleSubmit, getValues } = clientHookForm;

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      maxWidth="md"
      open={true}
      aria-labelledby="place-modal"
      fullWidth={true}
      scroll="paper"
      onClose={handleClose(modalProps)}
      {...props}
    >
      <DialogTitle className={classes.dialogTitle}>Client Details</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <ClientForm
          hookForm={clientHookForm}
          handleCloseModal={() => {
            modalProps.modalContext.hideModal();
          }}
          client={props?.client}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {getValues('id') && (
          <UniversalModalWrapper
            onDelete={() => onDelete()}
            modalHeader="Are you sure?"
          >
            <Tooltip title="Delete Client">
              <PlacezActionButton color="error">Delete</PlacezActionButton>
            </Tooltip>
            {AreYouSureDelete('a Client')}
          </UniversalModalWrapper>
        )}
        <PlacezActionButton
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Cancel
        </PlacezActionButton>
        <PlacezActionButton onClick={(e) => onSave()}>Save</PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(ClientModal);
