import React, { useState } from 'react';
import {
  Box,
  TextField,
  TextFieldProps,
  IconButton,
  Popover,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormatColorText } from '@mui/icons-material';
import TextFormattingToolbar, {
  TextFormattingState,
} from './TextFormattingToolbar';

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  flex: '1',
  margin: `${theme.spacing()}px ${theme.spacing()}px`,
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none',
  },
  '& .MuiInputLabel-root': {
    backgroundColor: theme.palette.background.paper,
    padding: '0 4px',
    zIndex: 1,
    '&.MuiInputLabel-shrink': {
      backgroundColor: theme.palette.background.paper,
      padding: '0 4px',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderRadius: '4px',
      '& legend': {
        maxWidth: '100%',
      },
    },
  },
}));

StyledTextField.defaultProps = {
  variant: 'outlined',
};

export interface FormattableTextFieldProps
  extends Omit<TextFieldProps, 'onChange'> {
  value?: string;
  onChange?: (value: string, formatting?: TextFormattingState) => void;
  defaultFormatting?: Partial<TextFormattingState>;
  showFormattingButton?: boolean;
}

const defaultFormattingState: TextFormattingState = {
  bold: false,
  italic: false,
  underline: false,
  fontFamily: 'Arial',
  color: '#000000',
  textAlign: 'left',
};

const FormattableTextField: React.FC<FormattableTextFieldProps> = ({
  value = '',
  onChange,
  defaultFormatting = {},
  showFormattingButton = true,
  ...textFieldProps
}) => {
  const [formattingAnchor, setFormattingAnchor] = useState<HTMLElement | null>(
    null
  );
  const [formatting, setFormatting] = useState<TextFormattingState>({
    ...defaultFormattingState,
    ...defaultFormatting,
  });

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange?.(newValue, formatting);
  };

  const handleFormattingChange = (newFormatting: TextFormattingState) => {
    setFormatting(newFormatting);
    onChange?.(value, newFormatting);
  };

  const handleFormattingOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFormattingAnchor(event.currentTarget);
  };

  const handleFormattingClose = () => {
    setFormattingAnchor(null);
  };

  const getTextStyle = () => ({
    fontWeight: formatting.bold ? 'bold' : 'normal',
    fontStyle: formatting.italic ? 'italic' : 'normal',
    textDecoration: formatting.underline ? 'underline' : 'none',
    fontFamily: formatting.fontFamily,
    color: formatting.color,
    textAlign: formatting.textAlign,
  });

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <StyledTextField
        {...textFieldProps}
        value={value}
        onChange={handleTextChange}
        multiline
        fullWidth
        InputProps={{
          ...textFieldProps.InputProps,
          style: {
            ...getTextStyle(),
            ...textFieldProps.InputProps?.style,
            paddingRight: '40px'
          }
        }}
      />

      {showFormattingButton && (
        <>
          <Tooltip title="Text Formatting">
            <IconButton
              onClick={handleFormattingOpen}
              size="small"
              sx={{
                position: 'absolute',
                top: 6,
                right: 8,  
                zIndex: 10,
                padding: 0.5
              }}
            >
              <FormatColorText />
            </IconButton>
          </Tooltip>

          <Popover
            open={Boolean(formattingAnchor)}
            anchorEl={formattingAnchor}
            onClose={handleFormattingClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <TextFormattingToolbar
              value={formatting}
              onChange={handleFormattingChange}
              onClose={handleFormattingClose}
            />
          </Popover>
        </>
      )}
    </Box>
  );
};

export default FormattableTextField;
