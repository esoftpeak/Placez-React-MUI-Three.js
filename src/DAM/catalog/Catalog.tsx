import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { IconButton, Theme } from '@mui/material';
import { createStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
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
import { makeStyles } from '@mui/styles';
import Jumbotron from '../../components/Jumbotron';
import { tableStyles } from '../../components/Tables/tableSyles.css';

interface Props {}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    ...tableStyles(theme),
    root: {},
    form: {
      padding: theme.spacing(4),
      display: 'flex',
      flexDirection: 'column',
    },
    gridContainer: {
      height: '600px',
      width: '100%',
      '& .k-grid': {
        height: '100%',
        border: 'none',
      },
      '& .k-grid-content': {
        overflow: 'auto',
      },
      [theme.breakpoints.down('sm')]: {
        height: 'calc(100vh - 200px) !important',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        height: 'calc(100vh - 180px) !important',
      },
      [theme.breakpoints.up('md')]: {
        height: 'calc(100vh - 200px) !important',
      },
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

interface SubCatItem {
  catalogId: string;
  catalogCode: string;
  catalogName: string;
  PrimaryName: string;
  SubCategoryName: string;
}

const loadingPanel = (
  <div className="k-loading-mask">
    <span className="k-loading-text">Loading...</span>
    <div className="k-loading-image"></div>
    <div className="k-loading-color"></div>
  </div>
);

const gridFilterOperators = {
  text: [
    {
      text: 'grid.filterContainsOperator',
      operator: 'contains',
    }
  ]
}

const Catalog = (props: Props) => {
  const classes = styles(props);

  const [subcatagoryList, setSubcatagoryList] = useState<SubCatItem[]>([]);
  const [sort, setSort] = useState<any>([]);
  const [filter, setFilter] = useState<any>(undefined);
  const [isFilterable, setIsFilterable] = useState<boolean>(true);

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
    init();
  }, [catalogs]);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const subcatagoryList = [] as SubCatItem[];
    catalogs.forEach((catalog) => {
      catalog.categories.forEach((primaryCat) => {
        primaryCat.subCategories.forEach((subCat) => {
          subcatagoryList.push({
            catalogId: catalog.catalogCode,
            catalogCode: catalog.catalogCode,
            catalogName: catalog.name,
            PrimaryName: primaryCat.name,
            SubCategoryName: subCat.name,
          });
        });
      });
    });
    setSubcatagoryList(subcatagoryList);
  };

  const processedData = process(subcatagoryList, {
    sort: sort,
    filter: filter
  });

  if (subcatagoryList.length === 0) {
    return loadingPanel;
  }

  return (
    <div className={classes.root}>
      <Jumbotron title="Catalog">
        <IconButton
          color="primary"
          aria-label="Toggle Filter"
          onClick={onFilterClick}
        >
          <FilterIcon fontSize="large" />
        </IconButton>
      </Jumbotron>
      <div className={classes.form}>
        <Grid
          className={`${classes.gridRoot} ${classes.gridContainer}`}
          data={processedData}
          filterable={isFilterable}
          filter={filter}
          onFilterChange={handleFilterChange}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          scrollable="scrollable"
          filterOperators={gridFilterOperators}
        >
          <Column field="catalogName" title="Catalog Name" />
          <Column field="PrimaryName" title="Primary Name" />
          <Column field="SubCategoryName" title="SubCategory Name" />
          <Column
            field="edit"
            title="Edit"
            className={classes.LinkStyle}
            width="100px"
            cell={EditDetailsCell}
            sortable={false}
            filterable={false}
          />
          {/*
          skus.filter(asset =>
            asset.vendor === "Ashley Furniture")
          .map((asset: any) =>
          <div>
            {this.setupSku(asset.id)}
          </div>)
          */}
        </Grid>
      </div>
    </div>
  );
};

const EditDetailsCell = (props: GridCellProps) => {
  const { catalogId, PrimaryName, SubCategoryName } = props.dataItem;
  return (
    <td>
      <Link
        to={`/catalog/edit/${catalogId}/${PrimaryName}/${SubCategoryName}/`}
      >
        <EditIcon color="primary" />
      </Link>
    </td>
  );
};

export default Catalog;
