import React, { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CardPaymentForm, { CardFormValues } from './../Forms/PaymentForm';
import { Client, placezApi } from '../../api';

interface Props {
  client?: Client;
}

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    minWidth: 650,
    borderCollapse: 'collapse',
    '& th, & td': {
      textAlign: 'center',
      verticalAlign: 'middle',
    },
  },
  tableContainer: {
    boxShadow: 'none',
    border: '1px solid #80008096',
    backgroundColor: theme.palette.background.paper,
  },
  tableHeader: {
    '& th': {
      fontWeight: 'normal',
      color: theme.palette.text.secondary, // was #333 (bad in dark mode)
      padding: '10px 16px',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? theme.palette.action.hover
          : 'rgba(46, 41, 40, 0.03)',
      borderBottom: `1px solid ${theme.palette.divider} !important`,
    },
  },
  tableRow: {
    '& td, & th': {
      borderBottom: 'none !important',
    },
  },
  tableHead: {
    padding: '10px 16px',
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: `2px solid ${theme.palette.divider}`,
    fontSize: '12px !important',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.action.hover
        : 'rgba(46, 41, 40, 0.03)',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  tableCell: {
    padding: '10px 16px',
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: `2px solid ${theme.palette.divider}`,
    fontWeight: 400,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  checkboxCell: {
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: `2px solid ${theme.palette.divider}`,
    width: 40,
    padding: '0px !important',
    backgroundColor: 'transparent',
  },
  saveCardTable: {
    padding: '0px 30px',
  },
  labelBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.action.hover : '#e9e9e8',
    borderRadius: '5px',
    marginBottom: '20px',
  },

  labelTitle: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 20px',
    gap: '10px',
  },
  iconButton: {
    minWidth: '40px !important',
    border: '1px solid #5C236F',
  },
  iconButtonActive: {
    minWidth: '40px !important',
    border: '1px solid #5C236F',
    backgroundColor: '#5C236F',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#4A1C59',
    },
  },
  submitButton: {
    backgroundColor: '#5C236F',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#4A1C59',
    },
  },
  saveNewCard: {
    borderRadius: '10px',
    '&>div>div': {
      maxWidth: '510px',
      borderRadius: '10px !important',
    },
    '& .MuiDialogContent-root': {
      padding: '60px 0px 40px 0px',
      border: '1px solid #E0E0E0',
      borderRadius: '10px',
    },
  },
}));

const ClientSaveCardTable = (modalProps: Props) => {
  const classes = useStyles();

  const columns = [
    { field: 'cardType', title: 'Card Type' },
    { field: 'cardNumber', title: 'Card Number' },
  ];

  const [rows, setRows] = React.useState<
    { id: number; cardType: string; cardNumber: string }[]
  >([]);

  const [isDeleteMode, setIsDeleteMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    if (!modalProps.client?.id) return;

    placezApi
      .getClientCards(modalProps.client.id)
      .then((response) => {
        const { savedCards } = response.parsedBody;

        const mappedRows = savedCards
          .filter((card) => !card.deleted)
          .map((card) => ({
            id: card.id,
            cardType: card.cardType,
            cardNumber: `XXXXXXXXXXXX${card.ccLastFour}`,
          }));

        setRows(mappedRows);
      })
      .catch((error) => console.error(error));
  }, [modalProps.client?.id]);

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < rows.length;
  const selectedCount = selectedIds.length;

  const handleToggleDeleteMode = () => {
    setIsDeleteMode((prev) => !prev);
    if (isDeleteMode) setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(rows.map((r) => r.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleAddCard = (data: CardFormValues) => {
    const digits = data.cardNumber.replace(/\D/g, '');
    const last4 = digits.slice(-4) || '0000';
    const maskedNumber = `XXXXXXXXXXXX${last4}`;

    let cardType = 'Card';
    if (/^4/.test(digits)) cardType = 'Visa';
    else if (/^5[1-5]/.test(digits)) cardType = 'Mastercard';
    else if (/^3[47]/.test(digits)) cardType = 'Amex';

    setRows((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((r) => r.id)) + 1,
        cardType,
        cardNumber: maskedNumber,
      },
    ]);

    setOpenAddModal(false);
  };

  const handleOpenDeleteConfirm = () => {
    if (!selectedCount) {
      setIsDeleteMode(false);
      setSelectedIds([]);
      return;
    }
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setIsDeleteMode(false);
    setSelectedIds([]);
  };

  const handleConfirmDelete = async () => {
    if (!modalProps.client?.id || selectedIds.length === 0) return;

    try {
      setIsDeleting(true);

      await Promise.all(
        selectedIds.map((cardId) =>
          placezApi.deleteClientCard(modalProps.client!.id, cardId)
        )
      );

      setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
      setSelectedIds([]);
      setIsDeleteMode(false);
      setOpenDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete saved cards', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteConfirmText =
    selectedCount === 1
      ? 'Are you sure you want to delete this saved card?'
      : `Are you sure you want to delete these ${selectedCount} saved cards?`;

  return (
    <>
      <Box className={classes.saveCardTable}>
        <Box className={classes.labelBar}>
          <div className={classes.labelTitle}>
            <Typography>Saved Cards</Typography>
          </div>

          <div className={classes.labelTitle}>
            <Tooltip title="Save New Card">
              <Button
                size="small"
                className={classes.iconButton}
                onClick={handleOpenAddModal}
              >
                <AddCardOutlinedIcon />
              </Button>
            </Tooltip>

            {isDeleteMode ? (
              <Tooltip title="Save Changes">
                <Button
                  size="small"
                  className={classes.iconButtonActive}
                  onClick={handleOpenDeleteConfirm}
                >
                  <SaveOutlinedIcon />
                </Button>
              </Tooltip>
            ) : rows.length > 0 ? (
              <Tooltip title="Delete Saved Cards">
                <Button
                  size="small"
                  className={classes.iconButton}
                  onClick={handleToggleDeleteMode}
                >
                  <DeleteOutlineOutlinedIcon />
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </Box>

        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHeader}>
                {isDeleteMode && (
                  <TableCell className={classes.checkboxCell}>
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                )}
                {columns.map((c) => (
                  <TableCell key={c.field} className={classes.tableHead}>
                    {c.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {isDeleteMode && (
                    <TableCell className={classes.checkboxCell}>
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) =>
                          handleSelectOne(row.id, e.target.checked)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className={classes.tableCell}>
                    {row.cardType}
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    {row.cardNumber}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Card Modal */}
      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        fullWidth
        className={classes.saveNewCard}
      >
        <DialogContent>
          <CardPaymentForm onSubmit={handleAddCard} client={modalProps.client} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Saved Cards</DialogTitle>
        <DialogContent>
          <Typography>{deleteConfirmText}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            variant="contained"
            className={classes.submitButton}
          >
            {isDeleting ? 'Deleting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientSaveCardTable;
