import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import withModalContext, { WithModalContext } from '../withModalContext';
import EditInvoiceTable from '../../Tables/EditInvoiceTable';
import LineItemInput from './LineItemInput';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import formModalStyles from '../../Styles/FormModal.css';

interface Props extends WithModalContext {
  title?: string;
  onSave?: () => void;
}

const useStyles = makeStyles<Theme>(formModalStyles);

const EditInvoiceModal = (modalProps: Props) => {
  const { onSave, modalContext } = modalProps;
  const classes = useStyles();

  return (
    <Dialog
      open
      onClose={modalContext.hideModal}
      maxWidth="lg"
      scroll="paper"
      fullWidth
      aria-labelledby="invoice-dialog-title"
      PaperProps={{
        style: {
          border: '1px solid #5C256F',
          borderRadius: '4px',
        },
      }}
    >
      <DialogTitle
        className={classes.dialogTitle}
        style={{ backgroundColor: '#EEE9EF' }}
      >
        {modalProps.title || 'Invoice'}
      </DialogTitle>

      <DialogContent style={{ padding: '0px 0px' }}>
        {/* Line Item Input Section */}
        <div style={{ margin: '20px' }}>
          <LineItemInput
            layout={{}}
            selectedLineItem={undefined}
            deleteLineItem={() => {}}
            changed={false}
            setChanged={() => {}}
          />
        </div>

        <DialogTitle
          style={{ backgroundColor: '#F3F2F2', margin: '0', padding: '1' }}
        >
          {'Subevent Name'}
        </DialogTitle>

        {/* Invoice Table */}
        <EditInvoiceTable
          layouts={[]}
          floorPlans={[]}
          disableActionButtons
          scene={{} as any}
          onRowSelect={() => {}}
          selectedId={undefined}
        />
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        style={{
          padding: '16px 24px',
          justifyContent: 'center',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#EEE9EF',
        }}
      >
        <PlacezActionButton
          variant="outlined"
          onClick={modalContext.hideModal}
          style={{ marginRight: '12px' }}
        >
          Cancel
        </PlacezActionButton>
        <PlacezActionButton
          variant="contained"
          onClick={onSave}
          style={{ color: '#FFF', backgroundColor: '#5C236F' }}
        >
          Save
        </PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '4px 0',
  fontSize: '14px',
} as const;

export default withModalContext(EditInvoiceModal);
