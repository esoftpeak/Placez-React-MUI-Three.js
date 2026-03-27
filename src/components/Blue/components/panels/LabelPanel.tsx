import { useState, useEffect } from 'react';

import {
  Button,
  TextareaAutosize,
  FormLabel,
  Select,
  MenuItem,
  Theme,
  Tooltip,
  FormControl,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import panelStyles from '../../../Styles/panels.css';
import { OpenWith } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../reducers';
import LayoutLabel from '../../../../api/placez/models/LayoutLabel';
import { SetSelectedLabelId, NeedSaveAction } from '../../../../reducers/blue';
import { CreateLabel, GetLabels } from '../../../../reducers/label';
import { PlacezLayoutPlan, PlacezFixturePlan } from '../../../../api';
import { useTheme } from '@mui/styles';
import { GlobalViewState, ToolState } from '../../../../models/GlobalState';

import { SetFloorPlan, SetLayout } from '../../../../reducers/designer';
import HexInput from '../utility/HexInput';
import JustifyPicker from '../utility/JustifyPicker';
import RotationControls from '../utility/RotationControls';
import PlacezSlider from '../../../PlacezUIComponents/PlacezSlider';
import FavoriteNotes from './FavoriteNotes';
import { Utils } from '../../../../blue/core/utils';

type Props = {};

const LabelPanel = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);

  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const [labelFilter, setLabelFilter] = useState(undefined);

  const labelText =
    globalViewState === GlobalViewState.Fixtures
      ? `Enter your notes here...
Drag to Floorplan`
      : `Enter your notes here...
Drag to Layout`;

  const backgroundColor =
    globalViewState === GlobalViewState.Fixtures ? '#cccccc' : '#ffffff';

  const favoriteLabels = useSelector((state: ReduxState) => state.label.labels);

  const defaultLabel: LayoutLabel = {
    id: '00000000-0000-0000-0000-000000000000',
    labelText,
    fontSize: 24,
    fontWeight: 'normal',
    fontface: 'Arial',
    textColor: '#000000',
    textOpacity: 1,
    position: undefined,
    borderColor: '#000000',
    borderOpacity: 1,
    backgroundColor,
    backgroundOpacity: 1,
    borderThickness: 2,
    borderRadius: 6,
    margin: 2,
    lineSpacing: 0,
    rotation: 0,
    justify: 'center',
  };

  interface Anchors {
    backgroundColorAnchor: HTMLElement;
    textColorAnchor: HTMLElement;
    borderColorAnchor: HTMLElement;
  }

  const [selectedLabel, setSelectedLabel] = useState<LayoutLabel>({
    ...defaultLabel,
  });
  const [anchors, setAnchors] = useState<Anchors>({
    backgroundColorAnchor: undefined,
    textColorAnchor: undefined,
    borderColorAnchor: undefined,
  });
  const [labels, setLabels] = useState<LayoutLabel[]>([]);
  const [newLabelText, setNewLabelText] = useState<string>(labelText);

  const { backgroundColorAnchor, textColorAnchor, borderColorAnchor } = anchors;

  const floorplanLabels = useSelector(
    (state: ReduxState) => state.designer.floorPlan?.floorplanLabels
  );
  const layoutLabels = useSelector(
    (state: ReduxState) => state.designer.layout?.layoutLabels
  );

  useEffect(() => {
    if (globalViewState === GlobalViewState.Fixtures) {
      setLabels(floorplanLabels ?? []);
      dispatch(GetLabels());
    } else {
      setLabels(layoutLabels ?? []);
      dispatch(GetLabels());
    }
  }, [floorplanLabels, layoutLabels, globalViewState]);

  const selectedLabelId: string = useSelector(
    (state: ReduxState) => state.blue.selectedLabelId
  );
  const layout: PlacezLayoutPlan = useSelector(
    (state: ReduxState) => state.designer.layout
  );
  const fixturePlan: PlacezFixturePlan = useSelector(
    (state: ReduxState) => state.designer.floorPlan
  );

  const dispatch = useDispatch();

  const save = (newLabels: LayoutLabel[]) => {
    if (globalViewState === GlobalViewState.Fixtures) {
      dispatch(
        SetFloorPlan({
          floorplanLabels: newLabels,
        })
      );
    } else {
      dispatch(
        SetLayout({
          ...layout,
          layoutLabels: newLabels,
        })
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const createLabel = (label: LayoutLabel) => (e?: TouchEvent & MouseEvent) => {
    const newLabels = labels ? [...labels] : [];
    const newLabelId = Utils.guid();
    const newLabel = {
      ...label,
      id: newLabelId,
    };
    newLabel.position = undefined;
    newLabels.push({ ...newLabel });
    save(newLabels);
    dispatch(SetSelectedLabelId(undefined));
  };

  const updateSelectedLabel = (key: keyof LayoutLabel, value: any) => {
    if (selectedLabel[key] === value) return;
    const newLabels = labels ? [...labels] : [];
    const selectedLabelIndex = newLabels.findIndex((label: LayoutLabel) => {
      return label.id === selectedLabelId;
    });

    const updatedLabel = {
      ...selectedLabel,
      [key]: value,
    };
    setNewLabelText(updatedLabel.labelText);

    if (selectedLabelIndex >= 0) {
      newLabels[selectedLabelIndex] = { ...updatedLabel };
      save(newLabels);
      dispatch(SetSelectedLabelId(updatedLabel.id));
    } else {
      // just update local selected
      setSelectedLabel(updatedLabel);
    }
  };

  const deleteLabel = () => {
    const newLabels = labels.filter((label: LayoutLabel) => {
      return label.id !== selectedLabelId;
    });
    newLabels.forEach((label) => {
      label.id = Utils.guid();
    });
    save(newLabels);
    dispatch(SetSelectedLabelId(undefined));
  };

  useEffect(
    // only select label when selected label Id changes
    () => {
      if (selectedLabelId !== undefined) {
        let labels;
        if (globalViewState === GlobalViewState.Fixtures) {
          if (floorplanLabels) {
            labels = [...floorplanLabels];
          } else {
            labels = [];
          }
        } else {
          if (layoutLabels) {
            labels = [...layoutLabels];
          } else {
            labels = [];
          }
        }

        const selectLabel = labels.find((layoutLabel: LayoutLabel) => {
          return layoutLabel.id === selectedLabelId;
        });
        if (selectLabel) {
          // something to do with this
          setSelectedLabel(selectLabel);
          setNewLabelText(selectLabel.labelText);
        } else {
          setSelectedLabel(defaultLabel);
          dispatch(SetSelectedLabelId(undefined));
        }
      } else {
        setSelectedLabel(defaultLabel);
        setNewLabelText(labelText);
      }
    },
    [selectedLabelId, layoutLabels, floorplanLabels]
  );

  const theme: Theme = useTheme();
  const classes = styles(props);

  useEffect(() => {
    updateSelectedLabel('labelText', newLabelText);
  }, [newLabelText]);

  const fontSizes = [];
  for (let index = 8; index < 12; index++) {
    fontSizes.push(index);
  }
  for (let index = 14; index < 28; index += 2) {
    fontSizes.push(index);
  }
  fontSizes.push(36, 48, 72);

  const toolState = useSelector(
    (state: ReduxState) => state.globalstate.toolState
  );

  return (
    <>
      {toolState === ToolState.Default && (
        <>
          <div className={classes.panelLower}>
            {selectedLabel && (
              <>
                <TextareaAutosize
                  className={classes.textArea}
                  aria-label="empty textarea"
                  placeholder="Empty"
                  value={newLabelText}
                  onChange={(e) =>
                    updateSelectedLabel('labelText', e.target.value)
                  }
                  style={{
                    ...theme.PlacezBorderStyles,
                    fontFamily: selectedLabel.fontface,
                    resize: 'none',
                    textAlign: selectedLabel.justify,
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    position: 'relative',
                    marginBottom: '-48px',
                    padding: '12px',
                    bottom: '56px',
                  }}
                >
                  <Tooltip title="Drag to Create Label">
                    <IconButton
                      style={{
                        cursor: 'grab',
                      }}
                      color="secondary"
                      size="small"
                      aria-label="Drag to Create"
                      draggable={true}
                      label-data={JSON.stringify(selectedLabel)}
                      onDragEnd={(e: any) => createLabel(selectedLabel)(e)}
                      onTouchEnd={(e: any) => createLabel(selectedLabel)(e)}
                    >
                      <OpenWith />
                      {/* <DragIndicator/> */}
                    </IconButton>
                  </Tooltip>
                </div>
              </>
            )}
            <div className={classes.panelLower}>
              <div className={classes.fieldGrid}>
                <Select
                  variant="standard"
                  value={selectedLabel.fontface}
                  style={{ marginLeft: '8px' }}
                  onChange={(e) =>
                    updateSelectedLabel('fontface', e.target.value)
                  }
                >
                  <MenuItem
                    value={'Times New Roman'}
                    style={{ fontFamily: 'Times New Roman' }}
                  >
                    Times New Roman
                  </MenuItem>
                  <MenuItem value={'Arial'} style={{ fontFamily: 'Arial' }}>
                    Arial
                  </MenuItem>
                  <MenuItem value={'Verdana'} style={{ fontFamily: 'Verdana' }}>
                    Verdana
                  </MenuItem>
                  <MenuItem value={'Calibri'} style={{ fontFamily: 'Calibri' }}>
                    Calibri
                  </MenuItem>
                  <MenuItem value={'Vivaldi'} style={{ fontFamily: 'Vivaldi' }}>
                    Vivaldi
                  </MenuItem>
                  <MenuItem
                    value={'Montserrat'}
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    Avenir
                  </MenuItem>
                </Select>
                <JustifyPicker
                  value={selectedLabel.justify}
                  onChange={(v) => {
                    updateSelectedLabel('justify', v);
                  }}
                />
                <FormControl variant="standard">
                  <Select
                    style={{ marginLeft: '8px' }}
                    value={selectedLabel.fontWeight ?? 'normal'}
                    onChange={(e, v) =>
                      updateSelectedLabel('fontWeight', e.target.value)
                    }
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    <MenuItem value="normal">normal</MenuItem>
                    <MenuItem value="bold">bold</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="standard">
                  <Select
                    value={selectedLabel.fontSize ?? 12}
                    onChange={(e, v) =>
                      updateSelectedLabel('fontSize', e.target.value)
                    }
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    {fontSizes.map((index) => {
                      return (
                        <MenuItem key={index} value={index}>
                          {index}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <HexInput
                  label="Stroke"
                  color={selectedLabel.textColor}
                  onChange={(e) => updateSelectedLabel('textColor', e)}
                />
                <HexInput
                  label="Fill"
                  color={selectedLabel.backgroundColor}
                  onChange={(e) => updateSelectedLabel('backgroundColor', e)}
                />
                <HexInput
                  label="Border"
                  color={selectedLabel.borderColor}
                  onChange={(e) => updateSelectedLabel('borderColor', e)}
                />
                {
                  <>
                    <FormLabel className={classes.fieldHeading}>
                      {/* <FormatLineSpacing fontSize='small'/> */}
                      Item Rotation
                    </FormLabel>
                    <RotationControls
                      rotation={selectedLabel.rotation}
                      degrees
                      setRotation={(rotation) => {
                        updateSelectedLabel('rotation', rotation);
                      }}
                      label="Label "
                    />
                  </>
                }
                <FormLabel className={classes.fieldHeading}>
                  {/* <FormatLineSpacing fontSize='small'/> */}
                  Line Spacing
                </FormLabel>
                <FormControl variant="standard">
                  {/* <Select
                  value={selectedLabel.lineSpacing ?? 0}
                  onChange={(e, v) => updateSelectedLabel('lineSpacing', e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {[0, 2, 4, 6, 8].map((index) => {
                    return (<MenuItem value={index}>{index}</MenuItem>)
                  })}
                </Select> */}
                  <PlacezSlider
                    className={classes.spacingSlider}
                    value={selectedLabel.lineSpacing}
                    step={1}
                    min={0}
                    max={20}
                    valueLabelDisplay="auto"
                    onChange={(e, v) => updateSelectedLabel('lineSpacing', v)}
                  />
                </FormControl>

                <FormLabel className={classes.fieldHeading}>Margin</FormLabel>
                <FormControl variant="standard">
                  {/* <Select
                  value={selectedLabel.margin ?? 12}
                  onChange={(e, v) => updateSelectedLabel('margin', e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {[0, 2, 4, 6, 8, 10, 12, 24, 36, 72].map((index) => {
                    return (<MenuItem value={index}>{index}</MenuItem>)
                  })}
                </Select> */}
                  <PlacezSlider
                    className={classes.spacingSlider}
                    value={selectedLabel.margin}
                    step={1}
                    min={1}
                    max={60}
                    valueLabelDisplay="auto"
                    onChange={(e, v) => updateSelectedLabel('margin', v)}
                  />
                </FormControl>
                <FormLabel className={classes.fieldHeading}>
                  Border Thickness
                </FormLabel>
                <FormControl variant="standard">
                  {/* <Select
                  value={selectedLabel.borderThickness ?? 12}
                  onChange={(e, v) => updateSelectedLabel('borderThickness', e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {[0, 2, 4, 6, 8].map((index) => {
                    return (<MenuItem value={index}>{index}</MenuItem>)
                  })}
                </Select> */}
                  <PlacezSlider
                    className={classes.spacingSlider}
                    value={selectedLabel.borderThickness}
                    step={1}
                    min={1}
                    max={24}
                    valueLabelDisplay="auto"
                    onChange={(e, v) =>
                      updateSelectedLabel('borderThickness', v)
                    }
                  />
                </FormControl>
                <FormLabel className={classes.fieldHeading}>
                  Border Radius
                </FormLabel>
                <FormControl variant="standard">
                  {/* <Select
                  value={selectedLabel.borderRadius ?? 12}
                  onChange={(e, v) => updateSelectedLabel('borderRadius', e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {[2, 4, 6, 8, 10, 12, 24, 36].map((index) => {
                    return (<MenuItem value={index}>{index}</MenuItem>)
                  })}
                </Select> */}
                  <PlacezSlider
                    className={classes.spacingSlider}
                    value={selectedLabel.borderRadius}
                    step={1}
                    min={1}
                    max={selectedLabel.fontSize}
                    valueLabelDisplay="auto"
                    onChange={(e, v) => updateSelectedLabel('borderRadius', v)}
                  />
                </FormControl>
              </div>
            </div>
            <div className={classes.panelFooter}>
              <div className={classes.buttonDiv}>
                <Button
                  disabled={selectedLabel.id === undefined}
                  className={classes.button}
                  onClick={(e: any) => {
                    const newLabel = { ...selectedLabel };
                    newLabel.position = undefined;
                    dispatch(CreateLabel(newLabel));
                  }}
                  variant="outlined"
                  classes={{
                    root: classes.deleteButton,
                  }}
                >
                  Save As Favorite
                </Button>
              </div>
              <div className={classes.buttonDiv}>
                <Button
                  disabled={selectedLabel.id === undefined}
                  className={classes.button}
                  onClick={deleteLabel}
                  variant="outlined"
                  classes={{
                    root: classes.deleteButton,
                  }}
                >
                  Delete Label
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {toolState === ToolState.Favorites && <FavoriteNotes />}
    </>
  );
};

export default LabelPanel;
