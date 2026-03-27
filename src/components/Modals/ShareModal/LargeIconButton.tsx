import { ReactElement } from 'react';
import classnames from 'classnames';
import { Theme, useTheme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { CircularProgress, Button, Grow } from '@mui/material';
import { LocalStorageKey, useLocalStorageSelector } from '../../Hooks/useLocalStorageState'

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      fontSize: 16,
      fontWeight: 300,
      margin: '20px',
      height: '100%',
    },
    button: {
      borderRadius: 16,
      background: theme.palette.grey[800],
      padding: 16,
      margin: 16,
    },
    progressWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      fontSize: 80,
    },
    progress: {
      position: 'absolute',
      height: 64,
      width: 64,
    },
    disabledButton: {
      color: `${theme.palette.grey[500]} !important`,
    },
    disabledText: {
      color: theme.palette.grey[500],
    },
  })
);

type Props = {
  loading?: boolean;
  color?: string;
  label?: string;
  children?: ReactElement<any>;
  disabled?: boolean;
  onClick?: (event) => void;
};

const LargeIconButton = (props: Props) => {
  const classes = styles(props);
  const theme = useTheme<Theme>();
  const { color, loading, label, children, onClick, disabled } = props;

  const themeType = useLocalStorageSelector(LocalStorageKey.ThemeType)
  return (
    <Grow in={true} timeout={500}>
      <div
        className={
          disabled
            ? classnames(classes.root, classes.disabledText)
            : classes.root
        }
      >
        <Button
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          style={{
            backgroundColor: color ? color : theme.palette.grey[800],
            width: "200px",
            height: "200px",
            color: themeType === 'light' ? theme.palette.primary.main : theme.palette.text.primary
          }}
          classes={{
            root: classes.button,
            disabled: classes.disabledButton,
          }}
          variant="contained"
        >
          <div className={classes.progressWrapper}>
            <div style={{flex: 1, minHeight: '0px'}}></div>
            {loading ? (
              <CircularProgress className={classes.progress} />
            ) : (
              <></>
            )}
            {children}
            <div style={{flex: 1, fontSize: 20, paddingTop: '5px'}}>
              {label ? label : ''}
            </div>
          </div>
        </Button>
      </div>
    </Grow>
  );
};

export default LargeIconButton;
