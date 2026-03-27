import { Popover, Theme } from '@mui/material';
import { useState } from 'react';
import ColorPicker from './ColorPicker';
import { createStyles, makeStyles } from '@mui/styles';

type ColorSelectProps = {
  color: string;
  onChange: (e) => void;
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    swatch: {
      backgroundColor: 'yellow',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      boxShadow: 'inset -5px -5px 4px rgba(0,0,0,.5)',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
  })
);

const ColorSelect = (props: ColorSelectProps) => {
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

  return (
    <>
      <div
        className={classes.swatch}
        aria-describedby={id}
        onClick={handleClick}
        style={{ backgroundColor: props.color }}
      ></div>
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
          allowInput={true}
          // className={classes.picker}
          onChange={(e) => props.onChange(e.hex)}
        />
      </Popover>
    </>
  );
};

export default ColorSelect;
