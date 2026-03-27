import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Theme } from '@mui/material';
import { useHelp } from './HelpContext'; // Adjust the path as necessary
import { HELP_DETAILS } from './HelpOptions'
import { LocalStorageKey, useLocalStorageSelector, useLocalStorageState } from '../../components/Hooks/useLocalStorageState'
import PlacezActionButton from '../../components/PlacezUIComponents/PlacezActionButton'
import { makeStyles } from '@mui/styles'
import formModalStyles from '../../components/Styles/FormModal.css'

const HelpDialog = (props) => {
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  const { currentHelpOption, setHelpOption } = useHelp();
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorageState(LocalStorageKey.HideHelpIndividaully);
  const hideHelp = useLocalStorageSelector(LocalStorageKey.HideHelp);

  useEffect(() => {
  }, [currentHelpOption, doNotShowAgain]);

  if (!currentHelpOption) {
    return null;
  }

  const handleDoNotShowAgainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const doNotShowList = {
      ...doNotShowAgain,
      [currentHelpOption]: event.target.checked
    };
    setDoNotShowAgain(doNotShowList);
    setHelpOption(null);
  };

  const handleDialogClose = () => {
    setHelpOption(null);
  };



  const { text, url, imageUrl, title } = HELP_DETAILS[currentHelpOption];

  return (
    <Dialog open={currentHelpOption !== null && !doNotShowAgain?.[currentHelpOption] && !hideHelp} onClose={handleDialogClose}>
      <DialogTitle className={classes.dialogTitle}>{title}</DialogTitle>
      <DialogContent>
        <p>{text}</p>
        <img src={imageUrl} alt="Help" style={{ width: '100%', marginTop: '10px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <FormControlLabel
            control={<Checkbox checked={doNotShowAgain?.[currentHelpOption]} onChange={handleDoNotShowAgainChange} />}
            label="Do not show again"
          />
          <a href={url} target="_blank" rel="noopener noreferrer">More Info</a>
        </div>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton onClick={handleDialogClose}>Close</PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;

