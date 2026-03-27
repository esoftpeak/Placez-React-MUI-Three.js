import { useState } from 'react';

import { Theme, useTheme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { makeStyles } from '@mui/styles';
import { Attendee } from '../../../api';
import { AttendeeMetadata } from '../../../api/placez/models/Attendee';
import { Utils } from '../../../blue/core/utils';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { tableStyles } from '../../Tables/tableSyles.css'

interface Props {
  attendees: Attendee[];
  attendeeSettings: { [name: string]: boolean };
}

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
  attendees: Attendee[];
  attendeeSettings: { [name: string]: boolean };
  hideBorder?: boolean;
}

const customWidthSettings = {
  '#': '30px',
  email: '200px',
};

const styles = makeStyles<Theme>(tableStyles);

const AttendeeList = (props: Props) => {
  const classes = styles(props);
  const { attendees, attendeeSettings } = props;
  const [sort, setSort] = useState([
    { field: '#', dir: 'asc' } as SortDescriptor,
  ]);

  const theme = useTheme();

  return (
    <Grid
      className={classes.gridRoot}
      style={{border: props.hideBorder ? 'none' : theme.PlacezBorderStyles.border }}
      sortable={{
        mode: 'multiple',
      }}
      onSortChange={(e) => {
        setSort(e.sort);
      }}
      selectedField="selected"
      data={orderBy(
        attendees.map((attendee: Attendee, index) => {
          return {
            index,
            tableInfo: 'Not Set',
            chairNumber: 'Not Set',
            ...attendee,
          };
        }),
        sort
      )}
    >
      {AttendeeMetadata.filter((key) => attendeeSettings[key])
        .concat('#')
        .sort((a, b) => (a === '#' ? -1 : 1))
        .map((metadata) => {
          return (
            <GridColumn
              field={metadata}
              title={Utils.camelToUpperCase(metadata).replace(' Number', '')}
              key={metadata}
              width={customWidthSettings[metadata] ?? ''}
            />
          );
        })}
    </Grid>
  );
};

export default AttendeeList;
