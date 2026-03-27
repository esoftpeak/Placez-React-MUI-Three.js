import { Slider } from '@mui/material'
import { styled } from '@mui/material/styles';

// const iOSBoxShadow ='0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const PlacezSlider = styled(Slider)(({ theme }) => ({
  // color: theme.palette.mode === 'dark' ? '#0a84ff' : '#007bff',
  height: 5,
  '& .MuiSlider-thumb': {
    height: 8,
    width: 8,
  //   boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
  //   '&:focus, &:hover, &.Mui-active': {
  //     boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
  //     // Reset on touch devices, it doesn't add specificity
  //     '@media (hover: none)': {
  //       boxShadow: iOSBoxShadow,
  //     },
  //   },
  //   '&:before': {
  //     boxShadow:
  //       '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
  //   },
  },
  // '& .MuiSlider-valueLabel': {
  //   fontSize: 12,
  //   fontWeight: 'normal',
  //   top: -6,
  //   backgroundColor: 'unset',
  //   color: theme.palette.text.primary,
  //   '&::before': {
  //     display: 'none',
  //   },
  //   '& *': {
  //     background: 'transparent',
  //     color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  //   },
  // },
  '& .MuiSlider-track': {
    border: 'none',
    height: 3,
  },
  '& .MuiSlider-rail': {
    height: 3,
  },
}));

export default PlacezSlider;
