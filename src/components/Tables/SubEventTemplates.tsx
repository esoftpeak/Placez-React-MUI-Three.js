import React, { useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Theme,
  useTheme,
} from '@mui/material';
import PlacezLayoutPlan from '../../api/placez/models/PlacezLayoutPlan';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  table: {
    minWidth: 650,
    borderCollapse: 'collapse',
  },
  tableContainer: {
    boxShadow: 'none',
    marginTop: '20px',
    width: '96% !important', 
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  tableHeader: {
    '& th': {
      fontWeight: 'normal',
      color: theme.palette.text.primary,
      padding: '16px 16px',
      borderBottom: 'none !important',
      backgroundColor: theme.palette.background.paper,
    },
  },
  tableRow: {
    cursor: 'pointer',
    '& td, & th': {
      borderBottom: 'none !important',
    },
  },
  tableHead: {
    padding: '16px 16px',
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: `2px solid ${theme.palette.divider}`,
    fontSize: '12px !important',
    color: theme.palette.text.primary,
    '&:last-child': {
      borderRight: 'none',
    },
  },
  tableCell: {
    padding: '16px 16px',
    borderBottom: 'none !important',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: `2px solid ${theme.palette.divider}`,
    fontWeight: '400',
    color: theme.palette.text.primary,
    '&:last-child': {
      borderRight: 'none',
    },
  },
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    width: '100%',
  },
  emptyStateMessage: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginBottom: '20px',
  },
  createNewButton: {
    backgroundColor: '#5C236F',
    color: 'white',
    '&:hover': {
      backgroundColor: '#4A1C59',
    },
    padding: '8px 20px',
    textTransform: 'uppercase',
    width: '160px',
  },
}));

interface SubEventTemplatesProps {
  templates: PlacezLayoutPlan[];
  selectedTemplate: PlacezLayoutPlan;
  handleRowClick: (template: PlacezLayoutPlan) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
}

const SubEventTemplates = (props: SubEventTemplatesProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { selectedTemplate, handleRowClick, onCreateNew } = props;

  const data = useMemo(() => {
    return props.templates;
  }, [props.templates]);

  const columns = [
    { field: 'name', title: 'Name' },
    { field: 'type', title: 'Type' },
    { field: 'venue', title: 'Venue' },
    { field: 'floorplan', title: 'Floorplan' },
    { field: 'price', title: 'Price' },
  ];

  return (
    <>
      <TableContainer component={Paper} className={classes.tableContainer}>
        {(props?.isLoading || data.length > 0) && (
          <Table className={classes.table} aria-label="event templates table">
            <TableHead>
              <TableRow className={classes.tableHeader}>
                {columns.map((column) => (
                  <TableCell key={column.field} className={classes.tableHead}>
                    {column.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {props?.isLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <TableRow key={`skeleton-${item}`} className={classes.tableRow}>
                      {columns.map((column) => (
                        <TableCell
                          key={`skeleton-${column.field}`}
                          className={classes.tableCell}
                        >
                          <Skeleton animation="wave" width="100%" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {data.map((row) => {
                    const isSelected = selectedTemplate?.id === row.id;

                    const baseRowBg =
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.paper
                        : '#ffffff';

                    const altRowBg =
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : '#f9f9f9';

                    const selectedBg =
                      theme.palette.mode === 'dark'
                        ? 'rgba(92, 35, 111, 0.28)'
                        : '#e4dfe6';

                    return (
                      <TableRow
                        key={row.name} 
                        className={classes.tableRow}
                        onClick={() => handleRowClick(row)}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: isSelected ? selectedBg : altRowBg,
                          },
                          backgroundColor: isSelected ? selectedBg : baseRowBg,
                          '& td': {
                            color: theme.palette.text.primary,
                          },
                        }}
                      >
                        {columns.map((column) => (
                          <TableCell key={column.field} className={classes.tableCell}>
                            {(row as any)[column.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {!props?.isLoading && data.length === 0 && (
        <Box className={classes.emptyStateContainer}>
          <Box className={classes.emptyStateMessage}>
            <Typography variant="body1" gutterBottom>
              It appears that you do not have any templates created.
            </Typography>
            <Typography variant="body1" gutterBottom>
              To create a new template please select the "Create New" button below.
            </Typography>
          </Box>
          <Button
            variant="contained"
            className={classes.createNewButton}
            onClick={onCreateNew}
          >
            Create New
          </Button>
        </Box>
      )}
    </>
  );
};

export default SubEventTemplates;
