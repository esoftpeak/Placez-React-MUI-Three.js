import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Theme,
  Tooltip,
  createStyles,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Close } from '@mui/icons-material';
import { useState } from 'react';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
);

function ChromeAlertDialog() {
  const [open, setOpen] = useState(false);
  const classes = styles();

  // Function to check if browser is not Chromium based
  const isNonChromium = () => {
    const notChrome = !(window as any).chrome;
    return notChrome;
  };

  // If browser is not Chromium based, show the dialog
  if (isNonChromium() && open === undefined) {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const browsers = [
    {
      name: 'Google Chrome',
      icon: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
      link: 'https://www.google.com/chrome/',
    },
    {
      name: 'Microsoft Edge',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Edge_Logo_2019.svg/1280px-Edge_Logo_2019.svg.png',
      link: 'https://www.microsoft.com/edge',
    },
    {
      name: 'Brave',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Brave_lion.png?20200205121454',
      link: 'https://www.brave.com/download/',
    },
    {
      name: 'Opera',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opera_2015_icon.svg/1280px-Opera_2015_icon.svg.png',
      link: 'https://www.opera.com/download',
    },
    // Add more browsers here if needed
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>
        <div className={classes.root}>
          <div>{'Non-Chromium Browser Detected'}</div>
          <IconButton aria-label="close" onClick={handleClose}>
            <Close />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Placez is optimized to work best with Chromium Based web browsers. We
          recommend Google Chrome which can be downloaded by clicking the Chrome
          logo below.
        </DialogContentText>
        <div
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {browsers.map((browser, index) => (
            <Tooltip title={browser.name} placement="top" key={browser.name}>
              <a
                key={index}
                href={browser.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', margin: '20px' }}
              >
                <img
                  src={browser.icon}
                  alt={browser.name}
                  width="50"
                  height="50"
                />
              </a>
            </Tooltip>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChromeAlertDialog;
