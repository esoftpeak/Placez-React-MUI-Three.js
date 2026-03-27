import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as React from 'react';
import {
  Input,
  FormControl,
  IconButton,
  Tab,
  Tooltip,
  Theme,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Clear, Search } from '@mui/icons-material';
import CategoryAccordion from './CategoryAccordion';

import ConfigureItemForm from './ConfigureItemForm';

// Models
import { PrimaryCategory, SecondaryCategory, Sku } from '../../../../../api';
import { Catalog, CatalogType } from '../../../../../models';
import { Asset, SkuType } from '../../../../../blue/items/asset';
import { AddAssetControls } from '../../../models';

import {
  DeleteCustomAsset,
  SetAssetFilter,
} from '../../../../../reducers/asset';

// Utils
import { ReduxState } from '../../../../../reducers';
import ItemList from './ItemList';
import AssetGroupList from './AssetGroupList';
import { createSelector } from 'reselect';
import panelStyles from '../../../../Styles/panels.css';
import { AssetGroup } from '../../../../../blue/items';
import { saveToLocalStorage } from '../../../../../sharing/utils/localStorageHelper';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../../../Hooks/useLocalStorageState';
import GridSelect from './GridSelect';
import { SetSelectedItems } from '../../../../../reducers/blue';
import PlacezTabs from '../../../../PlacezUIComponents/PlacezTabs';
import { Item } from '../../../../../blue/items/item';
import { ToolState } from '../../../../../models/GlobalState';
import PlacezSelector, {
  BaseSelectOption,
} from '../../../../PlacezUIComponents/PlacezSelector';
import TableConfigModal from '../../../../Modals/TableConfigModal';
import PlacezActionButton from '../../../../PlacezUIComponents/PlacezActionButton';
import { UniversalModalWrapper } from '../../../../Modals/UniversalModalWrapper';
import {
  AreYouSureDelete,
  DeleteFavourites,
} from '../../../../Modals/UniversalModal';

interface Props {
  addAssetControls: AddAssetControls;
  panelTitle?: string;
  catalogType: CatalogType;
}

enum Tabs {
  'Favorites',
  'Groups',
  'Items',
}

