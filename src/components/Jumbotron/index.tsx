import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Paper, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

interface Props {
  title: string;
  description?: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
      // backgroundColor: theme.palette.secondary.main,
    },
    titleBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
);

const Jumbotron = (props: PropsWithChildren<Props>) => {
  const { title, description } = props;
  const classes = styles(props);
  return (
    <Paper className={classes.root}>
      <div className={classes.titleBar}>
        <Typography variant="h5">{title}</Typography>
        {props.children}
      </div>
      <Typography variant="h6">{description}</Typography>
    </Paper>
  );
};

export default Jumbotron;
