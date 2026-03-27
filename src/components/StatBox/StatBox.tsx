import NumberFormat from 'react-number-format';
import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import GradientProgressBar from '../GradientProgressBar/GradientProgressBar';
import { Paper, Typography } from '@mui/material';

interface Props {
  value: number;
  total: number;
  isCurrency: boolean;
  label: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      marginBottom: theme.spacing(3),
      padding: `${theme.spacing()}px
      ${theme.spacing(2)}px
      ${theme.spacing(2)}px
      ${theme.spacing(2)}px`,
      border: `1px solid ${theme.palette.secondary.main}`,
      minWidth: 300,
    },
    value: {
      ...theme.typography.body1,
      fontSize: '27px',
      lineHeight: '37px',
    },
    progressBar: {
      width: '100%',
      height: '44px',
    },
  })
);

const StatBox = (props: Props) => {
  const classes = styles(props);
  const { value, total, isCurrency, label } = props;
  const progressValue = total === 0 ? 0 : (value / total) * 100;
  const averageStyle = label.toLowerCase().indexOf('average') !== -1;
  return (
    <Paper className={classes.root}>
      <div
        style={{
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">{label}</Typography>
        <NumberFormat
          className={classes.value}
          value={value}
          displayType={'text'}
          thousandSeparator={isCurrency ? ',' : ''}
          decimalScale={isCurrency ? 2 : 0}
          prefix={isCurrency ? '$' : null}
        />
      </div>
      <GradientProgressBar
        className={classes.progressBar}
        value={progressValue}
        barColor={averageStyle ? 'secondary' : 'primary'}
      />
    </Paper>
  );
};

export default StatBox;
