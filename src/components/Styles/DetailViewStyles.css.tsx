import { Theme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { layoutConstants } from '../../Constants/layout';

const VenueCardHeight = 90;

const DetailViewStyles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      height: `calc(100vh - ${layoutConstants.appBarHeight}px)`,
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: '0px 40px 40px 40px',
    },
    topIconBar: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: '64px',
    },
    title: {
      ...theme.typography.h5,
      fontSize: 18,
      fontWeight: 'bold',
    },
    venueCard: {
      display: 'grid',
      width: '100%',
      padding: '20px',
      gap: '20px',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      backgroundColor: theme.palette.background.paper,
    },
    venueCardHeader: {
      display: 'flex',
      alignItems: 'center',
      height: VenueCardHeight,
      justifyContent: 'space-between',
      backgroundColor: `${theme.palette.primary.main}33`,
      padding: '28px',
    },
    detailGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 3fr',
      gridGap: '10px',
      marginTop: '10px',
    },
    tabPanel: {
      flex: '1',
      overflow: 'scroll',
      padding: '0px !important',
      paddingRight: '10px !important',
      minHeight: '0px',
    },
    tabPanelActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
    },
    tabButton: {
      paddingBottom: '0px !important',
    },
    tabList: {
      marginBottom: '12px',
    },
    detailColumnHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      direction: 'ltr',
      minHeight: '60px',
      marginRight: '8px',
    },
    gridColumn: {
      height: `calc(100vh - ${layoutConstants.appBarHeight}px - ${2 * VenueCardHeight}px - 80px)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'scroll',
    },
  });

export default DetailViewStyles;