const AddItemPanel = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const dispatch = useDispatch();
  const classes = styles(props);
  const theme = useTheme();

  const catalogs = useSelector((state: ReduxState) => state.asset.catalogs);
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const assetFilter = useSelector(
    (state: ReduxState) => state.asset.assetFilter
  );
  const selectedItems = useSelector(
    (state: ReduxState) => state.blue.selectedItems
  );
  const customSkus = useSelector((state: ReduxState) => filterLinens(state));
  const configuredAssets = useSelector(
    (state: ReduxState) => state.blue.configuredAssets
  );
  const assetGroups = useSelector(
    (state: ReduxState) => state.asset.assetGroups
  );

  const [selectedItem, setSelectedItem] = useState<Asset>(undefined);

  const assetBySku = useSelector((state: ReduxState) => state.asset.bySku);

  const [selectedCatalogName, setSelectedCatalogName] = useLocalStorageState(
    LocalStorageKey.SelectedCatalogName,
    'Banquet Library'
  );

  const [filteredSecondaryCategories, setFilteredSecondaryCategories] =
    useState<SecondaryCategory[]>([] as SecondaryCategory[]);

  const [categoriesTree, setCategoriesTree] = useState<PrimaryCategory[]>(
    [] as PrimaryCategory[]
  );

  const [categorySecondSelected, setCategorySecondSelected] =
    useLocalStorageState(LocalStorageKey.CategorySecondSelected, '');
  const [selectedCategories, setFilteredCategories] = useState<
    SecondaryCategory[]
  >([] as SecondaryCategory[]);
  const [allSkus, setAllSkus] = useState<Sku[]>([]);

  const [tableConfigModalOpen, setTableConfigModalOpen] =
    useState<boolean>(false);

  const [tabIndex, setTabIndex] = useState(Tabs.Items);
  const isAvailable = (catalog: Catalog) => catalog.owned;

  useEffect(() => {
    if (catalogs?.length > 0 && assetsBySku) {
      const availableCatalogs = catalogs.filter(isAvailable).sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });

      if (!selectedCatalogName) {
        setSelectedCatalogName(availableCatalogs[0].name);
      }
      const flatSkus = [];
      catalogs.filter(isAvailable).forEach((catalog: Catalog) => {
        catalog.categories.forEach((primaryCategory) => {
          primaryCategory.subCategories.forEach((subCategory) => {
            flatSkus.push(...subCategory.itemSkus);
          });
        });
      });

      setAllSkus(flatSkus);
    }
  }, [catalogs]);

  useEffect(() => {
    if (selectedCatalogName === 'Favorites') return;
    if (selectedCatalogName) {
      saveToLocalStorage('selectedCatalogName', selectedCatalogName);
      updateCategoriesTree();
    }
  }, [selectedCatalogName, catalogs]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    catalogs
      .filter(isAvailable)
      .find((catalog: Catalog) => catalog.name === selectedCatalogName)
      ?.categories?.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      })
      ?.forEach((category) => {
        // attach asset to catalogSku
        category.subCategories.forEach((sub) => {
          sub.itemSkus.forEach((catalogSku) => {
            catalogSku.asset = assetsBySku[catalogSku.sku];
          });
        });

        category.subCategories.forEach((sub) => {
          sub.itemSkus.forEach((catalogSku) => {
            map.set(catalogSku.sku, category.name);
          });
        });
      });

    return map;
  }, [catalogs, assetsBySku]);

  useEffect(() => {
    if (categoriesTree?.length > 0) {
      if (
        !categoriesTree.some((secondaryCategory) => {
          return secondaryCategory.name === categorySecondSelected;
        })
      ) {
        setCategorySecondSelected(categoriesTree[0].name);
      }
      filterCategories();
    }
  }, [categoriesTree]);

  useEffect(() => {
    filterCategories();
    if (categorySecondSelected) {
      saveToLocalStorage('categorySecondSelected', categorySecondSelected);
    }
  }, [categorySecondSelected]);

  const searchSkus = (skus: Sku[], filterString: string): Sku[] => {
    if (filterString === '') return skus;
    const assetFilterLC = assetFilter.toLowerCase();
    const searchResult = skus.filter((itemSku: Sku) => {
      return searchIncludes(itemSku, assetFilterLC);
    });

    return Object.keys(searchResult).map((key) => searchResult[key]);
  };

  const searchIncludes = (itemSku, filterString): boolean => {
    const { asset } = itemSku;
    let matchTags = false;
    let matchName = false;
    let matchTitle = false;
    if (asset?.tags) {
      matchTags =
        asset.tags.filter((tag) => tag.toLowerCase().includes(filterString))
          .length > 0;
    }
    if (matchTags) return true;
    if (asset?.name) {
      matchName = asset.name.toLowerCase().includes(filterString);
    }
    if (matchName) return true;
    if (asset?.labels?.titleLabel) {
      matchTitle = asset.labels.titleLabel.toLowerCase().includes(filterString);
    }
    if (matchTitle) return true;
    return false;
  };

  const filterCategories = () => {
    if (assetFilter === '') {
      setFilteredCategories(
        categoriesTree.find((category: PrimaryCategory) => {
          return category.name === categorySecondSelected;
        })?.subCategories
      );
    }
  };

  const updateCategoriesTree = () => {
    const primaries = [] as PrimaryCategory[];
    if (catalogs.length === 0) return;
    catalogs
      .filter(isAvailable)
      .find((catalog: Catalog) => catalog.name === selectedCatalogName)
      ?.categories?.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      })
      ?.forEach((category) => {
        // attach asset to catalogSku
        category.subCategories.forEach((sub) => {
          sub.itemSkus.forEach((catalogSku) => {
            catalogSku.asset = assetsBySku[catalogSku.sku];
          });
        });
        primaries.push({
          name: category.name,
          subCategories: category.subCategories,
          sortOrder: category.sortOrder,
        });
      });
    setCategoriesTree(primaries);
  };

  const handleDragAsset = (event: any, dragType: string, asset: Asset) => {
    props.addAssetControls.onDragAndDrop(event, asset, dragType);
  };

  const handleDragAssetGroup = (
    event: any,
    dragType: string,
    assetGroup: AssetGroup
  ) => {
    props.addAssetControls.onDragAndDropAssetGroup(event, assetGroup, dragType);
  };

  const setSelectedCatalog = (e, v) => {
    if (selectedCatalogName) {
      setSelectedCatalogName(v);
    } else {
      setSelectedCatalogName(catalogs.filter(isAvailable)[0].name);
    }
  };

  const setCategorySecond = (e, v) => {
    if (categorySecondSelected) {
      setCategorySecondSelected(v.name);
    } else {
      const cat = categoriesTree.filter((category) => {
        return category.name === v;
      });
      if (cat.length > 0) {
        setCategorySecondSelected(cat[0].name);
      } else {
        console.error('############ catlog error');
      }
    }
    selectedItems.forEach((item: Item) => {
      item.setUnselected();
    });
    dispatch(SetSelectedItems([]));
  };

  const handleSelect = (item: Asset) => {
    setSelectedItem(
      configuredAssets[item.sku]
        ? { ...configuredAssets[item.sku] }
        : { ...item }
    );
  };

  const customCatalog = (skus) => {
    const tagItems: { [key: string]: any[] } = {};

    // First map: Assign asset and filter custom SKUs
    const assignedAndFiltered = skus
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((catalogSku: Sku) => {
        if (!('asset' in catalogSku)) {
          (catalogSku as Sku).asset = assetBySku[(catalogSku as Sku).sku];
        }

        let filteredCustomSkus = [];
        filteredCustomSkus = customSkus.filter((customSku) => {
          return (
            customSku.asset.extensionProperties?.progenitorId === catalogSku.sku
          );
        });

        return {
          catalogSku,
          filteredCustomSkus,
        };
      });
    assignedAndFiltered.forEach(({ catalogSku, filteredCustomSkus }) => {
      if (catalogSku?.asset?.skuType) {
        const species = catalogSku.asset.skuType;
        if (!tagItems[species]) {
          tagItems[species] = [];
        }
        tagItems[species].push({ catalogSku, filteredCustomSkus });
      }
    });

    // Second map: Return the appropriate items
    Object.keys(tagItems).forEach((tag) => {
      tagItems[tag] = tagItems[tag].flatMap(
        ({ catalogSku, filteredCustomSkus }) => {
          if (filteredCustomSkus.length > 0) {
            return [...filteredCustomSkus, catalogSku];
          } else {
            return [catalogSku];
          }
        }
      );
    });

    const customSecondaryCategories = Object.keys(tagItems).map(
      (key, index) => {
        return {
          name:
            categoryMap.get(
              tagItems[key][0].asset.extensionProperties.progenitorId
            ) || SkuType[key],
          itemSkus: tagItems[key],
          sortOrder: index,
        };
      }
    );

    return customSecondaryCategories.reduce((acc, item) => {
      const existing = acc.find((g) => g.name === item.name);

      if (existing) {
        existing.itemSkus.push(...item.itemSkus);
      } else {
        acc.push({
          name: item.name,
          itemSkus: [...item.itemSkus],
          sortOrder: item.sortOrder,
        });
      }

      return acc;
    }, []);
  };

  useEffect(() => {
    if (!catalogs || assetFilter === '') return;
    const filteredCatalogs = catalogs
      .filter(isAvailable)
      .find((catalog: Catalog) => catalog.name === selectedCatalogName)
      ?.categories.flatMap((category) => category.subCategories)
      .map((subCategory) => ({
        ...subCategory,
        itemSkus: searchSkus(subCategory.itemSkus, assetFilter),
      }))
      .filter((subCategory) => subCategory.itemSkus.length > 0);

    setFilteredSecondaryCategories(filteredCatalogs);
  }, [selectedCatalogName, assetFilter]);

  const customItems = customCatalog(searchSkus(customSkus, assetFilter)).filter(
    (category) => category?.name !== undefined
  );
  const selectedFavoriteItems = customItems.find(
    (category) => category.name === categorySecondSelected
  );

  const toolState = useSelector(
    (state: ReduxState) => state.globalstate.toolState
  );

  const collapsed =
    selectedItems.length > 0 || toolState === ToolState.AddBatch;

  const catalogOptions: BaseSelectOption[] = catalogs
    .filter(isAvailable)
    .map((cat) => ({
      value: cat.name,
      label: cat.name,
    }));

  const onTableConfigured = (configuredItem: Asset) => {
    setSelectedItem(configuredItem);
    setTableConfigModalOpen(false);
  };

  const handleChangeTabs = (e, tabIndex: number) => {
    setSelectedItem(undefined);
    setTabIndex(tabIndex);
  };

  return (
    <div
      className={classes.root}
      style={{
        flex: collapsed ? 'none' : 1,
        minHeight: '0px !important',
      }}
    >
      <TableConfigModal
        asset={selectedItem}
        tableConfigModalOpen={tableConfigModalOpen}
        onTableConfigured={onTableConfigured}
        onConfigureCancel={() => setTableConfigModalOpen(false)}
        configuredItems={configuredAssets}
      />
      <div className={classes.panelUpper}>
        <PlacezTabs
          variant="fullWidth"
          scrollButtons={true}
          value={tabIndex}
          onChange={handleChangeTabs}
        >
          <Tab
            key={'items'}
            value={Tabs.Items}
            label={'Items'}
            style={{ color: theme.palette.text.primary, fontWeight: '500' }}
          />
          <Tab
            key={'favorites'}
            value={Tabs.Favorites}
            label={'Favorites'}
            style={{ color: theme.palette.text.primary, fontWeight: '500' }}
          />
          <Tab
            key={'groups'}
            value={Tabs.Groups}
            label={'Groups'}
            style={{ color: theme.palette.text.primary, fontWeight: '500' }}
          />
        </PlacezTabs>

        {!collapsed && (
          <FormControl className={classes.controls}>
            <Input
              placeholder="Search Library"
              id="adornment-password"
              value={assetFilter}
              onChange={(event) => {
                dispatch(SetAssetFilter(event.target.value));
              }}
              style={{
                margin: '20px',
              }}
              endAdornment={
                <>
                  {assetFilter !== '' && (
                    <IconButton
                      onClick={(event) => {
                        dispatch(SetAssetFilter(''));
                      }}
                    >
                      <Clear />
                    </IconButton>
                  )}
                  {assetFilter === '' && (
                    <IconButton>
                      <Search />
                    </IconButton>
                  )}
                </>
              }
            />
          </FormControl>
        )}
      </div>

      <div className={classes.panelLower}>
        {tabIndex === Tabs.Favorites && (
          <>
            <GridSelect
              items={customItems}
              selectedItem={categorySecondSelected}
              onSelectItem={(item) => setCategorySecond(undefined, item)}
            />
            {selectedFavoriteItems?.itemSkus && !collapsed && (
              <ItemList
                skus={selectedFavoriteItems.itemSkus}
                onDragAsset={handleDragAsset}
                selectedAsset={selectedItem}
                onSelect={handleSelect}
                cols={3}
              />
            )}
          </>
        )}

        {tabIndex === Tabs.Groups && (
          <AssetGroupList
            assetGroups={assetGroups.filter((assetGroup: AssetGroup) => {
              if (assetFilter === '') return true;
              return assetGroup.name
                .toLowerCase()
                .includes(assetFilter.toLowerCase());
            })}
            onDragAssetGroup={handleDragAssetGroup}
          />
        )}

        {tabIndex === Tabs.Items && (
          <>
            <div style={{ margin: '0px 20px 20px 20px' }}>
              <PlacezSelector
                label="Catalog"
                onChange={(e) => setSelectedCatalogName(e.target.value)}
                options={catalogOptions}
                value={selectedCatalogName}
              />
            </div>
            {assetFilter === '' ? (
              <>
                <GridSelect
                  items={categoriesTree}
                  selectedItem={categorySecondSelected}
                  onSelectItem={(item) => setCategorySecond(undefined, item)}
                />
                {!collapsed && (
                  <div className={classes.accordionList}>
                    {selectedCategories?.length > 0 &&
                      selectedCategories.map((category) => (
                        <CategoryAccordion
                          key={category.name}
                          category={category}
                          onDragAsset={handleDragAsset}
                          onSelect={handleSelect}
                          selectedAsset={selectedItem}
                        />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className={classes.accordionList}>
                {filteredSecondaryCategories?.length > 0 &&
                  filteredSecondaryCategories.map((category) => (
                    <CategoryAccordion
                      key={category.name}
                      category={category}
                      onDragAsset={handleDragAsset}
                      onSelect={handleSelect}
                      selectedAsset={selectedItem}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {!collapsed && (
        <div
          className={classes.panelFooter}
          style={{ display: 'grid', gap: '10px', margin: '10px' }}
        >
          {selectedItem?.custom && (
            <UniversalModalWrapper
              onDelete={() => dispatch(DeleteCustomAsset(selectedItem.id))}
              modalHeader="Are you sure?"
            >
              <Tooltip title="Delete Custom Item">
                <PlacezActionButton>
                  {tabIndex === Tabs.Favorites
                    ? 'Remove Favorite Object'
                    : 'Delete Custom'}
                </PlacezActionButton>
              </Tooltip>
              {tabIndex === Tabs.Favorites
                ? DeleteFavourites
                : AreYouSureDelete('a Custom Item')}
            </UniversalModalWrapper>
          )}
          {selectedItem?.modifiers && selectedItem?.modifiers?.chairMod && (
            <PlacezActionButton onClick={() => setTableConfigModalOpen(true)}>
              Customize Asset
            </PlacezActionButton>
          )}
          <ConfigureItemForm item={selectedItem} />
        </div>
      )}
    </div>
  );
};

const getCustomSkus = (state: ReduxState) => {
  return state.asset.customSkus;
};

const filterLinens = createSelector([getCustomSkus], (customSkus) => {
  return customSkus.filter((sku: Sku) => {
    return SkuType[sku.asset.skuType] !== SkuType.LIN;
  });
});

export default AddItemPanel;
