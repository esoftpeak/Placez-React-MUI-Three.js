import { Theme, createStyles } from '@mui/material';

const settingStyles = (theme: Theme) =>
  createStyles({
    label: {
      fontSize: 16,
      marginBottom: theme.spacing(),
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      flexWrap: 'wrap',
    },
    formControl: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
    },
    select: {
      width: 200,
    },
    actions: {
      marginTop: theme.spacing(),
      borderTop: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    actionButton: {
      padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
      margin: theme.spacing(),
      borderRadius: theme.shape.borderRadius,
      width: 200,
      height: 40,
    },
  });

export default settingStyles;
