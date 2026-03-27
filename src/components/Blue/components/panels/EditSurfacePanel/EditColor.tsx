
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useTheme } from '@mui/styles';

import panelStyles from '../../../../Styles/panels.css';
import {
  PlacezMaterial,
  PlacedMaterial,
} from '../../../../../api/placez/models/PlacezMaterial';
import { Utils } from '../../../../../blue/core/utils';
import AdvancedColorPickerV2 from '../../utility/AdvancedColorPickerV2';

interface Props {
  setMaterial: (material) => void;
  material: PlacedMaterial;
  defaultMaterial?: PlacezMaterial;
  noTransparent?: boolean;
  selectedMaterialIndicator?: boolean;
}

export default function EditColor(props: Props) {
  const theme: Theme = useTheme();

  const styles = makeStyles<Theme>(panelStyles);

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

  const classes = styles(props);

  const { material } = props;
  return (
    <>
      {material && (
        <>
          <div >
            <>
              <AdvancedColorPickerV2
                advanced={true}
                width={'240px'}
                color={
                  material && material.threeJSMaterial
                    ? Utils.decColorToHex(material.threeJSMaterial.color)
                    : '#ffffff'
                }
                onChange={handleMaterialColorChange}
              />
              {/*<div className={classes.fieldGrid}>*/}
              {/*  {!props.noTransparent && (*/}
              {/*    <>*/}
              {/*      <FormLabel className={classes.fieldHeading}>*/}
              {/*        Transparent*/}
              {/*      </FormLabel>*/}
              {/*      <PlacezSlider*/}
              {/*        min={0}*/}
              {/*        max={1}*/}
              {/*        step={0.05}*/}
              {/*        aria-labelledby="discrete-slider"*/}
              {/*        valueLabelDisplay="auto"*/}
              {/*        value={parseFloat(*/}
              {/*          (*/}
              {/*            1.0 -*/}
              {/*            (material &&*/}
              {/*            material.threeJSMaterial &&*/}
              {/*            material.threeJSMaterial.opacity !== undefined &&*/}
              {/*            material.threeJSMaterial.opacity !== null*/}
              {/*              ? material.threeJSMaterial.opacity*/}
              {/*              : 1.0)*/}
              {/*          ).toFixed(2)*/}
              {/*        )}*/}
              {/*        onChange={handleMaterialParamChange('opacity')}*/}
              {/*      />*/}
              {/*    </>*/}
              {/*  )}*/}
              {/*  <FormLabel className={classes.fieldHeading}>*/}
              {/*    Metalness*/}
              {/*  </FormLabel>*/}
              {/*  <PlacezSlider*/}
              {/*    min={0}*/}
              {/*    max={1}*/}
              {/*    step={0.05}*/}
              {/*    aria-labelledby="discrete-slider"*/}
              {/*    valueLabelDisplay="auto"*/}
              {/*    value={parseFloat(*/}
              {/*      (material &&*/}
              {/*      material.threeJSMaterial &&*/}
              {/*      material.threeJSMaterial.metalness !== undefined &&*/}
              {/*      material.threeJSMaterial.metalness !== null*/}
              {/*        ? material.threeJSMaterial.metalness*/}
              {/*        : 0.0*/}
              {/*      ).toFixed(2)*/}
              {/*    )}*/}
              {/*    onChange={handleMaterialParamChange('metalness')}*/}
              {/*  />*/}
              {/*  <FormLabel className={classes.fieldHeading}>*/}
              {/*    Roughness*/}
              {/*  </FormLabel>*/}
              {/*  <PlacezSlider*/}
              {/*    min={0}*/}
              {/*    max={1}*/}
              {/*    step={0.05}*/}
              {/*    aria-labelledby="discrete-slider"*/}
              {/*    valueLabelDisplay="auto"*/}
              {/*    value={parseFloat(*/}
              {/*      (material &&*/}
              {/*      material.threeJSMaterial &&*/}
              {/*      material.threeJSMaterial.roughness !== undefined &&*/}
              {/*      material.threeJSMaterial.roughness !== null*/}
              {/*        ? material.threeJSMaterial.roughness*/}
              {/*        : 1.0*/}
              {/*      ).toFixed(2)*/}
              {/*    )}*/}
              {/*    onChange={handleMaterialParamChange('roughness')}*/}
              {/*  />*/}
              {/*</div>*/}
            </>
          </div>
        </>
      )}
    </>
  );
}
