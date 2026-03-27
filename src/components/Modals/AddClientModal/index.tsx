import { Theme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PickList } from '../../../api';
import { SimpleModalProps } from '../SimpleModal';
import ClientDialog from './ClientDialog';

interface Props extends SimpleModalProps {
  handleSetNewClient: (value: any) => void;
  clientName?: string;
  picklists: PickList[];
}

const styles = makeStyles<Theme>((theme: Theme) => createStyles({}));

const AddClientModal = (props: Props) => {
  const { picklists, open, setOpen } = props;
  const classes = styles(props);
  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      maxWidth="md"
      open={open}
      aria-labelledby="place-modal"
      scroll="paper"
      {...props}
    >
      <ClientDialog
        handleSetNewClient={props.handleSetNewClient}
        setOpen={setOpen}
        clientName={props.clientName}
        picklists={picklists}
      />
    </Dialog>
  );
};

export default AddClientModal;
