import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PlacezActionButtonProps extends ButtonProps {
  selected?: boolean;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<PlacezActionButtonProps>(({ theme, selected }) => ({
  ...theme.PlacezBorderStyles,
  backgroundColor: selected
    ? theme.palette.secondary.main
    : theme.palette.background.paper,
  minWidth: '160px',
  '&:hover': {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : theme.palette.action.hover,
  },
}));

const PlacezActionButton = React.forwardRef<
  HTMLButtonElement,
  PlacezActionButtonProps
>((props, ref) => {
  return <StyledButton ref={ref} {...props} />;
});

PlacezActionButton.defaultProps = {
  variant: 'outlined',
  color: 'inherit',
};

export default PlacezActionButton;
