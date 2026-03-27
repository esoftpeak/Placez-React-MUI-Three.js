import { Asset } from '../../../blue/items/asset';
import {
  DefaultMaterial,
  PlacezMaterial,
  GetImgUrlForMap,
  PlacedMaterial,
} from '../../../api/placez/models/PlacezMaterial';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import { Utils } from '../../../blue/core/utils';
import produce from 'immer';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import { useEffect } from 'react';
import { Delete, RestartAlt } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    body: {
      display: 'flex',
    },
    root: {
      margin: 0,
      padding: 2,
    },
    panelContainer: {
      position: 'relative',
      width: '100%',
    },
    verticalLine: {
      position: 'absolute',
      right: theme.spacing(2),
      top: '7%',
      bottom: '7%',
      width: '2px',
      backgroundColor: theme.palette.divider,
    },
    panel: {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: '10px',
      width: '100%',
      maxWidth: '100%',
    },
    editMaterial: {
      overflow: 'auto',
      flex: 1,
      width: '100%',
    },
    title: {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      margin: 0,
      padding: theme.spacing(2),
      fontSize: '40px',
      textAlign: 'center',
    },
    headingText: {
      marginLeft: theme.spacing(),
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium as any,
    },
    button: {
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.secondary.main,
      },
    },
    actions: {
      borderTop: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.secondary.main,
    },
    gridList: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16,
      padding: '10px',
      width: '100%',
      maxHeight: '300px',
      overflow: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'thin',
    },
    tile: {
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '70px',
      maxWidth: '70px',
      overflow: 'hidden',
      height: '70px',
      maxHeight: '70px',
      position: 'relative',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    },
    materialActions: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '50%',
    },
    actionIcon: {
      margin: '0 4px',
      '&:hover': {
        transform: 'scale(1.2)',
      },
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

const ActiveMaterial = (props: Props) => {
  const classes = styles(props);
  const {
    selectedMaterialIndex,
    selectedMaterial,
    setSelectedMaterialIndex,
    setSelectedMaterial,
  } = props;

  const materialsById = useSelector((state: ReduxState) => state.material.byId);
  const theme: Theme = useTheme();

  const selectMaterialIndex = (index: number) => () => {
    if (index === null) {
      return;
    }

    const { asset, materialsBak } = props;
    if (asset.materialMask === null) return;
    const selectMaterial = asset.materialMask[index]
      ? asset.materialMask[index]
      : DefaultMaterial;

    setSelectedMaterialIndex(index);
    setSelectedMaterial(selectMaterial);
  };

  useEffect(() => {
    selectMaterialIndex(selectedMaterialIndex)();
  }, [props.asset]);

  const setMaterial = (index: number) => (material: PlacezMaterial) => {
    if (index === null) return;
    const { asset, updateMaterialMask } = props;

    const newMask = produce(asset.materialMask, (draft) => {
      draft[index] = material;
    });

    updateMaterialMask(newMask);
  };

  const getImage = (materialMask: PlacedMaterial, index: number): string => {
    let textureImage = '';
    if (materialMask?.appliedMaterialId) {
      const foundMaterial = materialsById[materialMask.appliedMaterialId];
      if (foundMaterial) {
        textureImage = GetImgUrlForMap(foundMaterial, 'map');
      }
    } else {
      textureImage = GetImgUrlForMap(props.materialsBak[index], 'map');
    }
    return `url(${textureImage})`;
  };

  const getColor = (materialMask: PlacezMaterial, index: number): string => {
    if (
      materialMask &&
      materialMask.threeJSMaterial &&
      materialMask.threeJSMaterial.color
    ) {
      return Utils.decColorToHex(materialMask.threeJSMaterial.color);
    }
    if (
      props.materialsBak &&
      props.materialsBak[index] &&
      props.materialsBak[index].threeJSMaterial &&
      props.materialsBak[index].threeJSMaterial.color
    ) {
      return Utils.decColorToHex(
        props.materialsBak[index].threeJSMaterial.color
      );
    }
    return '#ffffff';
  };

  const clearMaterial = (e) => {
    e.stopPropagation();
    setMaterial(selectedMaterialIndex)(DefaultMaterial);
  };

  const defaultMaterial = (e) => {
    e.stopPropagation();
    setMaterial(selectedMaterialIndex)(null);
  };

  return (
    <div className={classes.panelContainer} style={{ width: '100% !important' }}>
      <div className={classes.panel} style={{ width: '100% !important' }}>
        {props?.asset?.materialMask && (
          <div className={classes.gridList}>
            {props.asset.materialMask.map((material: PlacezMaterial, index) => {
              if (material || props.materialsBak[index]) {
                const textureImage = getImage(
                  material ?? props.materialsBak[index],
                  index
                );
                const tileColor = getColor(material, index);
                return (
                  <div
                    key={index}
                    className={classes.tile}
                    style={{
                      borderRadius: '50%',
                      backgroundColor: `${tileColor}`,
                      backgroundImage: `${textureImage}`,
                      backgroundBlendMode: 'multiply',
                      borderColor: `${selectedMaterialIndex === index ? "#5C236F" : "#e9e8e8"}`,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    onClick={selectMaterialIndex(index)}
                  >
                    {selectedMaterialIndex === index && (
                      <div className={classes.materialActions}>
                        <Tooltip title="Reset">
                          <RestartAlt
                            onClick={defaultMaterial}
                            color="primary"
                            className={classes.actionIcon}
                          />
                        </Tooltip>
                        <Tooltip title="Remove">
                          <Delete
                            onClick={clearMaterial}
                            color="primary"
                            className={classes.actionIcon}
                          />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
      <div className={classes.verticalLine}></div>
    </div >
  );
};

export default ActiveMaterial;
