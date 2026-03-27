import { Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.shadow,
  borderBottom: 'none',
  '& .Mui-selected': {
    backgroundColor: `${theme.palette.background.paper} !important`,
    BorderStyle: '0px !important',
  },
  '& .Mui-focusVisible': {
    backgroundColor: `${theme.palette.background.paper} !important`,
    BorderStyle: '0px !important',
    // backgroundColor: '#d1eaff',
  },
  '& .MuiTabScrollButton-root': {
    // color: `${theme.palette.primary.main} !important`,
    // opacity: '1 !important',
    '&.Mui-disabled': {
      width: '0px',
      padding: '0px',
      margin: '0px',
      overflow: 'hidden',
    },
  },
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    // backgroundColor: '#635ee7',
    backgroundColor: 'transparent',
  },
}));
PlacezTabs.defaultProps = {
  color: 'inherit',
};

export default PlacezTabs;
