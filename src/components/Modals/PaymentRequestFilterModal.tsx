import React, { useState, useEffect } from 'react';
import withModalContext, { WithModalContext } from './withModalContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Dialog,
} from '@mui/material';
import { PlacezDatePicker } from '../PlacezUIComponents/PlacezDatePicker';
import { makeStyles } from '@mui/styles';
import formModalStyles from '../Styles/FormModal.css';
import { useTheme } from '@mui/material/styles';

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
    paid: boolean;
    notPaid: boolean;
    flagged: boolean;
    late: boolean;
  };
  invoiceNumber?: string;
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

const PaymentRequestFilterModal = (modalProps: Props) => {
  const theme = useTheme();
  const { props } = modalProps.modalContext;
  const [localColumns, setLocalColumns] = useState<ColumnVisibility[]>(
    modalProps.columnVisibility || []
  );
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [dateRangeOperator, setDateRangeOperator] = useState<
    'lte' | 'gte' | 'withinRange' | 'updatedRecently'
  >('withinRange');

  const [linkStatus, setLinkStatus] = useState<FilterOptions['linkStatus']>({
    paid: true,
    notPaid: true,
    flagged: true,
    late: true,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  // Update local state from initial filters
  useEffect(() => {
    setLocalColumns(modalProps.columnVisibility || []);
    if (modalProps.initialFilters) {
      if (modalProps.initialFilters.dateRangeStart)
        setDateRangeStart(modalProps.initialFilters.dateRangeStart);
      if (modalProps.initialFilters.dateRangeEnd)
        setDateRangeEnd(modalProps.initialFilters.dateRangeEnd);
      if (modalProps.initialFilters.dateRangeOperator)
        setDateRangeOperator(modalProps.initialFilters.dateRangeOperator);
      if (modalProps.initialFilters.linkStatus)
        setLinkStatus((prev) => ({
          ...prev,
          ...modalProps.initialFilters!.linkStatus,
        }));
    }
  }, [modalProps.columnVisibility, modalProps.initialFilters]);

  // Function to propagate filters immediately
  const propagateFilters = (updatedLinkStatus?: FilterOptions['linkStatus']) => {
    const filters: FilterOptions = {
      dateRangeStart,
      dateRangeEnd,
      dateRangeOperator,
      linkStatus: updatedLinkStatus || linkStatus,
    };
    modalProps.onFilterChange?.(filters);
  };

  const handleColumnToggle = (field: string) => {
    const updatedColumns = localColumns.map((column) =>
      column.field === field ? { ...column, visible: !column.visible } : column
    );
    setLocalColumns(updatedColumns);
    modalProps.onColumnVisibilityChange(updatedColumns);
  };

  const handleDateRangeStartChange = (date: Date | null) => {
    setDateRangeStart(date);
    propagateFilters();
  };

  const handleDateRangeEndChange = (date: Date | null) => {
    setDateRangeEnd(date);
    propagateFilters();
  };

  const handleDateRangeOperatorChange = (
    operator: FilterOptions['dateRangeOperator']
  ) => {
    setDateRangeOperator(operator);
    propagateFilters();
  };

  const handleLinkStatusChange = (type: keyof FilterOptions['linkStatus']) => {
    setLinkStatus((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      propagateFilters(updated);
      return updated;
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // You can propagate category as part of filters if needed
  };

  const handleSave = () => {
    // Ensure filters are saved on modal close
    propagateFilters();
    modalProps.modalContext.hideModal();
  };

  return (
    <Dialog
      classes={{ paper: classes.modal }}
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
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '20px',
          height: 'auto',
          gap: '20px',
        }}
      >
        {/* ======= Created Date Range ======= */}
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
            padding: '10px 85px',
          }}
        >
          Created Date Range
        </h3>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'space-around',
          }}
        >
          <RadioGroup
            value={dateRangeOperator}
            onChange={(e) =>
              handleDateRangeOperatorChange(
                e.target.value as
                  | 'lte'
                  | 'gte'
                  | 'withinRange'
                  | 'updatedRecently'
              )
            }
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                margin: '10px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '60px',
                }}
              >
                <PlacezDatePicker
                  label="Range Start"
                  value={dateRangeStart}
                  onChange={setDateRangeStart}
                  disabled={dateRangeOperator === 'updatedRecently'}
                />
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

              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Before or on date</p> <Radio value="lte" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>After or on date</p> <Radio value="gte" />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Within Date Range (inclusive)</p>{' '}
                    <Radio value="withinRange" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Display Results Updated Recently</p>{' '}
                    <Radio value="updatedRecently" />
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* ======= Options Section ======= */}
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
            padding: '10px 85px',
          }}
        >
          Options
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingLeft: '85px',
          }}
        >
          <div style={{ gap: '20px', marginBottom: '40px' }}>
            <span
              style={{
                width: '175px',
                marginRight: '10px',
              }}
            >
              Include Status Types:
            </span>
            {(['paid', 'notPaid', 'flagged', 'late'] as const).map((status) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    size="small"
                    checked={linkStatus[status]}
                    onChange={() => handleLinkStatusChange(status)}
                  />
                }
                label={status.charAt(0).toUpperCase() + status.slice(1)}
              />
            ))}
          </div>
        </div>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          variant="outlined"
          onClick={(e) => modalProps.modalContext.hideModal()}
          sx={{
            color: theme.palette.text.primary,
            borderColor:
              theme.palette.mode === 'dark'
                ? theme.palette.divider
                : (theme as any).palette?.secondary?.main,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              borderColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.text.primary
                  : (theme as any).palette?.secondary?.main,
            },
          }}
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

export default withModalContext(PaymentRequestFilterModal);
