import { createStyles, makeStyles } from '@mui/styles';

import { CircularProgress, Theme } from '@mui/material';

interface Props {
  message?: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      ...theme.typography.h4,
      color: theme.palette.text.primary,
      background: theme.palette.background.default,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    progress: {
      margin: theme.spacing(),
    },
  })
);

const Loading = (props: Props) => {
  const { message } = props;
  const classes = styles(props);

  return (
    <div className={classes.root}>
      <CircularProgress className={classes.progress} />
      {message || 'Loading'}...
    </div>
  );
};

export default Loading;
