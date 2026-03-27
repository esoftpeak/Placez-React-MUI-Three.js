import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Popover,
  Button,
  Tooltip,
  Theme,
  useTheme,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Palette,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    flexWrap: 'wrap',
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    borderRight: `1px solid ${theme.palette.divider}`,
    paddingRight: theme.spacing(1),
    marginRight: theme.spacing(1),
    '&:last-child': {
      borderRight: 'none',
      paddingRight: 0,
      marginRight: 0,
    },
  },
  activeButton: {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
  },
  select: {
    minWidth: 100,
    fontSize: '0.875rem',
  },
  colorButton: {
    minWidth: 'auto',
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.divider}`,
  },
}));

export interface TextFormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

interface TextFormattingToolbarProps {
  value: TextFormattingState;
  onChange: (state: TextFormattingState) => void;
  onClose?: () => void;
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Montserrat', label: 'Montserrat' },
];

const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLElement | null>(null);

  const handleToggle = (property: keyof TextFormattingState) => {
    onChange({
      ...value,
      [property]: !value[property],
    });
  };

  const handleChange = (property: keyof TextFormattingState, newValue: any) => {
    onChange({
      ...value,
      [property]: newValue,
    });
  };

  const handleColorChange = (color: any) => {
    handleChange('color', color.hex);
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  return (
    <Box className={classes.toolbar}>
      {/* Text Style Section */}
      <Box className={classes.section}>
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => handleToggle('bold')}
            className={value.bold ? classes.activeButton : ''}
          >
            <FormatBold />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => handleToggle('italic')}
            className={value.italic ? classes.activeButton : ''}
          >
            <FormatItalic />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => handleToggle('underline')}
            className={value.underline ? classes.activeButton : ''}
          >
            <FormatUnderlined />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Font Family Section */}
      <Box className={classes.section}>
        <FormControl variant="standard" size="small">
          <Select
            value={value.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className={classes.select}
            displayEmpty
          >
            {fontFamilies.map((font) => (
              <MenuItem
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Color Section */}
      <Box className={classes.section}>
        <Tooltip title="Text Color">
          <IconButton
            size="small"
            onClick={handleColorPickerOpen}
            className={classes.colorButton}
            style={{ backgroundColor: value.color }}
          >
            <Palette
              style={{ color: theme.palette.getContrastText(value.color) }}
            />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(colorPickerAnchor)}
          anchorEl={colorPickerAnchor}
          onClose={handleColorPickerClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <ChromePicker
            color={value.color}
            onChange={handleColorChange}
            disableAlpha
          />
        </Popover>
      </Box>

      {/* Alignment Section */}
      <Box className={classes.section}>
        <Tooltip title="Align Left">
          <IconButton
            size="small"
            onClick={() => handleChange('textAlign', 'left')}
            className={value.textAlign === 'left' ? classes.activeButton : ''}
          >
            <FormatAlignLeft />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <IconButton
            size="small"
            onClick={() => handleChange('textAlign', 'center')}
            className={value.textAlign === 'center' ? classes.activeButton : ''}
          >
            <FormatAlignCenter />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <IconButton
            size="small"
            onClick={() => handleChange('textAlign', 'right')}
            className={value.textAlign === 'right' ? classes.activeButton : ''}
          >
            <FormatAlignRight />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Close Button */}
      {onClose && (
        <Box>
          <Button size="small" onClick={onClose} variant="outlined">
            Done
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TextFormattingToolbar;
