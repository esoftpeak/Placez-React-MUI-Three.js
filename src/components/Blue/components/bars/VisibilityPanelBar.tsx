import React from 'react';
import {
  IconButton,
  Tooltip,
  Theme,
  createStyles,
  useTheme,
  Slider,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import GridOffOutlinedIcon from '@mui/icons-material/GridOffOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      ...theme.PlacezLightBorderStyles,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 20px 4px 8px',
      borderRadius: '20px',
      backgroundColor: theme.palette.background.paper,
      gap: '4px',
      pointerEvents: 'auto',
      overflow: 'hidden'
    },
    iconButton: {
      width: 28,
      height: 28,
      padding: 0,
      margin: '0 2px',
      '& svg': {
        fontSize: '18px',
      },
    },
    sliderContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      minWidth: 160,
      paddingLeft: 4,
    },
    sliderLabel: {
      width: '20px',
      fontSize: 11,
      whiteSpace: 'nowrap',
      marginLeft: '5px'
    },
  })
);

interface VisibilityPanelProps {
  isGridVisible: boolean;
  onToggleGrid: () => void;
  isFloorplanVisible: boolean;
  onToggleFloorplan: () => void;

  dimensionCutoff: number;
  onDimensionCutoffChange: (value: number) => void;

  dimensionLabelWidth: number;
  onDimensionLabelWidthChange: (value: number) => void;
}

const VisibilityPanel: React.FC<VisibilityPanelProps> = ({
  isGridVisible,
  onToggleGrid,
  isFloorplanVisible,
  onToggleFloorplan,
  dimensionCutoff,
  onDimensionCutoffChange,
  dimensionLabelWidth,
  onDimensionLabelWidthChange,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const handleCutoffSliderChange = (_: Event, value: number | number[]) => {
    const numericValue = Array.isArray(value) ? value[0] : value;
    onDimensionCutoffChange(numericValue);
  };

  const handleLabelWidthSliderChange = (_: Event, value: number | number[]) => {
    const numericValue = Array.isArray(value) ? value[0] : value;
    onDimensionLabelWidthChange(numericValue);
  };

  return (
    <div className={classes.root}>
      {/* Grid toggle */}
      <Tooltip
        title={isGridVisible ? 'Hide Grid' : 'Show Grid'}
        placement="top"
      >
        <IconButton
          className={classes.iconButton}
          style={{ color: theme.palette.text.secondary }}
          onClick={onToggleGrid}
        >
          {isGridVisible ? <GridOnOutlinedIcon /> : <GridOffOutlinedIcon />}
        </IconButton>
      </Tooltip>

      {/* Floorplan image toggle */}
      <Tooltip
        title={
          isFloorplanVisible ? 'Hide Floorplan' : 'Show Floorplan'
        }
        placement="top"
      >
        <IconButton
          className={classes.iconButton}
          style={{ color: theme.palette.text.secondary }}
          onClick={onToggleFloorplan}
        >
          {isFloorplanVisible ? (
            <ImageOutlinedIcon />
          ) : (
            <ImageNotSupportedOutlinedIcon />
          )}
        </IconButton>
      </Tooltip>

      {/* Dimension Cuttoff */}
      <Tooltip title="Dimension Cuttoff" placement="top">
        <Box className={classes.sliderContainer}>
          <StraightenIcon
            fontSize="small"
            style={{ color: theme.palette.text.secondary }}
          />
          <Slider
            value={dimensionLabelWidth}
            onChange={handleLabelWidthSliderChange}
            min={0}
            max={100}
            step={5}
            size="small"
            sx={{ width: 100 }}
          />
          <span className={classes.sliderLabel}>
            {dimensionLabelWidth.toFixed(0)} px
          </span>
        </Box>
      </Tooltip>
    </div>
  );
};

export default VisibilityPanel;
