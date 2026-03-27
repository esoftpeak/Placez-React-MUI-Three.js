import { Theme, useTheme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { makeStyles } from '@mui/styles';
import { Utils } from '../../../blue/core/utils';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { tableStyles } from '../../Tables/tableSyles.css'

// const styles = makeStyles<Theme>((theme: Theme) =>
//   createStyles({
//     root: {
//       display: 'flex',
//       flexDirection: 'column',
//     },
//     attendeeCard: {
//       '& .k-grid-content': {
//         padding: '0px',
//         overflowY: 'hidden',
//         backgroundColor: theme.palette.background.default,
//         printColorAdjust: 'economy',
//       },
//       '& .k-virtual-content': {
//         padding: '0px',
//       },
//       '& .k-grid': {
//         border: '0 !important',
//         color: '#000000',
//         backgroundColor: theme.palette.background.default,
//         printColorAdjust: 'economy',
//       },
//       '& .k-grid-header-wrap': {
//         border: '0 !important',
//       },
//       '& .k-grid-header': {
//         padding: '0 !important',
//         color: '#000000',
//         borderBottom: '1px solid #000000',
//       },
//       '& .k-grid td': {
//         padding: 5,
//         color: '#000000',
//         borderBottom: '1px solid #000000',
//         textAlign: 'center',
//       },
//       '& .k-grid th': {
//         padding: 5,
//         color: theme.palette.primary.main,
//         textAlign: 'center',
//       },
//     },
//   })
// );

interface Props {
  rows;
  guestCount?: number;
  hideBorder?: boolean;
}

const styles = makeStyles<Theme>(tableStyles);

const EntreeList = (props: Props) => {
  const classes = styles(props);
  const { rows, guestCount } = props;
  rows['entrees'] = 0;
  rows['entrees'] = Object.keys(rows).reduce(
    (acc, key) => acc + (key !== 'entree' && key !== 'guests' ? rows[key] : 0),
    0
  );
  rows['guests'] = guestCount;

  const theme = useTheme();

  return (
    <Grid
      className={classes.gridRoot}
      style={{border: props.hideBorder ? 'none' : theme.PlacezBorderStyles.border }}
      selectedField="selected"
      data={[rows]}
      >
      {Object.keys(rows)
        .filter((row) => rows[row] !== undefined)
        .sort((a, b) => (a === 'guests' ? -1 : 1))
        .map((metadata) => {
          return (
            <GridColumn
              field={metadata}
              title={Utils.camelToUpperCase(metadata).replace(' Number', '')}
              key={metadata}
            />
          );
        })}
    </Grid>
  );
};

export default EntreeList;
