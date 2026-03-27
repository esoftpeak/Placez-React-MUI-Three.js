import { Asset } from '../../../blue/items/asset';
import { DefaultMaterial, PlacezMaterial } from '../../../api/placez/models/PlacezMaterial';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import produce from 'immer';
import { useEffect } from 'react';
import EditColor from './panels/EditSurfacePanel/EditColor';

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    panel: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    },
    colorEditorContainer: {
      overflowY: 'hidden',
      overflowX: 'hidden',
      // padding: '8px',
      maxHeight: '300px'
    }
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

const ColorPanel = (props: Props) => {
  const classes = useStyles();

  const {
    selectedMaterialIndex,
    selectedMaterial,
    setSelectedMaterialIndex,
    setSelectedMaterial,
    asset,
    updateMaterialMask
  } = props;

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

  if (!selectedMaterial) return null;

  return (
    <div className={classes.panel}>
      <div className={classes.colorEditorContainer}>
        <EditColor
          setMaterial={setMaterial(selectedMaterialIndex)}
          material={selectedMaterial}
        />
      </div>
    </div>
  );
};

export default ColorPanel;
