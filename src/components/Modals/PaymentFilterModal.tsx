import React, { useState, useEffect } from 'react';
import withModalContext, { WithModalContext } from './withModalContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  RadioGroup,
  Radio,
} from '@mui/material';
import { PlacezDatePicker } from '../PlacezUIComponents/PlacezDatePicker';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import formModalStyles from '../Styles/FormModal.css';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export interface ColumnVisibility {
  field: string;
  title: string;
  visible: boolean;
}

export interface FilterOptions {
  dateRangeStart?: Date | null;
  dateRangeEnd?: Date | null;
  dateRangeOperator?: 'lte' | 'gte' | 'withinRange' | 'updatedRecently';
  linkStatus?: {
    initialized: boolean;
    paid: boolean;
    expired: boolean;
    canceled: boolean;
    failed: boolean;
    pending: boolean;
    rejected: boolean;
  };
  eventId?: string;
}

interface Props extends WithModalContext {
  onExportPDF: () => void;
  onExportExcel: () => void;
  columnVisibility: ColumnVisibility[];
  onColumnVisibilityChange: (columns: ColumnVisibility[]) => void;
  onFilterChange?: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const PaymentFilterModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const [localColumns, setLocalColumns] = useState<ColumnVisibility[]>(
    modalProps.columnVisibility || []
  );
  const theme = useTheme<Theme>();
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [dateRangeOperator, setDateRangeOperator] = useState<
    'lte' | 'gte' | 'withinRange' | 'updatedRecently'
  >('withinRange');
  const [linkStatus, setLinkStatus] = useState({
    initialized: true,
    paid: true,
    expired: true,
    canceled: true,
    failed: true,
    pending: true,
    rejected: true,
  });

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  useEffect(() => {
    setLocalColumns(modalProps.columnVisibility || []);
    // Initialize with any existing filters
    if (modalProps.initialFilters) {
      if (modalProps.initialFilters.dateRangeStart) {
        setDateRangeStart(modalProps.initialFilters.dateRangeStart);
      }
      if (modalProps.initialFilters.dateRangeEnd) {
        setDateRangeEnd(modalProps.initialFilters.dateRangeEnd);
      }
      if (modalProps.initialFilters.dateRangeOperator) {
        setDateRangeOperator(modalProps.initialFilters.dateRangeOperator);
      }
      if (modalProps.initialFilters.linkStatus) {
        setLinkStatus(modalProps.initialFilters.linkStatus);
      }
    }
  }, [modalProps.columnVisibility, modalProps.initialFilters]);

  const handleColumnToggle = (field: string) => {
    const updatedColumns = localColumns.map((column) =>
      column.field === field ? { ...column, visible: !column.visible } : column
    );
    setLocalColumns(updatedColumns);
  };

  const handleSave = () => {
    const filters: FilterOptions = {
      dateRangeStart,
      dateRangeEnd,
      dateRangeOperator,
      linkStatus,
    };

    if (modalProps.onFilterChange) {
      modalProps.onFilterChange(filters);
    }

    modalProps.onColumnVisibilityChange(localColumns);
    modalProps.modalContext.hideModal();
  };

  const handleDateRangeOperatorChange = (
    operator: 'lte' | 'gte' | 'withinRange' | 'updatedRecently'
  ) => {
    setDateRangeOperator(operator);
  };

  const handleLinkStatusChange = (type: string) => {
    setLinkStatus((prev) => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev],
    }));
  };

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      scroll="paper"
      open={true}
      aria-labelledby="place-modal"
      maxWidth="md"
      fullWidth={true}
      onClose={handleClose(modalProps)}
      {...props}
    >
      <DialogTitle className={classes.dialogTitle}>Filter</DialogTitle>
      <DialogContent
        className={classes.dialogContent}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '28px 28px 24px',
          height: '320px',
          gap: '14px',
        }}
      >
        <h3
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
            fontWeight: 'normal',
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : '#f3f1f2',
            color: theme.palette.text.primary,
            padding: '12px 24px',
            margin: 0,
            borderRadius: '8px',
          }}
        >
          Event Date Range
        </h3>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <RadioGroup
            value={dateRangeOperator}
            onChange={(e) =>
              handleDateRangeOperatorChange(
                e.target.value as 'lte' | 'gte' | 'withinRange' | 'updatedRecently'
              )
            }
            style={{ width: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                margin: '8px 0 0',
                width: '100%',
                gap: '16px',
              }}
            >
              {/* Date pickers */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <PlacezDatePicker
                    label="Range Start"
                    value={dateRangeStart}
                    onChange={setDateRangeStart}
                    disabled={dateRangeOperator === 'updatedRecently'}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <PlacezDatePicker
                    label="Range End"
                    value={dateRangeEnd}
                    onChange={setDateRangeEnd}
                    disabled={
                      dateRangeOperator === 'updatedRecently' ||
                      dateRangeOperator === 'gte' ||
                      dateRangeOperator === 'lte'
                    }
                  />
                </div>
              </div>

              {/* Radio options */}
              <div
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  columnGap: '28px',
                  rowGap: '12px',
                  padding: '0px 80px 0px 100px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    width: '340px',
                  }}
                >
                  <p style={{ margin: 0, paddingRight: 12 }}>Before or on date</p>
                  <Radio value="lte" />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    width: '340px',
                  }}
                >
                  <p style={{ margin: 0, paddingRight: 12 }}>
                    Within Date Range (inclusive)
                  </p>
                  <Radio value="withinRange" />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    width: '340px',
                  }}
                >
                  <p style={{ margin: 0, paddingRight: 12 }}>After or on date</p>
                  <Radio value="gte" />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    width: '340px',
                  }}
                >
                  <p style={{ margin: 0, paddingRight: 12 }}>
                    Display Results Updated Recently
                  </p>
                  <Radio value="updatedRecently" />
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          variant="outlined"
          style={{ color: '#FFFFFF' }}
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(PaymentFilterModal);
