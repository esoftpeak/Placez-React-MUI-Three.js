import React from 'react';
import { makeStyles } from '@mui/styles';
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
import CardPaymentForm, { CardFormValues } from './../Forms/PaymentForm';

const useStyles = makeStyles({
  table: {
    borderCollapse: 'collapse',
    '& th, & td': {
      verticalAlign: 'middle',
      testAlign: 'center'
    },
  },
  tableContainer: {
    boxShadow: 'none',
    borderRadius: 0,
  },
  tableHeader: {
    backgroundColor: 'none',
    '& th': {
      borderRight: 'none !important',
      borderBottom: 'none',
      borderTop: 'none',
    },
  },
  tableHead: {
    padding: '0px 10px',
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: '1px solid #E0E0E0',
    fontSize: '12px !important',
    fontWeight: 500,
    textAlign: 'left',
    color: '#7A6A86',
    '&:last-child': {
      borderRight: 'none',
      textAlign: 'center',
    },
  },
  tableRow: {
    backgroundColor: '#F3F2F2',
    '&:nth-of-type(even)': {
      backgroundColor: '#F4F0F8',
    },
    '&:hover': {
      backgroundColor: '#EEE4F7',
      cursor: 'pointer',
    },
    '& td': {
      borderBottom: 'none !important',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: '1px solid #E0E0E0',
    },
    '& td:last-child': {
      borderRight: 'none',
    },
  },
  nameCell: {
    padding: '0px 10px',
    fontWeight: 500,
    textAlign: 'left',
  },
  tableCell: {
    padding: '0px 10px',
    textAlign: 'left',
  },
  ceCell: {
    padding: '4px 10px',
    textAlign: 'center',
    width: 64,
  },
  checkboxCell: {
    padding: '0px !important',
    width: 40,
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: '1px solid #E0E0E0',
  },
  labelBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F2F2',
    borderRadius: '5px',
    margin: '20px 0px',
    paddingRight: '10px'
  },
  labelTitle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px 20px',
    gap: '10px',
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: '15px',
    lineHeight: '22px',
    letterSpacing: '0px',
    color: '#3E3F42'
  },
  labeDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
  addNewCreditButton: {
    '&>p': {
      fontSize: '13px !important',
      color: '#514F4D',
    }
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
  dialogTitle: {
    paddingBottom: 0,
  },
  saveNewCard: {
    borderRadius: '10px',
    '& > div > div': {
      maxWidth: '510px',
      borderRadius: '10px !important',
    },
    '& .MuiDialogContent-root': {
      padding: '60px 0px 40px 0px',
      border: '1px solid #E0E0E0',
      borderRadius: '10px',
    },
  },
});

type CardRow = {
  id: number;
  nameOnCard: string;
  cardType: string;
  cardNumber: string;
  ce: boolean;
};

const ClientSaveCardTable = () => {
  const classes = useStyles();

  const [rows, setRows] = React.useState<CardRow[]>([
    {
      id: 1,
      nameOnCard: 'Steve Toll',
      cardType: 'Amex',
      cardNumber: 'XXXXXXXXXXXX4837',
      ce: false,
    },
    {
      id: 2,
      nameOnCard: 'Whitney Strong',
      cardType: 'Visa',
      cardNumber: 'XXXXXXXXXXXX2882',
      ce: false,
    },
    {
      id: 3,
      nameOnCard: 'Steve Toll',
      cardType: 'Amex',
      cardNumber: 'XXXXXXXXXXXX4837',
      ce: false,
    },
  ]);

  const [isDeleteMode, setIsDeleteMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [openAddModal, setOpenAddModal] = React.useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false);

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < rows.length;
  const selectedCount = selectedIds.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(rows.map((r) => r.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id),
    );
  };

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Add new card from CardPaymentForm
  const handleAddCard = (data: CardFormValues) => {
    const digits = data.cardNumber.replace(/\D/g, '');
    const last4 = digits.slice(-4) || '0000';
    const maskedNumber = `XXXXXXXXXXXX${last4}`;

    let cardType = 'Card';
    if (/^4/.test(digits)) cardType = 'Visa';
    else if (/^5[1-5]/.test(digits)) cardType = 'Mastercard';
    else if (/^3[47]/.test(digits)) cardType = 'Amex';

    setRows((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
      // clear CE on existing rows, set CE on new card
      const cleared = prev.map((r) => ({ ...r, ce: false }));
      return [
        ...cleared,
        {
          id: nextId,
          nameOnCard: 'New Card',
          cardType,
          cardNumber: maskedNumber,
          ce: true,
        },
      ];
    });

    setOpenAddModal(false);
  };

  // Toggle CE (single-select) – click row or CE checkbox
  const handleToggleCe = (id: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, ce: !row.ce } : { ...row, ce: false },
      ),
    );
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setIsDeleteMode(false);
    setSelectedIds([]);
  };

  const handleConfirmDelete = () => {
    setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
    setSelectedIds([]);
    setIsDeleteMode(false);
    setOpenDeleteConfirm(false);
  };

  const deleteConfirmText =
    selectedCount === 1
      ? 'Are you sure you want to delete this saved card?'
      : `Are you sure you want to delete these ${selectedCount} saved cards?`;

  return (
    <>
      <Box>
        <Box className={classes.labelBar}>
          <div className={classes.labelTitle}>
            <Typography>Saved Credit Cards</Typography>
          </div>
          <div className={classes.labeDescription}>
            <Button onClick={handleOpenAddModal} className={classes.addNewCreditButton}>
              <Typography>Add Credit Card +</Typography>
            </Button>
          </div>
        </Box>

        <Box>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table className={classes.table} aria-label="saved cards table">
              <TableHead>
                <TableRow className={classes.tableHeader}>
                  {isDeleteMode && (
                    <TableCell
                      className={classes.checkboxCell}
                      padding="checkbox"
                    >
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell className={classes.tableHead}>
                    Name on Card
                  </TableCell>
                  <TableCell className={classes.tableHead}>
                    Card Type
                  </TableCell>
                  <TableCell className={classes.tableHead}>
                    Card Number
                  </TableCell>
                  <TableCell className={classes.tableHead}>CE</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={classes.tableRow}
                    hover
                    onClick={
                      !isDeleteMode ? () => handleToggleCe(row.id) : undefined
                    }
                    style={{
                      cursor: isDeleteMode ? 'default' : 'pointer',
                    }}
                  >
                    {isDeleteMode && (
                      <TableCell
                        className={classes.checkboxCell}
                        padding="checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          size="small"
                          checked={selectedIds.includes(row.id)}
                          onChange={(e) =>
                            handleSelectOne(row.id, e.target.checked)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell className={classes.nameCell}>
                      {row.nameOnCard}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {row.cardType}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {row.cardNumber}
                    </TableCell>
                    <TableCell
                      className={classes.ceCell}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCe(row.id);
                      }}
                    >
                      <Checkbox
                        checked={row.ce}
                        onChange={() => handleToggleCe(row.id)}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Add New Card Modal */}
      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        fullWidth
        className={classes.saveNewCard}
      >
        <DialogContent>
          <CardPaymentForm onSubmit={handleAddCard} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
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
            variant="contained"
            className={classes.submitButton}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientSaveCardTable;
