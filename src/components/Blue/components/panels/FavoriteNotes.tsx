import { useState, useEffect } from 'react';

import { Theme, Tooltip, IconButton, Input } from '@mui/material';
import { makeStyles } from '@mui/styles';

import panelStyles from '../../../Styles/panels.css';
import { Delete, Search, Clear } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../reducers';
import LayoutLabel from '../../../../api/placez/models/LayoutLabel';
import { SetSelectedLabelId, NeedSaveAction } from '../../../../reducers/blue';
import { DeleteLabel, GetLabels } from '../../../../reducers/label';
import { PlacezLayoutPlan, PlacezFixturePlan } from '../../../../api';
import { useTheme } from '@mui/styles';
import { GlobalViewState } from '../../../../models/GlobalState';

import { SetFloorPlan, SetLayout } from '../../../../reducers/designer';
import { CSS3DLabelMaker } from '../../../../blue/three/CSS3DlabelMaker';
import { Utils } from '../../../../blue/core/utils';

type Props = {};

const FavoriteNotes = (props: Props) => {
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
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [labels, setLabels] = useState<LayoutLabel[]>([]);
  const [newLabelText, setNewLabelText] = useState<string>(labelText);

  const { backgroundColorAnchor, textColorAnchor, borderColorAnchor } = anchors;

  const floorplanLabels = useSelector(
    (state: ReduxState) => state.designer.floorPlan?.floorplanLabels
  );
  const layoutLabels = useSelector(
    (state: ReduxState) => state.designer.layout?.layoutLabels
  );
  const favoriteLabels = useSelector((state: ReduxState) => state.label.labels);

  // const favoriteNotes = useSelector((state: ReduxState) => state.asset.customNotes);

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
    newLabels.forEach((label, index) => {
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

  const [favoriteLabelsWithThumb, setFavoriteLabelsWithThumb] = useState([]);

  useEffect(() => {
    if (favoriteLabels) {
      const labelsWithThumb = favoriteLabels.map((note: LayoutLabel) => {
        const labelMaker = new CSS3DLabelMaker(note);
        return {
          ...note,
          thumbNail: labelMaker.getLabelDiv(),
        };
      });
      setFavoriteLabelsWithThumb(labelsWithThumb);
    }
  }, [favoriteLabels]);

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

  return (
    <>
      <div className={classes.panelUpper}>
        <div className={classes.fieldHeading}>Drag Note To Position</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            margin: '5px',
          }}
        >
          <Input
            placeholder="Search Notes"
            className="labelSearch"
            id="adornment-password"
            value={labelFilter}
            onChange={(event) => {
              setLabelFilter(event.target.value);
            }}
            endAdornment={
              <>
                {labelFilter !== '' && (
                  <IconButton
                    onClick={(event) => {
                      setLabelFilter('');
                    }}
                  >
                    <Clear />
                  </IconButton>
                )}
                {labelFilter === '' && (
                  <IconButton>
                    <Search />
                  </IconButton>
                )}
              </>
            }
          />
        </div>
      </div>
      <div className={classes.panelLower}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridGap: '0px',
          }}
        >
          {favoriteLabelsWithThumb
            .filter((value: LayoutLabel) =>
              labelFilter
                ? value.labelText
                    .toLowerCase()
                    .includes(labelFilter.toLowerCase())
                : true
            )
            .sort((a: LayoutLabel, b: LayoutLabel) =>
              a.labelText.localeCompare(b.labelText)
            )
            .map((value: LayoutLabel) => {
              return (
                <div
                  key={value.id}
                  style={{
                    height: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'normal',
                    cursor: 'grab',
                    position: 'relative',
                    padding: '10px 0px 0px 0px',
                    gap: '0',
                  }}
                  draggable={true}
                  onDragEnd={(e: any) => createLabel(value)(e)}
                  onTouchEnd={(e: any) => createLabel(value)(e)}
                >
                  <Tooltip
                    title="Drag and Drop"
                    placement="bottom"
                    style={{ margin: '0px' }}
                  >
                    <div
                      style={{
                        width: '90%',
                        height: '80%',
                        padding: '10px',
                        margin: '0px',
                        border: `${value.borderThickness}px solid ${value.borderColor}`,
                        borderRadius: `${value.borderRadius}px`,
                        backgroundColor: value.backgroundColor,
                        color: value.textColor,
                        fontSize: `${value.fontSize}px`,
                        fontFamily: value.fontface,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        wordBreak: 'break-word',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        boxSizing: 'border-box',
                        cursor: 'grab',
                      }}
                    >
                      <Tooltip
                        title="Delete"
                        style={{ alignSelf: 'end', margin: '10px' }}
                      >
                        <IconButton
                          color="secondary"
                          size="small"
                          aria-label="Favorite"
                          draggable={true}
                          onClick={(e: any) => dispatch(DeleteLabel(value))}
                          style={{
                            position: 'absolute',
                            top: '15px',
                            right: '25px',
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      {value.labelText}
                    </div>
                  </Tooltip>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default FavoriteNotes;
