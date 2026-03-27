import { Asset } from '../../../blue/items/asset';
import {
  DefaultMaterial,
  MaterialCategories,
  PlacezMaterial,
} from '../../../api/placez/models/PlacezMaterial';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import produce from 'immer';
import { useEffect, useMemo, useState } from 'react';
import {
  IconButton,
  Input,
  MenuItem,
  Select,
  FormLabel,
  Tooltip,
} from '@mui/material';
import { Clear, Search, Tune } from '@mui/icons-material';
import MaterialTileV2 from './panels/EditSurfacePanel/MaterialTileV2';
import PlacezSlider from '../../PlacezUIComponents/PlacezSlider';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import findInSearchableFeilds from '../../../sharing/utils/findInSearchableFeilds';

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    },
    searchContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '10px 0',
      padding: '0 10px',
      height: '36px',
    },
    selectField: {
      flex: 1,
      marginRight: '10px',
      maxWidth: '120px',
      marginTop: '1px',
      '& .MuiSelect-select': {
        fontSize: '14px',
      },
    },
    searchField: {
      flex: 1,
      '& .MuiInputBase-input': {
        fontSize: '14px',
      },
    },
    menuItem: {
      minHeight: '20px',
      fontSize: '14px',
      padding: '2px 16px',
    },
    materialsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      padding: '10px',
      maxHeight: '225px',
      overflowY: 'auto',
    },
    materialTile: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    emptyState: {
      padding: '20px',
      textAlign: 'center',
      gridColumn: 'span 3',
      fontSize: '14px',
    },
    tuneButton: {
      marginRight: '10px',
      '&.active': {
        backgroundColor: theme.palette.action.selected,
      },
    },
    fieldGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '14px',
      padding: '7px',
    },
    fieldHeading: {
      margin: theme.spacing(),
      marginTop: theme.spacing(),
      fontSize: '10pt !important',
      color: theme.palette.text.primary,
      flex: '1',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
);

interface Props {
  materialsBak: PlacezMaterial[];
  asset: Asset;
  updateMaterialMask?(materialMask: PlacezMaterial[]): void;
  selectedMaterialIndex: number;
  selectedMaterial: PlacezMaterial;
  setSelectedMaterialIndex: (arg: number) => void;
  setSelectedMaterial: (arg: PlacezMaterial) => void;
}

