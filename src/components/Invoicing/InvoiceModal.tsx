import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { PlacezFixturePlan, PlacezLayoutPlan, Scene } from '../../api';

import { makeStyles } from '@mui/styles';

import { Theme } from '@mui/material';

// Components
import { InvoiceLineItem } from './InvoiceLineItemModel';
import LineItemInput from './LineItemInput';

import { ReduxState } from '../../reducers';
import { placeById } from '../../reducers/place';
import { UpdateLayouts } from '../../reducers/layouts';
import InvoiceTable from '../Tables/InvoiceTable';
import withModalContext, { WithModalContext } from '../Modals/withModalContext';
import formModalStyles from '../Styles/FormModal.css';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
// import { Utils } from '../../blue/core/utils';

interface Props extends WithModalContext {
  floorplans: PlacezFixturePlan[];
  selectedLayoutId: string;
  scene: Scene;
  layouts: PlacezLayoutPlan[];
}

const InvoiceModal = (modalProps: Props) => {
  const { scene, floorplans } = modalProps;
  const dispatch = useDispatch();
  const [localLayouts, setLocalLayouts] = useState<PlacezLayoutPlan[]>([
    ...modalProps.layouts,
  ]);
  const [selectedLineItem, setSelectedLineItem] =
    useState<InvoiceLineItem>(undefined);
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(modalProps);
  const [changed, setChanged] = useState<boolean>(false);
  const place = useSelector((state: ReduxState) =>
    placeById(state, modalProps.scene.placeId)
  );
  const taxRate = place?.taxRate ?? 0.0;
  const layout =
    localLayouts.find((layout) => layout.id === modalProps.selectedLayoutId) ||
    {};

  const selectedLayout = {
    ...layout,
    invoiceLineItems:
      layout?.invoiceLineItems?.map((item) => ({
        ...item,
        uuid: crypto.randomUUID(),
      })) || [],
    items:
      layout?.items?.map((item) => ({ ...item, uuid: crypto.randomUUID() })) ||
      [],
  };

  const handleClose = (modalProps) => (event, reason) => {
    if (reason !== 'backdropClick') {
      return;
    }
    modalProps.modalContext.hideModal();
  };

  const handleSave = () => {
    dispatch(UpdateLayouts(localLayouts));
    modalProps.modalContext.hideModal();
  };

  const updateLocalLayoutsWithModified = (modifiedLayout: PlacezLayoutPlan) => {
    const updatedLayouts = localLayouts.map((layout) => {
      if (layout.id === modifiedLayout.id) {
        return modifiedLayout;
      }
      return layout;
    });
    setLocalLayouts(updatedLayouts);
  };

  return (
    <Dialog
      open={true}
      scroll={'paper'}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      maxWidth="lg"
      onClose={handleClose(modalProps)}
    >
      <DialogTitle className={classes.dialogTitle}>
        {selectedLayout?.name}
      </DialogTitle>
      <LineItemInput
        layout={selectedLayout}
        updateLayout={updateLocalLayoutsWithModified}
        taxRate={taxRate}
        selectedLineItem={selectedLineItem}
        changed={changed}
        setChanged={setChanged}
      />
      <DialogContent
        className={classes.dialogContent}
        style={{ margin: '0px 20px' }}
      >
        <div className={classes.newInput}></div>
        <InvoiceTable
          layouts={[selectedLayout]}
          floorPlans={floorplans}
          disableActionButtons
          scene={scene}
          onRowSelect={(lineItem: InvoiceLineItem) => {
            if (!changed) {
              setSelectedLineItem(lineItem);
            }
          }}
          selectedId={selectedLineItem?.id}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            margin: '10px 0px 0px 0px',
          }}
        >
          {/* <CurrencyTextField
            defaultValue={guaranteedSpend}
            outputFormat="number"
            currencySymbol="$"
            readonly
            label="Total"
            /> */}
        </div>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton
          disabled={changed}
          onClick={() => modalProps.modalContext.hideModal()}
        >
          Cancel
        </PlacezActionButton>
        <PlacezActionButton disabled={changed} onClick={handleSave}>
          Save
        </PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(InvoiceModal);
