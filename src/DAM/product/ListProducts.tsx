import { useEffect, useMemo, useState } from 'react';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { Tooltip, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { MediaAsset, placezApi } from '../../api/';
import {
  Edit as EditIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  Grid,
  GridColumn as Column,
  GridCellProps,
} from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import Jumbotron from '../../components/Jumbotron';
import { tableStyles } from '../../components/Tables/tableSyles.css';
import { SkuType } from '../../blue/items/asset';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';

interface Props {}

const loadingPanel = (
  <div className="k-loading-mask">
    <span className="k-loading-text">Loading...</span>
    <div className="k-loading-image"></div>
    <div className="k-loading-color"></div>
  </div>
);

const ListProducts = (props: Props) => {
  const [DAMProducts, setDAMProducts] = useState([] as MediaAsset[]);
  const [sort, setSort] = useState([]);
  const [filter, setFilter] = useState(undefined);
  const [isFilterable, setIsFilterable] = useState(true);
  const catalogs = useSelector((state: ReduxState) => state.asset.allCatalogs);

  const handleSortChange = (event) => {
    setSort(event.sort);
  };

  const handleFilterChange = (event) => {
    setFilter(event.filter);
  };

  const onFilterClick = () => {
    setIsFilterable(!isFilterable);
  };

  useEffect(() => {
    placezApi.getMediaAssets(true).then((response) => {
      setDAMProducts(response.parsedBody);
    });
  }, []);

  const hashMapCatalogs = useMemo(() => {
    const map = new Map();
    catalogs.map((c) =>
      c.categories.map((e) =>
        e.subCategories.map((su) => {
          return su.itemSkus.map((last) => {
            const existing = map.get(last.sku) || new Map();
            existing.set(c.name);
            map.set(last.sku.trim(), existing);
            return last;
          });
        })
      )
    );
    return map;
  }, [catalogs]);

  const classes = styles(props);

  if (DAMProducts.length === 0) {
    return loadingPanel;
  }

  const withCatelogs = DAMProducts.map((product) => {
    const catalogCodes = hashMapCatalogs.get(product?.sku?.trim());
    return {
      ...product,
      catalogs: catalogCodes?.size ? [...catalogCodes.keys()] : [],
    };
  });

  return (
    <div className={classes.root}>
      <Jumbotron title="Product List">
        <IconButton aria-label="Toggle Filter" onClick={onFilterClick}>
          <FilterIcon color="primary" fontSize="large" />
        </IconButton>
      </Jumbotron>
      <div className={classes.form}>
        <Grid
          className={classes.gridRoot}
          style={{
            height: 'calc(100vh - 200px)',
          }}
          data={process(withCatelogs, {
            sort,
            filter,
          })}
          filterable={true && isFilterable}
          filter={filter}
          onFilterChange={handleFilterChange}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          scrollable="virtual"
        >
          <Column field="id" title="Product Id" />
          <Column field="name" title="Product Name" />
          <Column
            field="resizable"
            title="Resizable"
            filter="boolean"
            cell={ResizableCell}
          />
          <Column field="catalogs" title="Catalogs" cell={CatalogsCell} />
          <Column
            field="resourceSize"
            title="Resource Size"
            cell={ResourceSizeCell}
          />
          <Column field="species" title="Inventory Type" />
          <Column field="skuType" title="Sku Type" cell={SkuTypeCell} />
          <Column
            field="edit"
            title="Edit"
            className={classes.LinkStyle}
            width="80px"
            cell={EditDetailsCell}
            sortable={false}
            filterable={false}
          />
        </Grid>
      </div>
    </div>
  );
};

const ResizableCell = (props: GridCellProps) => {
  const { resizable } = props.dataItem;
  return <td>{resizable ? 'Resizable' : ''}</td>;
};

const SkuTypeCell = (props: GridCellProps) => {
  const { skuType } = props.dataItem;
  return <td>{skuType in SkuType ? SkuType[skuType] : '000 FIX ME'}</td>;
};

const CatalogsCell = (props: GridCellProps) => {
  const { catalogs } = props.dataItem;
  return (
    <Tooltip title={catalogs == null ? '' : catalogs.join(', ')}>
      <td>{`${catalogs == null ? '0' : catalogs.length} catalogs`}</td>
    </Tooltip>
  );
};

const ResourceSizeCell = (props: GridCellProps) => {
  const { resourceSize } = props.dataItem;
  return (
    <td>{`${Math.round((resourceSize / 1024 / 1024) * 100) / 100} mb`}</td>
  );
};

const EditDetailsCell = (props: GridCellProps) => {
  const { id } = props.dataItem;
  return (
    <td>
      <Link to={`/media/${id}`}>
        <EditIcon color="primary" />
      </Link>
    </td>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    ...tableStyles(theme),
    root: {},
    form: {
      padding: theme.spacing(4),
      display: 'flex',
      flexDirection: 'column',
    },
    heading: {
      margin: 0,
      backgroundColor: theme.palette.secondary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    filterButtonContainer: {
      borderLeft: `2px solid ${theme.palette.primary.main}`,
      background: theme.palette.grey[300],
      justifyContent: 'space-between',
    },
  })
);

export default ListProducts;
