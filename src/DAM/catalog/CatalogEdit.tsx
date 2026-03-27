import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router';
import { ReduxState } from '../../reducers';
import { AssetCatalog, placezApi } from '../../api';
import { Sku } from '../../api/';
import { FilterList as FilterIcon } from '@mui/icons-material';
import {
  Grid,
  GridColumn as Column,
  GridToolbar,
  GridCellProps,
} from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button, Checkbox, IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Input } from '@progress/kendo-react-inputs';
import Jumbotron from '../../components/Jumbotron';
import { tableStyles } from '../../components/Tables/tableSyles.css';
import { createStyles } from '@mui/material';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    ...(tableStyles(theme) as object),
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
    actions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'left',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    actionButton: {
      padding: `${theme.spacing()}px ${theme.spacing()}px`,
      margin: theme.spacing(),
      borderRadius: theme.shape.borderRadius,
      width: '200px',
      height: 40,
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

interface GridAsset {
  id: string;
  name: string;
  subcategory: boolean;
  sortOrder: number;
}

type Props = {};

const loadingPanel = (
  <div className="k-loading-mask">
    <span className="k-loading-text">Loading...</span>
    <div className="k-loading-image"></div>
    <div className="k-loading-color"></div>
  </div>
);

const CatalogEdit = (props: Props) => {
  const catalogs = useSelector((state: ReduxState) => state.asset.allCatalogs);
  const assets = useSelector((state: ReduxState) => state.asset.bySku);
  const navigate = useNavigate();
  const { cat, pri, sub } = useParams();
  const classes = styles(props);

  const [subcatagorySkuList, setSubcatagorySkuList] = useState<Sku[]>([]);
  const [gridAssets, setGridAssets] = useState<GridAsset[]>([]);
  const [subcategoryReady, setSubcategoryReady] = useState<boolean>(false);
  const [catid, setCatid] = useState<number | null>(null);
  const [priName, setPriName] = useState<number>(0);
  const [subName, setSubName] = useState<number>(0);
  const [isFilterable, setIsFilterable] = useState<boolean>(true);
  const [sort, setSort] = useState<any>([]);
  const [filter, setFilter] = useState(undefined);

  const sortCheckedSet = new Set([]);

  const gridFilterOperators = {
    text: [
      {
        text: 'grid.filterContainsOperator',
        operator: 'contains',
      },
    ],
  };

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
    if (typeof catid === 'number') {
      const catalog = catalogs[catid] as AssetCatalog;
      placezApi.getAssetCatalogById(catalog.id).then((res) => {
        setSubcatagorySkuList(
          res.parsedBody.categories
            .find((c) => c.name === pri)
            .subCategories.find((e) => e.name === sub).itemSkus || []
        );
      });
    }
  }, [catid]);

  useEffect(() => {
    initGridAssets();
  }, [assets, subcatagorySkuList, catid, priName, subName, subcategoryReady]);

  const getSubCatSkus = () => {
    const subcatagorySkuList = catalogs
      .find((catalog, i) => {
        if (catalog.catalogCode === cat) {
          setCatid(i);
          return true;
        }
        return false;
      })
      ?.categories?.find((primaryCat, j) => {
        if (primaryCat.name === pri) {
          setPriName(j);
          return true;
        }
        return false;
      })
      ?.subCategories?.find((subCat, k) => {
        if (subCat.name === sub) {
          setSubName(k);
          return true;
        }
        return false;
      })?.itemSkus;
    setSubcatagorySkuList(subcatagorySkuList);
    setSubcategoryReady(true);
  };

  const handleCheckChange = (event) => {
    const { checked, name } = event.currentTarget;
    const currentsku = name.slice(4);

    if (checked) {
      if (!getChecked(currentsku)) {
        sortCheckedSet.add(currentsku);

        setSubcatagorySkuList(
          subcatagorySkuList.concat([{ sku: currentsku, sortOrder: 0 }])
        );
      }
    } else {
      const catsku = subcatagorySkuList.find((sku) => {
        return sku.sku === currentsku;
      });
      if (catsku) {
        sortCheckedSet.delete(catsku.sku);
        setSubcatagorySkuList(
          subcatagorySkuList.filter((el) => {
            return el.sku !== currentsku;
          })
        );
      }
    }
  };

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const currentsku = name.slice(4);
    let tempSubcatagorySkuList = [] as Sku[];
    const catsku = subcatagorySkuList.find((sku) => {
      return sku.sku === currentsku;
    });
    if (catsku) {
      tempSubcatagorySkuList = subcatagorySkuList.filter((el) => {
        return el.sku !== currentsku;
      });

      tempSubcatagorySkuList.push({
        sku: currentsku,
        sortOrder: parseInt(value, 10),
      });
    } else {
      tempSubcatagorySkuList = subcatagorySkuList;
      tempSubcatagorySkuList.push({
        sku: currentsku,
        sortOrder: parseInt(value, 10),
      });
    }
    setSubcatagorySkuList(tempSubcatagorySkuList);
  };

  const getSort = (currentsku) => {
    // TODO: need a debounce

    const catsku = subcatagorySkuList?.find((sku) => {
      return sku.sku === currentsku;
    });

    if (catsku) {
      sortCheckedSet.add(catsku.sku);
      return catsku.sortOrder;
    }

    return 0;
  };

  const getChecked = (currentsku) => {
    const catsku = subcatagorySkuList?.find((sku) => {
      return sku.sku === currentsku;
    });

    if (catsku) {
      return true;
    }

    return false;
  };

  const handleCreate = () => {
    const currentCatalog = catalogs[catid] as AssetCatalog;
    currentCatalog.categories[priName].subCategories[subName].itemSkus =
      subcatagorySkuList;

    placezApi
      .postAssetCatalog(currentCatalog)
      .then((response) => {
        alert('Catalog updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating catalog:', error);
        alert('Error updating catalog. Please try again.');
      });
  };

  const handleCancel = (e) => {
    navigate(-1);
  };

  const viewAssignedCell = (props) => (
    <ViewAssignedCell
      {...props}
      subcatagorySkuList={subcatagorySkuList}
      handleCheckChange={handleCheckChange}
    />
  );
  const viewInputCell = (props) => (
    <ViewInputCell
      {...props}
      subcatagorySkuList={subcatagorySkuList}
      handleInputChange={handleInputChange}
    />
  );

  const initGridAssets = () => {
    const gridAssets = [] as GridAsset[];
    for (const assetId in assets) {
      const asset = assets[assetId];
      gridAssets.push({
        id: asset.id,
        name: asset.name,
        subcategory: getChecked(asset.id),
        sortOrder: getSort(asset.id),
        sku: asset.sku,
      } as GridAsset);
    }
    setGridAssets(gridAssets);
  };

  useEffect(() => {
    getSubCatSkus();
  }, [catalogs]);

  useEffect(() => {
    if (catalogs.length > 0) {
      getSubCatSkus();
    }
  }, []);

  if (!subcategoryReady) {
    return loadingPanel;
  }

  const data = process(gridAssets, {
    sort,
    filter,
  });

  return (
    <div className={classes.root}>
      <Jumbotron title="Edit Catalog">
        <IconButton aria-label="Toggle Filter" onClick={onFilterClick}>
          <FilterIcon color="primary" fontSize="large" />
        </IconButton>
      </Jumbotron>
      <div className={classes.form}>
        <Grid
          className={`${classes.gridRoot} ${classes.gridContainer}`}
          data={data}
          filterable={isFilterable}
          filter={filter}
          filterOperators={gridFilterOperators}
          onFilterChange={handleFilterChange}
          sortable={{
            mode: 'multiple',
          }}
          sort={sort}
          onSortChange={handleSortChange}
        >
          <GridToolbar>
            <div className={classes.actions}>
              <Button
                onClick={handleCreate}
                className={classes.actionButton}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
              <Button
                onClick={handleCancel}
                className={classes.actionButton}
                variant="contained"
              >
                Cancel
              </Button>
            </div>
          </GridToolbar>
          <Column field="id" title="ID" />
          <Column field="name" title="Asset Name" />
          <Column
            field="subcategory"
            title="Subcategory"
            filter="boolean"
            cell={viewAssignedCell}
          />
          <Column field="sortOrder" title="Sort Order" cell={viewInputCell} />
        </Grid>
      </div>
    </div>
  );
};

interface ViewAssignedCellProps extends GridCellProps {
  handleCheckChange;
  subcatagorySkuList;
}

const ViewAssignedCell = (props: ViewAssignedCellProps) => {
  const { handleCheckChange, dataItem, subcatagorySkuList } = props;
  const isChecked = !!subcatagorySkuList?.find(
    (sku) => dataItem.sku == sku.sku
  );
  return (
    <td>
      <Checkbox
        name={`txt-${dataItem.sku}`}
        checked={isChecked}
        onChange={handleCheckChange}
      />
    </td>
  );
};

interface ViewInputCellProps extends GridCellProps {
  handleInputChange;
  subcatagorySkuList;
}
const ViewInputCell = (props: ViewInputCellProps) => {
  const { handleInputChange, subcatagorySkuList, dataItem } = props;
  const value = subcatagorySkuList?.find((sku) => dataItem.sku == sku.sku);
  return (
    <td>
      <Input
        type="number"
        name={`txt-${dataItem.sku}`}
        defaultValue={value?.sortOrder}
        onChange={handleInputChange}
        onFocus={(event) => {
          event.target.select();
        }}
      />
    </td>
  );
};

export default CatalogEdit;
