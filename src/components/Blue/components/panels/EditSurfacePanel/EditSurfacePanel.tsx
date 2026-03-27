import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { HandlesFromBlue } from '../../../models';
import {
  Typography,
  Button,
  Switch,
  Tooltip,
  Theme,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Room } from '../../../../../blue/model/room';
import { HalfEdge } from '../../../../../blue/model/half_edge';

import panelStyles from '../../../../Styles/panels.css';
import { Cancel, Colorize } from '@mui/icons-material';
import { ReduxState } from '../../../../../reducers';
import {
  SetSelectedSurfaces,
  NeedSaveAction,
} from '../../../../../reducers/blue';
import EditMaterial from './EditMaterial';
import {
  PlacezMaterial,
  DefaultWallMaterial,
  DefaultFloorMaterial,
} from '../../../../../api/placez/models/PlacezMaterial';
import { Utils } from '../../../../../blue/core/utils';

interface Props {
  handlesFromBlue: HandlesFromBlue;
  setFullScreen?: (value: boolean) => void;
}

const EditSurfacePanel = (props: Props) => {
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);
  const { setFullScreen, handlesFromBlue } = props;

  const selectedSurfaces = useSelector(
    (state: ReduxState) => state.blue.selectedSurfaces
  );

  const [selectedWallMaterial, setSelectedWallMaterial] =
    useState<PlacezMaterial>(DefaultWallMaterial);
  const [selectedFloor, setSelectedFloor] = useState<Room | undefined>(
    undefined
  );
  const [selectedFloorMaterial, setSelectedFloorMaterial] =
    useState<PlacezMaterial>(DefaultFloorMaterial);
  const [selectedWall, setSelectedWall] = useState<HalfEdge | undefined>(
    undefined
  );
  const [selectedWallVisible, setSelectedWallVisible] = useState(true);
  const [copiedMaterial, setCopiedMaterial] = useState<
    PlacezMaterial | undefined
  >(undefined);

  const canSave = useRef(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(SetSelectedSurfaces([]));
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedSurfaces?.length > 0) {
      canSave.current = false;
      selectedWallFloor(selectedSurfaces[0]);
    } else {
      setSelectedWall(undefined);
      setSelectedFloor(undefined);
    }
  }, [selectedSurfaces]);

  const isColorDark = (rgb: string): boolean => {
    const result = rgb.match(/\d+/g);
    if (!result) return false;
    const [r, g, b] = result.map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const selectedWallFloor = (obj: Room | HalfEdge) => {
    if (obj instanceof Room) {
      const texture = obj.getTexture();
      setSelectedFloor(obj);
      setSelectedWall(undefined);
      setSelectedFloorMaterial(texture as PlacezMaterial);
    }

    if (obj instanceof HalfEdge) {
      const texture = obj.getMaterial();
      setSelectedWall(obj);
      setSelectedFloor(undefined);
      setSelectedWallMaterial(texture as PlacezMaterial);
      setSelectedWallVisible(obj.getVisibility());
    }
  };

  const nothingSelected = () => {
    dispatch(SetSelectedSurfaces([]));
  };

  useEffect(() => {
    setWallMaterial();
  }, [selectedWallMaterial]);

  useEffect(() => {
    setFloorMaterial();
  }, [selectedFloorMaterial]);

  const handleWallMaterialChange = (material: PlacezMaterial) => {
    canSave.current = true;
    const processedMaterial = material
      ? (JSON.parse(JSON.stringify(material)) as PlacezMaterial)
      : DefaultWallMaterial;
    setSelectedWallMaterial(processedMaterial);
  };

  const handleFloorMaterialChange = (material: PlacezMaterial) => {
    canSave.current = true;
    const processedMaterial = material
      ? (JSON.parse(JSON.stringify(material)) as PlacezMaterial)
      : DefaultFloorMaterial;
    setSelectedFloorMaterial(processedMaterial);
  };

  const copyWallMaterial = () => {
    if (!selectedWallMaterial) return;
    const cloned = JSON.parse(
      JSON.stringify(selectedWallMaterial)
    ) as PlacezMaterial;
    setCopiedMaterial(cloned);
  };

  const pasteWallMaterial = () => {
    if (!copiedMaterial || !selectedWallMaterial) return;
    canSave.current = true;

    const updatedMaterial: PlacezMaterial = {
      ...(JSON.parse(JSON.stringify(copiedMaterial)) as PlacezMaterial),
      id: selectedWallMaterial.id,
    };

    setSelectedWallMaterial(updatedMaterial);
  };

  const copyFloorMaterial = () => {
    if (!selectedFloorMaterial) return;
    const cloned = JSON.parse(
      JSON.stringify(selectedFloorMaterial)
    ) as PlacezMaterial;
    setCopiedMaterial(cloned);
  };

  const pasteFloorMaterial = () => {
    if (!copiedMaterial) return;
    canSave.current = true;
    const cloned = JSON.parse(
      JSON.stringify(copiedMaterial)
    ) as PlacezMaterial;
    setSelectedFloorMaterial(cloned);
  };

  const setAllWalls = (material: PlacezMaterial | undefined) => {
    if (!material) return;
    handlesFromBlue.setAllWalls(material);
    dispatch(NeedSaveAction(true));
  };

  const setAllFloors = (material: PlacezMaterial | undefined) => {
    if (!material) return;
    handlesFromBlue.setAllFloors(material);
    dispatch(NeedSaveAction(true));
  };

  const setRoom = (material: PlacezMaterial | undefined) => {
    if (!material || !selectedWall) return;
    handlesFromBlue.setRoom(selectedWall.room, material);
    dispatch(NeedSaveAction(true));
  };

  const setFloorMaterial = () => {
    if (!selectedFloor || !selectedFloorMaterial) return;
    selectedFloor.setMaterial(selectedFloorMaterial);
    if (canSave.current) {
      dispatch(NeedSaveAction(true));
    }
  };

  const setWallMaterial = () => {
    if (!selectedWall || !selectedWallMaterial) return;
    selectedWall.setMaterial(selectedWallMaterial);
    if (canSave.current) {
      dispatch(NeedSaveAction(true));
    }
  };

  useEffect(() => {
    if (!selectedWall) return;
    selectedWall.setVisibility(selectedWallVisible);
    dispatch(NeedSaveAction(true));
  }, [selectedWallVisible]);

  const changeWallVisibility = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedWallVisible(event.target.checked);
  };

  useEffect(() => {
    if (!setFullScreen) return;
    if (!selectedWall && !selectedFloor) {
      setFullScreen(true);
    } else {
      setFullScreen(false);
    }
  }, [selectedWall, selectedFloor, setFullScreen]);

  const theme = useTheme();

  const activeSelectedMaterial = useMemo(() => {
    if (selectedFloor) return selectedFloorMaterial;
    if (selectedWall) return selectedWallMaterial;
    return DefaultWallMaterial;
  }, [
    selectedFloor,
    selectedWall,
    selectedFloorMaterial,
    selectedWallMaterial,
  ]);

  useEffect(() => {
    if (!iconRef.current) return;
    const computedStyle = getComputedStyle(iconRef.current);
    const bgColor = computedStyle.backgroundColor;
    setIsDark(isColorDark(bgColor));
  }, [activeSelectedMaterial, selectedFloor, selectedWall]);

  const activeStyle = useMemo(() => {
    let backgroundImage = '';

    // If using default material, don't set background image
    if (
      activeSelectedMaterial?.appliedMaterialId ===
      '41c8b80b-4ad0-44c1-a6e8-657a79fad6a4'
    ) {
      backgroundImage = '';
    } else {
      backgroundImage = activeSelectedMaterial?.id
        ? `url(${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/${activeSelectedMaterial.id}.jpg)`
        : '';
      if (activeSelectedMaterial?.threeJSMaterial?.images?.[0]?.url) {
        backgroundImage = `url(${import.meta.env.VITE_APP_PLACEZ_API_URL}${activeSelectedMaterial.threeJSMaterial.images[0]?.url})`;
      }
    }

    return {
      backgroundImage,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundColor: activeSelectedMaterial?.threeJSMaterial?.color
        ? `${Utils.decColorToHex(activeSelectedMaterial.threeJSMaterial.color)}`
        : '',
      opacity: activeSelectedMaterial?.threeJSMaterial?.opacity
        ? `${activeSelectedMaterial.threeJSMaterial.opacity}`
        : '',
      backgroundBlendMode: 'multiply',
      backgroundSize: 'cover',
      flex: 1,
      alignSelf: 'stretch',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.PlacezBorderStyles,
      paddingBottom: '8px !important',
      paddingLeft: '6px',
    } as React.CSSProperties;
  }, [activeSelectedMaterial, theme]);

  return (
    <div className={classes.root}>
      <div className={classes.panel}>
        {/* FLOOR SECTION */}
        {selectedFloor && (
          <div className={classes.panelUpper}>
            <div className={classes.titleContainer}>
              <div className={classes.cancelButton} />
              <Typography className={classes.title} align="center">
                Floor
              </Typography>
              <Tooltip title="Cancel Texture">
                <Cancel
                  onClick={nothingSelected}
                  className={classes.cancelButton}
                />
              </Tooltip>
            </div>
            <div style={{ display: 'flex' }}>
              <Tooltip title="Selected Surface">
                <div
                  ref={iconRef}
                  onClick={copyFloorMaterial}
                  style={activeStyle}
                  className={classes.button}
                >
                  <Colorize sx={{ filter: isDark ? 'invert(1)' : 'none' }} />
                </div>
              </Tooltip>
              <Tooltip title="Paste">
                <div className={classes.modGroup}>
                  <Button
                    disabled={copiedMaterial === undefined}
                    onClick={pasteFloorMaterial}
                    className={classes.button}
                    variant="outlined"
                  >
                    Apply Floor
                  </Button>
                  <Button
                    disabled={copiedMaterial === undefined}
                    onClick={() => setAllFloors(copiedMaterial)}
                    className={classes.button}
                    variant="outlined"
                  >
                    Apply Everywhere
                  </Button>
                  <div style={{ minHeight: '46.5px' }} />
                </div>
              </Tooltip>
            </div>
          </div>
        )}

        {/* WALL SECTION */}
        {selectedWall && (
          <div className={classes.panelUpper}>
            <div className={classes.titleContainer}>
              <div className={classes.cancelButton} />
              <Typography className={classes.title} align="center">
                Wall
              </Typography>
              <Tooltip title="Cancel Texture">
                <Cancel
                  onClick={nothingSelected}
                  className={classes.cancelButton}
                />
              </Tooltip>
            </div>
            <div style={{ display: 'flex' }}>
              <Tooltip title="Selected Surface">
                <div
                  ref={iconRef}
                  onClick={copyWallMaterial}
                  style={activeStyle}
                  className={classes.button}
                >
                  <Colorize sx={{ filter: isDark ? 'invert(1)' : 'none' }} />
                </div>
              </Tooltip>
              <Tooltip title="Paste">
                <div className={classes.modGroup}>
                  <Button
                    disabled={copiedMaterial === undefined}
                    onClick={pasteWallMaterial}
                    className={classes.button}
                    variant="outlined"
                  >
                    Apply Wall
                  </Button>
                  <Button
                    disabled={copiedMaterial === undefined}
                    onClick={() => setRoom(copiedMaterial)}
                    className={classes.button}
                    variant="outlined"
                  >
                    Apply Room
                  </Button>
                  <Button
                    disabled={copiedMaterial === undefined}
                    onClick={() => setAllWalls(copiedMaterial)}
                    className={classes.button}
                    variant="outlined"
                  >
                    Apply Everywhere
                  </Button>
                </div>
              </Tooltip>
            </div>
          </div>
        )}

        {/* MATERIAL EDITOR */}
        <div className={classes.panelLower}>
          {selectedFloor && (
            <EditMaterial
              material={selectedFloorMaterial}
              setMaterial={handleFloorMaterialChange}
              defaultMaterial={DefaultFloorMaterial}
            />
          )}
          {selectedWall && (
            <EditMaterial
              material={selectedWallMaterial}
              setMaterial={handleWallMaterialChange}
              defaultMaterial={DefaultWallMaterial}
            />
          )}
        </div>

        {selectedWall && (
          <div className={classes.panelFooter}>
            <div className={classes.fieldContainer}>
              <div className={classes.fieldHeading}>Visible</div>
              <Switch
                checked={selectedWallVisible}
                onChange={changeWallVisibility}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSurfacePanel;
