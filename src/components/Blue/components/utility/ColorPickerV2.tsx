import { useState, useEffect } from 'react';
import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { makeStyles } from '@mui/styles';

interface Props {
  colors: string[];
  color: string;
  onChange: (e) => void;
  allowInput?: boolean;
  width?: string;
  allowClear?: boolean;
}

const swatchSize = '45px';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxHeight: '230px',
      overflowY: 'auto',
      boxSizing: 'border-box',
      paddingBottom: '20px',
    },
    swatch: {
      width: swatchSize,
      height: swatchSize,
      borderRadius: '50%',
      cursor: 'pointer',
      border: '1px solid #e0e0e0',
      transition: 'transform 0.2s ease',
      margin: '4px',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    selected: {
      transform: 'scale(1.15)',
      boxShadow: '0 0 5px rgba(0,0,0,0.3)',
      border: '2px solid #fff',
    },
    input: {
      width: '100%',
      marginTop: '5px',
    },
    clearButton: {
      marginTop: '5px',
      width: '100%',
    },
  })
);

const ColorPickerV2 = (props: Props) => {
  const classes = styles(props);
  const { color, colors, onChange, allowClear } = props;
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

  return (
    <div className={classes.root} style={{ width: props.width || '100%' }}>
      {colors.map((color) => (
        <div
          className={`${classes.swatch} ${color === selectedColor ? classes.selected : ''}`}
          onClick={() => setColor(color)}
          key={color}
          style={{ backgroundColor: color }}
        ></div>
      ))}
    </div>
  );
};

export default ColorPickerV2;
