import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { LinearProgress } from '@mui/material';

interface Props {
  value: number;
  className: string;
  barColor?: 'primary' | 'secondary';
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      borderRadius: '4px',
    },
    colorPrimary: {
      background: theme.palette.background.default,
    },
    barColorPrimary: {
      background: `linear-gradient(7.16deg,
        ${theme.palette.secondary.main} 0%,
        ${theme.palette.primary.main}  100%)`,
    },
    barColorSecondary: {
      background: `linear-gradient(7.16deg,
        ${theme.palette.secondary.main} 0%,
        ${theme.palette.primary.main}  100%)`,
    },
  })
);

const GradientProgressBar = (props: Props) => {
  const { value, className, barColor } = props;
  const classes = styles(props);
  return (
    <LinearProgress
      className={className}
      classes={{
        root: classes.root,
        colorPrimary: classes.colorPrimary,
        barColorPrimary:
          barColor === 'secondary'
            ? classes.barColorSecondary
            : classes.barColorPrimary,
      }}
      variant="determinate"
      value={value}
    />
  );
};

export default GradientProgressBar;
