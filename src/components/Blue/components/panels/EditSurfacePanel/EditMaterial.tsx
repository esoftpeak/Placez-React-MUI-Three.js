import { useState } from 'react';
import { useSelector } from 'react-redux';
import findInSearchableFeilds from '../../../../../sharing/utils/findInSearchableFeilds';

import {
  Theme,
  IconButton,
  Input,
  FormLabel,
  Button,
  Tab,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Clear, Search } from '@mui/icons-material';

import { useTheme } from '@mui/styles';

import panelStyles from '../../../../Styles/panels.css';
import {
  PlacezMaterial,
  MaterialCategories,
  GetImgUrlForMap,
  DefaultWallMaterial,
  PlacedMaterial,
} from '../../../../../api/placez/models/PlacezMaterial';
import { Utils } from '../../../../../blue/core/utils';
import { ReduxState } from '../../../../../reducers';
import AdvancedColorPicker from '../../utility/AdvancedColorPicker';
import MaterialAccordion from './MaterialAccordion';
import PlacezSlider from '../../../../PlacezUIComponents/PlacezSlider';
import PlacezTabs from '../../../../PlacezUIComponents/PlacezTabs';

const checkColor = (color, theme): string => {
  const luminance = Utils.calculateLuminance(color);

  if (luminance < 0.3) {
    return 'white';
  } else if (luminance > 0.7) {
    return 'black';
  }
  return theme.palette.text.primary;
};

interface Props {
  setMaterial: (material) => void;
  material: PlacedMaterial;
  defaultMaterial?: PlacezMaterial;
  noTransparent?: boolean;
  selectedMaterialIndicator?: boolean;
}