const MaterialPanel = (props: Props) => {
  const classes = useStyles();

  const {
    selectedMaterialIndex,
    selectedMaterial,
    setSelectedMaterialIndex,
    setSelectedMaterial,
    asset,
    updateMaterialMask,
  } = props;

  const [assetFilter, setAssetFilter] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const materials = useSelector(
    (state: ReduxState) => state.material.materials
  );

  const filteredMaterials = materials.filter((material: PlacezMaterial) =>
    findInSearchableFeilds(material, assetFilter)
  );

  const materialCategories = useMemo(() => {
    return filteredMaterials
      .flatMap((material: PlacezMaterial) => material.tags || [])
      .filter((tag: string) => MaterialCategories.includes(tag))
      .filter((tag, index, self) => self.indexOf(tag) === index);
  }, [filteredMaterials]);

  const groupedMaterials = useMemo(() => {
    const groupedByTag = filteredMaterials.reduce((acc, material) => {
      if (material.tags && Array.isArray(material.tags)) {
        material.tags.forEach((tag) => {
          if (!acc[tag]) {
            acc[tag] = [];
          }
          acc[tag].push(material);
        });
      }
      return acc;
    }, {});
    return groupedByTag;
  }, [filteredMaterials]);

  const [activeMaterial, setActiveMaterial] = useState('');

  useEffect(() => {
    if (
      materialCategories.length > 0 &&
      !materialCategories.includes(activeMaterial)
    ) {
      setActiveMaterial(materialCategories[0]);
    }
  }, [materialCategories, activeMaterial]);

  const selectMaterialIndex = (index: number) => () => {
    if (index === null || asset.materialMask === null) return;

    const selectMaterial = asset.materialMask[index]
      ? asset.materialMask[index]
      : DefaultMaterial;

    setSelectedMaterialIndex(index);
    setSelectedMaterial(selectMaterial);
  };

  useEffect(() => {
    selectMaterialIndex(selectedMaterialIndex)();
  }, [asset, selectedMaterialIndex]);

  const setMaterial = (index: number) => (material: PlacezMaterial) => {
    if (index === null) return;

    const newMask = produce(asset.materialMask, (draft) => {
      draft[index] = material;
    });

    updateMaterialMask(newMask);
  };

  const handleClearSearch = () => {
    setAssetFilter('');
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleMaterialParamChange = (param: string) => (e, v) => {
    let value = v;
    if (param === 'opacity') {
      value = parseFloat((1 - value).toFixed(2));
    }
    setMaterial(selectedMaterialIndex)({
      ...selectedMaterial,
      threeJSMaterial: {
        ...selectedMaterial.threeJSMaterial,
        [param]: value,
      },
    });
  };

  const handleMaterialSizeChange = (e, v) => {
    if (
      !selectedMaterial.threeJSMaterial.textures ||
      selectedMaterial.threeJSMaterial.textures.length === 0
    ) {
      return; // Don't modify if no textures exist
    }
    setMaterial(selectedMaterialIndex)({
      ...selectedMaterial,
      threeJSMaterial: {
        ...selectedMaterial.threeJSMaterial,
        textures: selectedMaterial.threeJSMaterial.textures.map((texture) => {
          const newTexture = { ...texture };
          newTexture.repeat = [v, v];
          return newTexture;
        }),
      },
    });
  };
  if (!selectedMaterial) return null;

  return (
    <div className={classes.container}>
      <div className={classes.searchContainer}>
        <Select
          className={classes.selectField}
          id="materialCategorySelect"
          variant="standard"
          value={activeMaterial}
          onChange={(e) => setActiveMaterial(e.target.value)}
          displayEmpty
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 230,
              },
            },
          }}
        >
          {materialCategories.length === 0 && (
            <MenuItem value="" disabled className={classes.menuItem}>
              No categories available
            </MenuItem>
          )}
          {materialCategories.map((category) => (
            <MenuItem
              key={category}
              value={category}
              className={classes.menuItem}
            >
              {category}
            </MenuItem>
          ))}
        </Select>
        <Tooltip title="Toggle View">
          <IconButton
            color={isEditMode ? 'primary' : 'default'}
            className={`${classes.tuneButton} ${isEditMode ? 'active' : ''}`}
            onClick={handleToggleEditMode}
          >
            <Tune />
          </IconButton>
        </Tooltip>
        <Input
          className={classes.searchField}
          placeholder="Search"
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
          endAdornment={
            assetFilter !== '' ? (
              <IconButton onClick={handleClearSearch} size="small">
                <Clear />
              </IconButton>
            ) : (
              <IconButton size="small">
                <Search />
              </IconButton>
            )
          }
        />
      </div>

      {isEditMode ? (
        <div style={{ padding: '10px' }}>
          <div className={classes.fieldGrid}>
            <FormLabel className={classes.fieldHeading}>
              Pattern Scale
            </FormLabel>
            <PlacezSlider
              min={0}
              max={10}
              step={0.05}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              value={parseFloat(
                (selectedMaterial &&
                selectedMaterial.threeJSMaterial &&
                selectedMaterial.threeJSMaterial.textures &&
                selectedMaterial.threeJSMaterial.textures.length > 0 &&
                selectedMaterial.threeJSMaterial.textures[0].repeat
                  ? selectedMaterial.threeJSMaterial.textures[0].repeat[0]
                  : 1.0
                ).toFixed(2)
              )}
              onChange={handleMaterialSizeChange}
            />
            <FormLabel className={classes.fieldHeading}>Transparency</FormLabel>
            <PlacezSlider
              min={0}
              max={1}
              step={0.05}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              value={parseFloat(
                (
                  1.0 -
                  (selectedMaterial &&
                  selectedMaterial.threeJSMaterial &&
                  selectedMaterial.threeJSMaterial.opacity !== undefined &&
                  selectedMaterial.threeJSMaterial.opacity !== null
                    ? selectedMaterial.threeJSMaterial.opacity
                    : 1.0)
                ).toFixed(2)
              )}
              onChange={handleMaterialParamChange('opacity')}
            />
            <FormLabel className={classes.fieldHeading}>Polish</FormLabel>
            <PlacezSlider
              min={0}
              max={1}
              step={0.05}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              value={parseFloat(
                (selectedMaterial &&
                selectedMaterial.threeJSMaterial &&
                selectedMaterial.threeJSMaterial.metalness !== undefined &&
                selectedMaterial.threeJSMaterial.metalness !== null
                  ? selectedMaterial.threeJSMaterial.metalness
                  : 0.0
                ).toFixed(2)
              )}
              onChange={handleMaterialParamChange('metalness')}
            />
            <FormLabel className={classes.fieldHeading}>Brilliance</FormLabel>
            <PlacezSlider
              min={0}
              max={1}
              step={0.05}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              value={parseFloat(
                (selectedMaterial &&
                selectedMaterial.threeJSMaterial &&
                selectedMaterial.threeJSMaterial.roughness !== undefined &&
                selectedMaterial.threeJSMaterial.roughness !== null
                  ? selectedMaterial.threeJSMaterial.roughness
                  : 1.0
                ).toFixed(2)
              )}
              onChange={handleMaterialParamChange('roughness')}
            />
          </div>
        </div>
      ) : (
        <div className={classes.materialsGrid}>
          {groupedMaterials[activeMaterial]?.map((material) => (
            <div key={material.id} className={classes.materialTile}>
              <MaterialTileV2
                material={material}
                setMaterial={setMaterial(selectedMaterialIndex)}
              />
            </div>
          ))}

          {(!groupedMaterials[activeMaterial] ||
            groupedMaterials[activeMaterial].length === 0) && (
            <div className={classes.emptyState}>
              No materials found in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialPanel;
