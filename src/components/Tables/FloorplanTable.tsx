import { useEffect, useRef, useState } from 'react';
import { Paper, Theme } from '@mui/material';
// Components
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { orderBy } from '@progress/kendo-data-query';
import { tableStyles } from './tableSyles.css';
import { makeStyles } from '@mui/styles';
import { PlacezFixturePlan, PlacezLayoutPlan } from '../../api';

interface Props {
  onSelect?: (template: PlacezFixturePlan) => void;
  selected?: PlacezLayoutPlan;
  height?: string;
  fixturePlans?: PlacezFixturePlan[];
}

const FloorplanTable = (props: Props) => {
  const styles = makeStyles<Theme>(tableStyles);
  const classes = styles(props);
  const { fixturePlans, selected } = props;

  const grid = useRef();

  const columns = [
    { field: 'name', title: 'Floorplan', className: classes.overflowEllipsis },
    {
      field: 'price',
      title: 'Price',
      className: classes.overflowEllipsis,
      minShow: 400,
      width: 330,
    },
    {
      field: 'priceRate',
      title: 'Price Rate',
      className: classes.overflowEllipsis,
      minShow: 400,
      width: 330,
    },
  ];

  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [sort, setSort] = useState([]);

  useEffect(() => {
    setSort([{ field: 'lastModifiedDate', dir: 'desc' }]);
    grid.current = document.querySelector(`.${CSS.escape(classes.gridRoot)}`);
    // window.addEventListener('resize', checkColumnMaxWidth);
    checkColumnMaxWidth();
    return () => {
      window.removeEventListener('resize', checkColumnMaxWidth);
    };
  }, []);

  const checkColumnMaxWidth = () => {
    if (grid.current) {
      const currentVisibleColumns =
        columns?.filter(
          (item) =>
            !item.minShow || item.minShow <= (grid?.current as any)?.offsetWidth
        ) ?? columns;
      if (currentVisibleColumns.length !== visibleColumns.length) {
        setVisibleColumns(currentVisibleColumns);
      }
    }
  };

  return (
    <Paper>
      <Grid
        style={{ height: props.height }}
        sortable
        sort={sort}
        onSortChange={(e) => {
          setSort(e.sort);
        }}
        className={classes.gridRoot}
        selectedField="selected"
        data={orderBy(
          fixturePlans.map((floorplan) => ({
            ...floorplan,
            selected: floorplan.id === selected?.floorPlanId,
            // lastModifiedDate: new Date(layout?.lastModifiedUtcDateTime).getTime(),
            // address: (place?.line1 || place?.line2 || place?.city || place?.state || place?.postalCode) ? `${place?.line1}, ${place?.city ?? ''}, ${place?.state ?? ''} ${place?.postalCode ?? ''}` : '',
          })),
          sort
        )}
        onRowClick={(e) => {
          props.onSelect?.(e.dataItem);
          // navigate(placeRoutes.edit.path.replace(':id', e.dataItem.id))
          // dispatch(SelectPlace(e.dataItem.id))
        }}
      >
        {visibleColumns.map((column, index) => {
          return (
            <GridColumn
              field={column.field}
              title={column.title}
              key={index}
              className={column.className}
            />
          );
        })}
      </Grid>
    </Paper>
  );
};

export default FloorplanTable;
