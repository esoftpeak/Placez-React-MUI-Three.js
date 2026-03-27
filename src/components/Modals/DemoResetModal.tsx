import React, { useState } from 'react';
import { Modal, Box, Button, Checkbox, FormControlLabel, Typography, Grid } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    events: false,
    payments: false,
    clients: false,
    venues: false,
    customItems: false,
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOptions({
      ...selectedOptions,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          backgroundColor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
          Are you sure you want to reset the following data to that before 2026?
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.events}
                  onChange={handleCheckboxChange}
                  name="events"
                  color="primary"
                />
              }
              label="Events & Subevents"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.payments}
                  onChange={handleCheckboxChange}
                  name="payments"
                  color="primary"
                />
              }
              label="Payments"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.clients}
                  onChange={handleCheckboxChange}
                  name="clients"
                  color="primary"
                />
              }
              label="Clients"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.venues}
                  onChange={handleCheckboxChange}
                  name="venues"
                  color="primary"
                />
              }
              label="Venues & Floorplans"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOptions.customItems}
                  onChange={handleCheckboxChange}
                  name="customItems"
                  color="primary"
                />
              }
              label="Custom Items"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <Button variant="outlined" onClick={onClose} color="primary" style={{ color: '#cbbfbf' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            color="primary"
            disabled={Object.values(selectedOptions).every((value) => !value)}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ResetModal;
