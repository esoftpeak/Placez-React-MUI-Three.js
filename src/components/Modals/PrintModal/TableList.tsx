import { Theme, useTheme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import { Attendee } from '../../../api';
import { AttendeeMetadata } from '../../../api/placez/models/Attendee';
import { Utils } from '../../../blue/core/utils';
import { getEntrees } from '../../../reducers/attendee';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import formModalStyles from '../../Styles/FormModal.css'
import { tableStyles } from '../../Tables/tableSyles.css'

interface Props {
  attendees: Attendee[];
  attendeeSettings: { [name: string]: boolean };
  hideBorder?: boolean;
}

const localStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      gridGap: '5px',
      color: '#000000 !important',
      ...theme.PlacezBorderStyles,
    },
    selected: {
      transform: 'scale(1.15)',
    },
    input: {
      width: '150px',
    },
    tableCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '& .k-grid-content': {
        backgroundColor: theme.palette.background.default,
        printColorAdjust: 'economy',
        color: '#000000',
        overflowY: 'hidden',
      },
      '& .k-grid': {
        backgroundColor: theme.palette.background.default,
        printColorAdjust: 'economy',
        border: '0 !important',
        color: '#000000',
      },
      '& .k-grid-header-wrap': {
        border: '0 !important',
      },
      '& .k-grid-header': {
        padding: '0 !important',
        color: '#000000',
        borderBottom: '1px solid #000000',
      },
      '& .k-grid-norecords': {
        // display: 'none',
      },
      '& .k-grid td': {
        padding: 5,
        color: '#000000',
        borderBottom: '1px solid #000000',
        textAlign: 'center',
      },
      '& .k-grid th': {
        padding: 5,
        color: theme.palette.primary.main,
        textAlign: 'center',
      },
    },
    tableCount: {
      alignSelf: 'end',
    },
    tableTitle: {
      alignSelf: 'stretch',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#eeeeee',
    },
    attendee: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      width: '100%',
    },
    attendeeGridItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    entreeGrid: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    entreeCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      margin: '5px',
    },
    entreeName: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  })
);

interface TableInfo {
  guestCount?: number;
  seats?: { [key: string]: Attendee };
  entrees?: { [meal: string]: number };
  id?: string;
  tableInfo?: string;
  tableAttendees?: Attendee[];
}

type TablesInfoList = { [key: string]: TableInfo };


const TableList = (props: Props) => {
  const localClasses = localStyles(props);
  const styles = makeStyles<Theme>(tableStyles);
  const classes = {
    ...styles(props),
    ...localClasses,
  };
  const { attendees, attendeeSettings } = props;

  const tables: TablesInfoList = attendees.reduce(
    (tables: TablesInfoList, attendee: Attendee): TablesInfoList => {
      if (attendee.tableId === undefined) return tables;
      if (tables[attendee.tableId] === undefined)
        tables[attendee.tableId] = {
          id: attendee.tableId,
          tableAttendees: [],
          seats: {},
          guestCount: 0,
        };
      tables[attendee.tableId].tableInfo = attendee.tableInfo;
      tables[attendee.tableId].tableAttendees.push(attendee);
      tables[attendee.tableId].seats[attendee.chairNumber] = attendee;
      tables[attendee.tableId].guestCount++;
      tables[attendee.tableId].entrees = getEntrees(
        tables[attendee.tableId].tableAttendees
      );

      return tables;
    },
    {}
  );
  const theme = useTheme()

  return (
    <div className={classes.root}>
      {Object.values(tables)
        .sort(
          (a: TableInfo, b: TableInfo) =>
            Number(a.tableInfo ?? 1000000) - Number(b.tableInfo ?? 1000000)
        )
        .map((table) => (
          <div className={classes.tableCard}>
            <Grid
              className={classes.gridRoot}
              style={{border: props.hideBorder ? 'none' : theme.PlacezBorderStyles.border }}
              data={orderBy(
                table.tableAttendees.filter(
                  (attendee: Attendee) => attendee.chairNumber !== undefined
                ),
                [{ field: 'chairNumber', dir: 'asc' } as SortDescriptor]
              )}
            >
              {AttendeeMetadata.filter(
                (key) => attendeeSettings[key] && key !== 'tableInfo'
              ).map((metadata) => {
                return (
                  <GridColumn
                    field={metadata}
                    title={Utils.camelToUpperCase(metadata).replace(
                      ' Number',
                      ''
                    )}
                    key={metadata}
                  />
                );
              })}
            </Grid>
          </div>
        ))}
    </div>
  );
};

export default TableList;
