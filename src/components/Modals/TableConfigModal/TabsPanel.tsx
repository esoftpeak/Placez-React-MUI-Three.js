import React, { useState } from 'react';
import {
  Theme,
  createStyles,
  Tabs,
  Tab,
  FormLabel,
  Switch,
  Checkbox,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import TabPanel from './TabPanel';
import { TableTypes } from '../../../blue/itemModifiers/ChairMod';
import { Utils } from '../../../blue/core/utils';
import { AssetModifierKeys, AssetModifiers } from '../../../blue/items/asset';
import { EventSeat } from '@mui/icons-material';
import { Matrix4 } from 'three';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../Hooks/useLocalStorageState';
import { ValidUnits } from '../../../api/placez/models/UserSetting';
import PlacezSlider from '../../PlacezUIComponents/PlacezSlider'
import { CenterpieceIcon, LinenIcon, PlaceSettingIcon } from '../../../assets/icons'

enum TabIndex {
  Chair = 0,
  CenterPiece = 1,
  PlaceSetting = 2,
  Linen = 3,
}

interface Props {
  modifiers: AssetModifiers;

  tableConfigTabIndex: number;
  handleTabChange: (event: any, value: any) => void;
  handleSwitchChange: <
    modifierKey extends keyof AssetModifiers,
    modifierParamKey extends keyof AssetModifiers[modifierKey],
  >(
    assetModifierKey: modifierKey,
    keyOfAssetModifierKey: modifierParamKey
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;

  handleAssetModOnChange: <
    modifierKey extends keyof AssetModifiers,
    modifierParamKey extends keyof AssetModifiers[modifierKey],
  >(
    assetModifierKey: modifierKey,
    keyOfAssetModifierKey: modifierParamKey
  ) => (event, value: AssetModifiers[modifierKey][modifierParamKey]) => void;
}

function renderSeatCount(props: Props) {
  const { modifiers, handleAssetModOnChange } = props;
  const classes = styles(props);

  return (
    <>
      <FormLabel className={classes.tabSettingsLabel}>
        Seat Count {modifiers?.chairMod?.seats}
      </FormLabel>
      <PlacezSlider
        className={classes.settingSlider}
        value={modifiers?.chairMod?.seats}
        step={1}
        min={0}
        max={modifiers.chairMod.maxSeats}
        valueLabelDisplay="auto"
        onChange={handleAssetModOnChange(AssetModifierKeys.chairMod, 'seats')}
        aria-labelledby="input-slider"
        marks={true}
      />
    </>
  );
}

function RenderTabSettins(props: Props, showSettings, setShowSettings) {
  const {
    tableConfigTabIndex,
    handleSwitchChange,
    handleAssetModOnChange,
    modifiers,
  } = props;
  const classes = styles(props);
  const units = useLocalStorageSelector<ValidUnits>(LocalStorageKey.Units);
  const smallUnits = units === ValidUnits.ftIn ? ValidUnits.in : units;

  const currentUnits = Utils.getUnit();

  return (
    <div className={classes.root}>
      <TabPanel
        className={classes.tabPanelSettings}
        value={tableConfigTabIndex}
        index={TabIndex.Chair}
      >
        <div className={classes.settings}>
          {renderSeatCount(props)}
          <FormLabel className={classes.tabSettingsLabel}>
            Distance ({smallUnits})
          </FormLabel>
          <PlacezSlider
            className={classes.settingSlider}
            value={Utils.unitsOutNumber(
              modifiers.chairMod.distance ?? 0,
              smallUnits,
              [ValidUnits.ft, ValidUnits.ftIn].includes(smallUnits) ? 1 : 0
            )}
            min={-Utils.convertUnitsFromTo(50, 'cm', smallUnits)}
            max={Utils.convertUnitsFromTo(50, 'cm', smallUnits)}
            onChange={(e, v) => {
              const distance = Utils.convertUnitsFromTo(
                v,
                smallUnits,
                'cm',
                3
              );
              handleAssetModOnChange(AssetModifierKeys.chairMod, 'distance')(
                e,
                distance
              );
            }}
            aria-labelledby="input-slider"
            valueLabelDisplay="auto"
            step={0.1}
          />
          {(modifiers.chairMod.tableType === TableTypes.Square ||
            modifiers.chairMod.tableType === TableTypes.Banquet) && (
            <>
              <FormLabel className={classes.tabSettingsLabel}>
                Seat Width ({smallUnits})
              </FormLabel>
              <PlacezSlider
                className={classes.settingSlider}
                value={Utils.unitsOutNumber(
                  modifiers.chairMod.seatWidth ?? 0,
                  smallUnits,
                  [ValidUnits.ft, ValidUnits.ftIn].includes(smallUnits) ? 1 : 0
                )}
                min={Utils.convertUnitsFromTo(20, 'in', smallUnits)}
                max={Utils.convertUnitsFromTo(36, 'in', smallUnits)}
                onChange={(e, v) => {
                  handleAssetModOnChange(
                    AssetModifierKeys.chairMod,
                    'seatWidth'
                  )(e, Utils.convertUnitsFromTo(v, smallUnits, 'cm'));
                }}
                aria-labelledby="input-slider"
                valueLabelDisplay="auto"
              />
            </>
          )}

          {(modifiers.chairMod.tableType === TableTypes.Round ||
            modifiers.chairMod.tableType === TableTypes.Oval) && (
            <>
              <FormLabel className={classes.tabSettingsLabel}>
                Equal Spacing
              </FormLabel>
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <Switch
                  size="small"
                  checked={modifiers?.chairMod?.equalSpacing}
                  onChange={handleSwitchChange('chairMod', 'equalSpacing')}
                  value={modifiers?.chairMod?.equalSpacing}
                />
              </div>
            </>
          )}
        </div>
        {(modifiers.chairMod.tableType === TableTypes.Square ||
          modifiers.chairMod.tableType === TableTypes.Banquet) && (
            <div className={classes.chairPlacementContainer}>
              <div className={classes.topSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.top}
                    onChange={handleSwitchChange('chairMod', 'top')}
                    value={modifiers.chairMod.top}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Top
                  </FormLabel>
                </div>
              </div>
              <div className={classes.bottomSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.bottom}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'bottom'
                    )}
                    value={modifiers.chairMod.bottom}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Bottom
                  </FormLabel>
                </div>
              </div>
              <div className={classes.center}>CHAIR PLACEMENT</div>
              <div className={classes.leftSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.left}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'left'
                    )}
                    value={modifiers.chairMod.left}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Left
                  </FormLabel>
                </div>
              </div>
              <div className={classes.rightSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.right}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'right'
                    )}
                    value={modifiers.chairMod.right}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Right
                  </FormLabel>
                </div>
              </div>
            </div>
        )}
        {modifiers.chairMod.tableType === TableTypes.Sweetheart && (
            <div className={classes.chairPlacementContainer}>
              <div className={classes.topSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.top}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'top'
                    )}
                    value={modifiers.chairMod.top}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Top
                  </FormLabel>
                </div>
              </div>
              <div className={classes.sweetheart}>CHAIR PLACEMENT</div>
              <div className={classes.bottomSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.bottom}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'bottom'
                    )}
                    value={modifiers.chairMod.bottom}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Bottom
                  </FormLabel>
                </div>
              </div>
            </div>
        )}
        {modifiers.chairMod.tableType === TableTypes.Serpentine && (
            <div className={classes.chairPlacementContainer}>
              <div className={classes.leftSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.top}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'top'
                    )}
                    value={modifiers.chairMod.top}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Top
                  </FormLabel>
                </div>
              </div>
              <div className={classes.bottomSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.bottom}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'bottom'
                    )}
                    value={modifiers.chairMod.bottom}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Bottom
                  </FormLabel>
                </div>
              </div>
              <div className={classes.insideRadiusSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.left}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'left'
                    )}
                    value={modifiers.chairMod.left}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Inside
                  </FormLabel>
                </div>
              </div>
              <div className={classes.outsideRadiusSwitch}>
                <div className={classes.gridToggle}>
                  <Checkbox
                    size="small"
                    checked={modifiers.chairMod.right}
                    onChange={handleSwitchChange(
                      AssetModifierKeys.chairMod,
                      'right'
                    )}
                    value={modifiers.chairMod.right}
                  />
                  <FormLabel className={classes.tabSettingsLabel}>
                    Outside
                  </FormLabel>
                </div>
              </div>
              <div className={classes.serpentine}>CHAIR PLACEMENT</div>
            </div>
        )}
      </TabPanel>
      {modifiers.centerpieceMod.centerpieceAsset && (
        <TabPanel
          className={classes.tabPanelSettings}
          value={tableConfigTabIndex}
          index={TabIndex.CenterPiece}
        >
          <div className={classes.settings}>
            <FormLabel className={classes.tabSettingsLabel}>Size</FormLabel>
            <PlacezSlider
              className={classes.settingSlider}
              value={Utils.scaleFactorFromScale(
                modifiers.centerpieceMod?.transformation?.[0] ?? 1
              )}
              min={-3.0}
              step={0.1}
              max={3.0}
              onChange={(e, v) => {
                const scalar = Utils.scaleFactor(v as number);
                const transformation = new Matrix4()
                  .makeScale(scalar, scalar, scalar)
                  .toArray();
                handleAssetModOnChange(
                  AssetModifierKeys.centerpieceMod,
                  'transformation'
                )(e, transformation);
              }}
              marks={[{ value: 0 }]}
              aria-labelledby="input-slider"
              track={false}
            />
          </div>
        </TabPanel>
      )}
      <TabPanel
        className={classes.tabPanelSettings}
        value={tableConfigTabIndex}
        index={TabIndex.PlaceSetting}
      >
        <div className={classes.settings}>
          <FormLabel className={classes.tabSettingsLabel}>
            Distance
          </FormLabel>
          <PlacezSlider
            className={classes.settingSlider}
            value={Utils.unitsOutNumber(
              modifiers.placeSettingMod.distance ?? 0,
              smallUnits,
              [ValidUnits.ft, ValidUnits.ftIn].includes(smallUnits) ? 1 : 0
            )}
            min={0}
            max={Utils.convertUnitsFromTo(15, 'in', smallUnits)}
            onChange={(e, v) => {
              handleAssetModOnChange(
                AssetModifierKeys.placeSettingMod,
                'distance'
              )(e, Utils.convertUnitsFromTo(v, smallUnits, 'cm'));
            }}
            aria-labelledby="input-slider"
            valueLabelDisplay="auto"
            step={0.1}
          />
        </div>
      </TabPanel>
      {modifiers.linenMod.linenAsset && (
        <TabPanel
          className={classes.tabPanelSettings}
          value={tableConfigTabIndex}
          index={TabIndex.Linen}
        >
          <div className={classes.settings}>
            <FormLabel className={classes.tabSettingsLabel}>Length</FormLabel>
            <PlacezSlider
              className={classes.settingSlider}
              value={modifiers.linenMod?.transformation?.[5] ?? 1}
              min={0.2}
              max={2}
              step={0.1}
              onChange={(e, v) => {
                const transformation = new Matrix4()
                  .makeScale(1, v as number, 1)
                  .toArray();
                handleAssetModOnChange(
                  AssetModifierKeys.linenMod,
                  'transformation'
                )(e, transformation);
              }}
              aria-labelledby="input-slider"
              track={false}
            />
          </div>
        </TabPanel>
      )}
    </div>
  );
}

function tabProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const TabsPanel = (props: Props) => {
  const { tableConfigTabIndex, handleTabChange, modifiers } = props;
  const classes = styles(props);

  const [showSettings, setShowSettings] = useState(true);

  const theme = useTheme()

  return (
    <>
      <Tabs
        value={tableConfigTabIndex}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Table Configuration"
      >
        <Tab
          label="Chair"
          {...tabProps(0)}
          icon={
            modifiers?.chairMod?.chairAsset ?
            <div className={classes.tabPanelIcon}>
              <img
                style={{width: '100px', height: '80px'}}
                src={Utils.getAssetUrl(window, modifiers?.chairMod?.chairAsset)}
                alt={''}
              />
            </div>
            :
            <div className={classes.tabPanelIcon}>
              <EventSeat fontSize='large' color={tableConfigTabIndex  === TabIndex.Chair ? 'primary' : 'secondary'}/>
            </div>
          }
          classes={{
            labelIcon: classes.tabLabelIcon,
            selected: classes.tabsIndicator,
          }}
        />
        <Tab
          label="Center Piece"
          {...tabProps(1)}
          icon={
            modifiers?.centerpieceMod?.centerpieceAsset ?
            <div className={classes.tabPanelIcon}>
              <img
                style={{width: '100px', height: '80px'}}
                src={Utils.getAssetUrl(window, modifiers?.centerpieceMod?.centerpieceAsset)}
                alt={''}
              />
            </div>
            :
            <div className={classes.tabPanelIcon}>
              <CenterpieceIcon fontSize='large' color={tableConfigTabIndex  === TabIndex.CenterPiece ? 'primary' : 'secondary'}/>
            </div>
          }
          classes={{
            labelIcon: classes.tabLabelIcon,
            selected: classes.tabsIndicator,
          }}
        />
        <Tab
          label="Place Setting"
          {...tabProps(2)}
          icon={
            modifiers?.placeSettingMod?.placeSettingAsset ?
            <div className={classes.tabPanelIcon}>
              <img
                style={{width: '100px', height: '80px'}}
                src={Utils.getAssetUrl(window, modifiers?.placeSettingMod?.placeSettingAsset)}
                alt={''}
              />
            </div>
            :
            <div className={classes.tabPanelIcon}>
              <PlaceSettingIcon fontSize='large' color={tableConfigTabIndex  === TabIndex.PlaceSetting ? 'primary' : 'secondary'}/>
            </div>
          }
          classes={{
            labelIcon: classes.tabLabelIcon,
            selected: classes.tabsIndicator,
          }}
        />
        <Tab
          label="Linen"
          {...tabProps(3)}
          icon={
            modifiers?.linenMod?.linenAsset ?
            <div className={classes.tabPanelIcon}>
              <img
                style={{width: '100px', height: '80px'}}
                src={Utils.getAssetUrl(window, modifiers?.linenMod?.linenAsset)}
                alt={''}
              />
            </div>
            :
            <div className={classes.tabPanelIcon}>
              <LinenIcon fontSize='large' color={tableConfigTabIndex  === TabIndex.Linen ? 'primary' : 'secondary'}/>
            </div>
          }
          classes={{
            labelIcon: classes.tabLabelIcon,
            selected: classes.tabsIndicator,
          }}
        />
      </Tabs>
      {RenderTabSettins(props, showSettings, setShowSettings)}
    </>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      margin: 5,
      marginTop: '10px',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
    },
    tabPanelIcon: {
      height: '80px !important',
      width: '80px !important',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabelIcon: {
      padding: 0,
      margin: 0,
    },
    tabPanelLinen: {
      height: 51,
      width: 51,
      marginTop: 12,
      borderRadius: '50%',
    },
    tabPanelSettings: {
      ...theme.typography.body1,
      padding: '2px',
      // background: theme.palette.background.paper,
      background: theme.palette.background.shadow,
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    tabFormControl: {
      flex: '1',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    gridToggle: {
      flex: '1',
      display: 'flex',
      justifyContent: 'center',
    },
    hiddenToggle: {
      flex: '1',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    tabSettingsLabel: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.typography.body1,
      marginLeft: 15,
      fontSize: 11,
    },
    settingSlider: {
      marginLeft: 10,
      width: '190px !important',
    },
    settings: {
      display: 'grid',
      width: '100%',
      minWidth: '0px',
      gridTemplateColumns: '1fr 1fr',
      rowGap: '2px',
      gridAutoRows: '32px'
    },
    chairPlacementContainer: {
      display: 'grid',
      gridTemplateColumns: '100px 100px 100px',
      gridTemplateRows: '60px 60px 60px',
      alignItems: 'center',
      justifyContent: 'center',
    },
    topSwitch: {
      gridRowStart: '1',
      gridColumnStart: '2',
    },
    bottomSwitch: {
      gridRowStart: '3',
      gridColumnStart: '2',
    },
    outsideRadiusSwitch: {
      gridRow: '1',
      gridColumn: '3',
    },
    insideRadiusSwitch: {
      gridRow: '3',
      gridColumn: '1',
    },
    center: {
      gridRowStart: '2',
      gridColumnStart: '2',
      border: `solid 2px ${theme.palette.secondary.main}`,
      lineHeight: '2',
      fontSize: 11,
      textAlign: 'center',
      padding: 6,
      color: theme.palette.text.secondary,
      height: '100%',
    },
    serpentine: {
      gridRow: '2',
      gridColumn: '2',
      border: `solid 2px ${theme.palette.secondary.main}`,
      borderRadius: '0 50% 0 0',
      lineHeight: '2',
      fontSize: 11,
      textAlign: 'center',
      padding: 6,
      color: theme.palette.text.secondary,
      height: '100%',
    },
    leftSwitch: {
      gridRow: '2',
      gridColumn: '1',
    },
    rightSwitch: {
      gridRow: '2',
      gridColumn: '3',
    },
    tabsIndicator: {
      color: `${theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.common.white} !important`,
    },
    sweetheart: {
      gridRowStart: '2',
      gridColumnStart: '2',
      border: `solid 2px ${theme.palette.secondary.main}`,
      borderRadius: '0 0 50% 50%',
      lineHeight: '2',
      fontSize: 11,
      textAlign: 'center',
      padding: 6,
      color: theme.palette.text.secondary,
      height: '100%',
    },
    iconButton: {
      padding: '0px',
    },
  })
);

export default TabsPanel;
