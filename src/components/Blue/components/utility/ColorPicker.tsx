import { useState, useEffect } from 'react';
import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { Button, InputAdornment } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PlacezTextField from '../../../PlacezUIComponents/PlacezTextField';

interface Props {
  colors: string[];
  color: string;
  onChange: (e) => void;
  allowInput?: boolean;
  width?: string;
  allowClear?: boolean;
}

const swatchSize = '35px';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      padding: theme.spacing(2),
      maxWidth: (props: Props) => (props.width ? props.width : 'auto'),
      gridTemplateColumns: (props: Props) =>
        props.width
          ? `repeat(auto-fill, ${swatchSize})`
          : `repeat(7, ${swatchSize})`,
      gridAutoRows: swatchSize,
      gridGap: '5px',
      margin: '10px',
    },
    swatch: {
      backgroundColor: 'yellow',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      boxShadow: 'inset -5px -5px 4px rgba(0,0,0,.5)',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    selected: {
      transform: 'scale(1.15)',
    },
    input: {
      gridColumn: '4/-1',
    },
  })
);

const ColorPicker = (props: Props) => {
  const classes = styles(props);

  const { color, colors, onChange, allowInput, allowClear } = props;

  const [selectedColor, setColor] = useState(color);

  const inputPattern = new RegExp('|#[0-9a-fA-F]+');

  useEffect(() => {
    if (
      inputPattern.test(selectedColor) &&
      selectedColor.length === 7 &&
      selectedColor !== color
    ) {
      onChange({ hex: selectedColor });
    } else if (selectedColor === '' && allowClear) {
      onChange({ hex: selectedColor });
    }
  }, [selectedColor]);

  useEffect(() => {
    if (color !== selectedColor) {
      setColor(color);
    }
  }, [color]);

  const handleColorInput = (e) => {
    if (inputPattern.test(e.target.value)) {
      setColor(e.target.value);
    }
  };

  return (
    <div className={classes.root}>
      {colors.map((color) => (
        <div
          className={`${classes.swatch} ${color === selectedColor ? classes.selected : ''}`}
          onClick={() => setColor(color)}
          key={color}
          style={{ backgroundColor: color }}
        ></div>
      ))}
      {allowInput && (
        <div className={classes.input}>
          <PlacezTextField
            placeholder="color"
            type="text"
            value={selectedColor}
            onChange={handleColorInput}
            inputProps={{
              startAdornment: (
                <InputAdornment position="start">#</InputAdornment>
              ),
            }}
          />
        </div>
      )}
      {allowClear && (
        <Button
          className={classes.pickerButton}
          style={{ gridColumn: '1/-1', gridRow: '3' }}
          onClick={() => setColor('')}
        >
          Clear Color
        </Button>
      )}
    </div>
  );
};

export default ColorPicker;
