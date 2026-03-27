import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, InputBase, useTheme, alpha, styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { SetGlobalFilter } from '../../reducers/settings';
import { ReduxState } from '../../reducers';

interface Props {}

const color = '#808080';
const backgroundColor = '#F5F5F5';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      marginRight: theme.spacing(2),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        // marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(6),
      color,
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
      width: '100%',
    },
    inputInput: {
      color,
      paddingTop: theme.spacing(),
      paddingRight: theme.spacing(),
      paddingBottom: theme.spacing(),
      paddingLeft: theme.spacing(7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: 200,
      },
    },
  })
);

const SearchBar = (props: Props) => {
  const theme = useTheme();
  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '20px',
    border: '1px solid #c867e9ff',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
    },
  }));

  const classes = styles(props);
  const dispatch = useDispatch();

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  return (
    <Tooltip title={''}>
      <Search style={{ margin: '0px' }}>
        <SearchIconWrapper>
          <SearchIcon sx={{ color: '#666666' }} />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search"
          inputProps={{ 'aria-label': 'search' }}
          autoFocus
          value={globalFilter}
          onChange={(event: any) => {
            dispatch(SetGlobalFilter(event.target.value));
          }}
        />
      </Search>
    </Tooltip>
  );
};

export default SearchBar;
