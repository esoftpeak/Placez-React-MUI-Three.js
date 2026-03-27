import { InputAdornment, Popover, Theme } from '@mui/material';
import { useState } from 'react';
import ColorPicker from './ColorPicker';
import { createStyles, makeStyles } from '@mui/styles';
import PlacezTextField, { IconTextField } from '../../../PlacezUIComponents/PlacezTextField'

type ColorSelectProps = {
  color: string;
  label: string;
  onChange: (e) => void;
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    swatch: {
      backgroundColor: 'yellow',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      boxShadow: 'inset -5px -5px 4px rgba(0,0,0,.5)',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
  })
);

const HexInput = (props: ColorSelectProps) => {
  const classes = styles(props);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const color = props.color.substring(0, 7);
  const opacity = props.color.substring(7, 9) !== '' ? props.color.substring(7, 9) : 'ff';

  //convert two digit hex to percentage
  const convertHexToPercentage = (hex: string): string => {
    const percentage = Math.round((parseInt(hex, 16) / 255) * 100);
    return percentage.toString()
  }
  const convertPercentageToHex = (percentage: string): string => {
    if (percentage === '') return '00';

    const hex = Math.round(parseInt(percentage) / 100 * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  return (
    <>
      <IconTextField
        icon={
          <div
            className={classes.swatch}
            aria-describedby={id}
            onClick={handleClick}
            style={{ backgroundColor: props.color }}
          ></div>
        }
        autoFocus
        label={props.label}
        value={color}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(e) => props.onChange( `${e.target.value}${opacity}`)} // Handle opacity change
        onKeyDown={(e) => e.stopPropagation()}
        inputProps={{
          maxLength: 7,
        }}/>
      <div style={{display: 'flex', alignItems: 'flex-end'}}>
        <PlacezTextField
          id="title"
          autoFocus
          value={convertHexToPercentage(opacity)}
          type='number'
          onChange={(e) => props.onChange( `${color}${convertPercentageToHex(e.target.value)}`)} // Handle opacity change
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                %
              </InputAdornment>
            ),
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>




      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <ColorPicker
          color={props.color}
          colors={[
            '#FF6900',
            '#FCB900',
            '#00D084',
            '#0693E3',
            '#ABB8C3',
            '#EB144C',
            '#F78DA7',
            '#9900EF',
            '#ffffff',
            '#000000',
          ]}
          allowInput={false}
          // className={classes.picker}
          onChange={(e) => props.onChange( `${e.hex}${opacity}`)} // Handle opacity change
        />
      </Popover>
    </>
  );
};

export default HexInput;