export default function EditMaterial(props: Props) {
  const theme: Theme = useTheme();

  const styles = makeStyles<Theme>(panelStyles);

  const [toggles, setToggles] = useState({
    advancedSettings: false,
    showAllColors: false,
  });
  const [assetFilter, setAssetFilter] = useState('');

  const { advancedSettings, showAllColors } = toggles;

  const materials = useSelector(
    (state: ReduxState) => state.material.materials
  );
  const materialsById = useSelector((state: ReduxState) => state.material.byId);

  const handleMaterialColorChange = (e) => {
    props.setMaterial({
      ...props.material,
      threeJSMaterial: {
        ...props.material.threeJSMaterial,
        color: Utils.hexColorToDec(e.hex),
      },
    });
  };

  const handleMaterialParamChange = (param: string) => (e, v) => {
    let value = v;
    if (param === 'opacity') {
      value = parseFloat((1 - value).toFixed(2));
    }
    props.setMaterial({
      ...props.material,
      threeJSMaterial: {
        ...props.material.threeJSMaterial,
        [param]: value,
      },
    });
  };

  const handleMaterialSizeChange = (e, v) => {
    props.setMaterial({
      ...props.material,
      threeJSMaterial: {
        ...props.material.threeJSMaterial,
        textures:
          props.material.threeJSMaterial.textures &&
          props.material.threeJSMaterial.textures.length > 0
            ? props.material.threeJSMaterial.textures.map((texture) => {
                const newTexture = { ...texture };
                newTexture.repeat = [v, v];
                return newTexture;
              })
            : [{ repeat: [v, v] }],
      },
    });
  };

  const defaultMaterial = () => {
    props.setMaterial({
      ...props.material,
      appliedMaterialId: DefaultWallMaterial.appliedMaterialId,
      threeJSMaterial: DefaultWallMaterial.threeJSMaterial,
    });
  };

  const clearTexture = () => {
    props.setMaterial({
      ...props.material,
      id: null,
    });
  };

  const onSwitch = (prop) => (e) => {
    setToggles({
      ...toggles,
      [prop]: e.target.checked,
    });
  };

  const classes = styles(props);

  const { material } = props;
  const filteredMaterials = materials.filter((material: PlacezMaterial) => {
    const found = findInSearchableFeilds(material, assetFilter);
    return found;
  });

  let materialTextureUrl = '';
  if (material?.appliedMaterialId) {
    const foundMaterial = materialsById[material.appliedMaterialId];
    const textureImage = GetImgUrlForMap(foundMaterial, 'map');
    materialTextureUrl = `url(${textureImage})`;
  }

  const backgroundColor = material?.threeJSMaterial?.color
    ? `${Utils.decColorToHex(material.threeJSMaterial.color)}`
    : '';

  const [selectedTab, setSelectedTab] = useState('color');

  return (
    <>
      {material && (
        <div className={classes.panelUpper}>
          <div className={classes.buttonDiv}>
            <Button
              onClick={defaultMaterial}
              className={classes.button}
              variant="outlined"
            >
              Reset
            </Button>
          </div>
        </div>
      )}
      <PlacezTabs
        variant="fullWidth"
        value={selectedTab}
        onChange={(e, v) => setSelectedTab(v)}
        scrollButtons={false}
      >
        <Tab key={'color'} value={'color'} label={'Color'} />
        <Tab key={'material'} value={'material'} label={'Material'} />
      </PlacezTabs>
      {material && (
        <>
          <div className={classes.panelLower}>
            {selectedTab === 'color' && (
              <>
                <AdvancedColorPicker
                  advanced={true}
                  width={'240px'}
                  color={
                    material && material.threeJSMaterial
                      ? Utils.decColorToHex(material.threeJSMaterial.color)
                      : '#ffffff'
                  }
                  onChange={handleMaterialColorChange}
                />
                <div className={classes.fieldGrid}>
                  {!props.noTransparent && (
                    <>
                      <FormLabel className={classes.fieldHeading}>
                        Transparency
                      </FormLabel>
                      <PlacezSlider
                        min={0}
                        max={1}
                        step={0.05}
                        aria-labelledby="discrete-slider"
                        valueLabelDisplay="auto"
                        value={parseFloat(
                          (
                            1.0 -
                            (material &&
                            material.threeJSMaterial &&
                            material.threeJSMaterial.opacity !== undefined &&
                            material.threeJSMaterial.opacity !== null
                              ? material.threeJSMaterial.opacity
                              : 1.0)
                          ).toFixed(2)
                        )}
                        onChange={handleMaterialParamChange('opacity')}
                      />
                    </>
                  )}
                  <FormLabel className={classes.fieldHeading}>
                    Brilliance
                  </FormLabel>
                  <PlacezSlider
                    min={0}
                    max={1}
                    step={0.05}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    value={parseFloat(
                      (material &&
                      material.threeJSMaterial &&
                      material.threeJSMaterial.metalness !== undefined &&
                      material.threeJSMaterial.metalness !== null
                        ? material.threeJSMaterial.metalness
                        : 0.0
                      ).toFixed(2)
                    )}
                    onChange={handleMaterialParamChange('metalness')}
                  />
                  <FormLabel className={classes.fieldHeading}>
                    Polish
                  </FormLabel>
                  <PlacezSlider
                    min={0}
                    max={1}
                    step={0.05}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    value={parseFloat(
                      (material &&
                      material.threeJSMaterial &&
                      material.threeJSMaterial.roughness !== undefined &&
                      material.threeJSMaterial.roughness !== null
                        ? material.threeJSMaterial.roughness
                        : 1.0
                      ).toFixed(2)
                    )}
                    onChange={handleMaterialParamChange('roughness')}
                  />
                </div>
              </>
            )}

            {selectedTab === 'material' && (
              <>
                <Box className={classes.fieldGrid} sx={{ mt: 2 }}>
                  <FormLabel className={classes.fieldHeading}>Size</FormLabel>
                  <PlacezSlider
                    min={0.1}
                    max={2}
                    step={0.05}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    value={parseFloat(
                      (material &&
                      material.threeJSMaterial &&
                      material.threeJSMaterial.textures &&
                      material.threeJSMaterial.textures[0]
                        ? material.threeJSMaterial.textures[0].repeat[0]
                        : 1.0
                      ).toFixed(2)
                    )}
                    onChange={handleMaterialSizeChange}
                  />
                </Box>
                <Input
                  placeholder="Search Materials"
                  id="adornment-password"
                  value={assetFilter}
                  onChange={(e) => {
                    setAssetFilter(e.target.value);
                  }}
                  style={{ margin: '10px' }}
                  endAdornment={
                    <>
                      {assetFilter !== '' && (
                        <IconButton
                          onClick={(event) => {
                            setAssetFilter('');
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
                <div>
                  {filteredMaterials
                    .map((material: PlacezMaterial) => {
                      return material.tags ?? [];
                    })
                    .filter((tags: string[]) => {
                      return tags.some((tag: string) => {
                        return MaterialCategories.includes(tag);
                      });
                    })
                    .reduce((acc, tags: string[]) => {
                      acc.push(...tags);
                      return [...new Set(acc)];
                    }, [])
                    .map((category) => {
                      return (
                        <MaterialAccordion
                          category={category}
                          setMaterial={props.setMaterial}
                          materials={filteredMaterials.filter(
                            (material: PlacezMaterial) => {
                              return material.tags
                                ? material.tags.includes(category)
                                : false;
                            }
                          )}
                        />
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
