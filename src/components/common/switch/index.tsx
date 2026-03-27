import { styled, Switch } from '@mui/material';

export const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 36,
  height: 18,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(18px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: `${theme.palette.primary.main}80`,
    borderRadius: 20,
  },
}));
