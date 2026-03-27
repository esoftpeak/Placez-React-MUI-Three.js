import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Theme,
} from '@mui/material';
import Place from '../../api/placez/models/Place';
import { ReduxState } from '../../reducers';
import withModalContext, { WithModalContext } from '../Modals/withModalContext';
import { makeStyles } from '@mui/styles';
import formModalStyles from '../Styles/FormModal.css';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
import { PlacezFixturePlan } from '../../api';
import { UpdateFloorPlan } from '../../reducers/floorPlans';

interface Props extends WithModalContext {
  floorPlan: PlacezFixturePlan;
}

const PlacePickerModal = (modalProps: Props) => {
  const places = useSelector((state: ReduxState) => state.place.places);
  const [selectedPlace, setSelectedPlace] = useState<number>(undefined);

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(modalProps);

  const dispatch = useDispatch();

  const onSelectPlace = (event: SelectChangeEvent<number>) => {
    setSelectedPlace(event.target.value as number);
  };

  const handleSave = () => {
    const modifiedFloorplan = {
      ...modalProps.floorPlan,
      placeId: selectedPlace,
    };
    dispatch(UpdateFloorPlan(modifiedFloorplan));
    modalProps.modalContext.hideModal();
  };

  return (
    <Dialog open={true}>
      <DialogTitle className={classes.dialogTitle}>
        Move Floorplan to other Venue
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <DialogContentText id="alert-dialog-slide-description">
          <FormControl
            style={{
              width: '100%',
            }}
          >
            <InputLabel>Pick Place</InputLabel>
            <Select
              id="placeSelect"
              value={selectedPlace}
              onChange={onSelectPlace}>
                {places.map((place:Place) => {
                  return (
                    <MenuItem
                      value={place.id}>
                      {place.name}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Cancel
        </PlacezActionButton>
        <Button variant="contained" onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(PlacePickerModal);
