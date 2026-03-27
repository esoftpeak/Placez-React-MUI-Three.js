import { useState, useEffect, Fragment, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Theme,
  Typography,
  FormLabel,
  Button,
  Tooltip,
  TextField,
  Tabs,
  Tab,
  useTheme,
  Checkbox,
  Select,
  MenuItem,
} from '@mui/material';

import {
  Settings,
  ClearOutlined,
  Lock,
  LockOpen,
  ViewList,
  EditOutlined,
  Highlight,
} from '@mui/icons-material';

import { HandlesFromBlue } from '../../../models';

import {
  Asset,
  AssetModifierKeys,
  Labels,
  SkuType,
} from '../../../../../blue/items/asset';
import { Item, isFloorItem } from '../../../../../blue/items/item';
import TableConfigModal from '../../../../Modals/TableConfigModal';
import panelStyles from '../../../../Styles/panels.css';
import { ReduxState } from '../../../../../reducers';

import { ValidUnits } from '../../../../../api/placez/models/UserSetting';
import { BillingRate, Utils } from '../../../../../blue/core/utils';
import {
  SaveAssetGroupAction,
  SaveCustomAsset,
} from '../../../../../reducers/asset';
import { WallItem } from '../../../../../blue/items/wall_item';
import { WallFloorItem } from '../../../../../blue/items/wall_floor_item';
import { InWallFloorItem } from '../../../../../blue/items/in_wall_floor_item';
import { CeilingItem } from '../../../../../blue/items/ceiling_item';
import {
  InitBatchItem,
  NeedSaveAction,
  SetSelectedItems,
} from '../../../../../reducers/blue';
import { makeStyles } from '@mui/styles';
import { ChangeToolState } from '../../../../../reducers/globalState';
import { GlobalViewState, ToolState } from '../../../../../models/GlobalState';
import EditUplightMod from '../EditUplightMod';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../../../Hooks/useLocalStorageState';
import NumberEditor from '../../../../NumberEditor';
import { getInventory } from '../../../../../blue/model/scene';
import EditSize from '../../utility/EditSize';
import RotationControls from '../../utility/RotationControls';
import PlacezSlider from '../../../../PlacezUIComponents/PlacezSlider';
import PlacezTextField from '../../../../PlacezUIComponents/PlacezTextField';
import AlignItems from './AlignItems';

interface Props {
  handlesFromBlue: HandlesFromBlue;
  onBack: Function;
}

enum TabOptions {
  itemInfo = 'itemInfo',
  selectedItems = 'selectedItems',
  editUplightMod = 'editUplightMod',
}

const EditItemPanel = (props: Props) => {
  const theme: Theme = useTheme();
  const styles = makeStyles<Theme>(panelStyles);
  const dispatch = useDispatch();

  const [itemSelected, setItemSelected] = useState<Item>(undefined);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<TabOptions>(TabOptions.itemInfo);
  const [groupLabel, setGroupLabel] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);

  const selectedItems = useSelector(
    (state: ReduxState) => state.blue.selectedItems
  );
  const units = useLocalStorageSelector<ValidUnits>(LocalStorageKey.Units);
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );
  const customSkus = useSelector((state: ReduxState) => state.asset.customSkus);
  const globalViewState: GlobalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);

  const [previousSelectedAmount, setPreviousSelectedAmount] =
    useState<number>(0);
  const [inventoryList, setInventoryList] = useState<
    { description: string; quantity: number }[]
  >([]);

  useEffect(() => {
    if (
      selectedItems.length > 1 &&
      selectedItems.length !== previousSelectedAmount
    ) {
      setTabIndex(TabOptions.selectedItems);
      const inventory = getInventory(selectedItems).map((item) => {
        return {
          description: assetsBySku[item.assetSku]?.name,
          quantity: item.count,
        };
      });
      setInventoryList(inventory);
    }
    setPreviousSelectedAmount(selectedItems.length);
  }, [selectedItems]);

  let rotationSubscription = undefined;

  useEffect(() => {
    return () => {
      rotationSubscription?.unsubscribe();
    };
  }, []);

  const selectItem = () => {
    const list: Item[] = selectedItems;
    const obj = list[0];
    if (rotationSubscription) {
      rotationSubscription.unsubscribe();
    }

    if (obj) {
      rotationSubscription = obj.events.rotation.subscribe(
        (rotation: THREE.Euler) => {
          setRotation(Utils.convertToDegrees(rotation.y));
        }
      );

      setItemSelected(obj);
      setRotation(Utils.convertToDegrees(obj.getRotation()));
    }
  };

  const setSpacing = (e, value) => {
    if (itemSelected) {
      props.handlesFromBlue.setAssetProp(
        selectedItems,
        'spacing',
        Utils.convertToCM(parseFloat(value))
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const setCovidSpacing = (e?) => {
    const distance = Utils.convertUnitsFromTo(36, 'in', units);
    if (itemSelected) {
      props.handlesFromBlue.setAssetProp(
        selectedItems,
        'spacing',
        Utils.convertToCM(distance)
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const rotate = (angle?: number) => {
    if (itemSelected) {
      props.handlesFromBlue.rotateItemTo(selectedItems, angle);
    }
    const returnedRotation = Utils.convertToDegrees(itemSelected.getRotation());
    setRotation(itemSelected ? returnedRotation : 0);
    dispatch(NeedSaveAction(true));
    (window as any).gtag('event', 'edit_item', 'rotate_icon');
  };

  const setRotationInput = (e) => {
    const input = parseInt(e.target.value, 10);
    const newAngle = isNaN(input) ? 0 : input;
    const rotation = -Utils.convertToRadians(newAngle);

    if (itemSelected) {
      props.handlesFromBlue.rotateItemTo(selectedItems, rotation);
    }
    const returnedRotation = Utils.convertToDegrees(itemSelected.getRotation());

    setRotation(itemSelected ? returnedRotation : 0);
    dispatch(NeedSaveAction(true));
    (window as any).gtag('event', 'edit_item', 'rotate_input');
  };

  const setLabelSize = (e, value) => {
    if (itemSelected) {
      props.handlesFromBlue.setExtensionProp(
        selectedItems,
        'fontSize',
        value || 32
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const setSpacingLocked = (e) => {
    if (itemSelected) {
      setCovidSpacing();
      props.handlesFromBlue.setExtensionProp(
        selectedItems,
        'spacingLocked',
        e.target.checked
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const setHeight = (height?: number) => {
    if (itemSelected) {
      props.handlesFromBlue.setItemHeight(selectedItems, height);
    }
    dispatch(NeedSaveAction(true));
  };

  const setLabel = (labelType: keyof Labels) => (e) => {
    if (itemSelected) {
      props.handlesFromBlue.setItemLabel(
        selectedItems,
        labelType,
        e.target.value
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const setStringProp = (assetProperty: keyof Asset) => (e) => {
    if (itemSelected) {
      props.handlesFromBlue.setAssetProp(
        selectedItems,
        assetProperty,
        e.target.value
      );
    }
    dispatch(NeedSaveAction(true));
  };

  useEffect(() => {
    if (selectedItems?.length > 0) {
      setGroupLabel('');
      selectItem();
    } else {
      if (rotationSubscription) {
        rotationSubscription.unsubscribe();
      }
      setItemSelected(undefined);
    }
  }, [selectedItems]);

  const deleteSelected = () => {
    props.handlesFromBlue.removeItems(selectedItems);
  };

  const copySelected = () => {
    (window as any).gtag('event', 'edit_item', 'copy_button');
    props.handlesFromBlue.copyItems();
  };

  const onCustomize = (item: Item) => {
    item.update();
    setShowSettings(true);
  };

  const onConfigureCancel = () => {
    setShowSettings(false);
  };

  const cancelEdit = () => {
    selectedItems.forEach((item: Item) => {
      item.setUnselected();
    });
    dispatch(SetSelectedItems([]));
  };

  const onTableConfigured = (configuredItem: Asset) => {
    setShowSettings(false);
    props.handlesFromBlue.copyCommonAsset(configuredItem);
    dispatch(InitBatchItem(selectedItems[0].asset));
  };

  const handleDragAsset = (event: any, dragType: string) => {
    const asset = itemSelected.asset as Asset;
    props.handlesFromBlue.onDragAndDrop(event, asset, dragType);
    (window as any).gtag('event', 'edit_item', 'drag_copy');
  };

  const handleItemSelect = (event: any, instanceId: string) => {
    // sort item to top of selected list
  };

  const setBoolProp = (assetProperty) => (e) => {
    if (itemSelected) {
      props.handlesFromBlue.setAssetProp(
        selectedItems,
        assetProperty,
        e.target.value
      );
    }
    dispatch(NeedSaveAction(true));
  };

  const onFavoriteAsset = () => {
    selectedItems[0].asset.name = selectedItems[0].asset.labels?.titleLabel
      ? selectedItems[0].asset.labels.titleLabel
      : selectedItems[0].asset.name;

    // TODO put save as in Utils
    if (
      selectedItems[0].asset.modifiers !== undefined &&
      selectedItems[0].asset.extensionProperties.progenitorId === undefined
    ) {
      const progenitorId = selectedItems[0].asset.sku;
      selectedItems[0].asset.sku = Utils.guid(); // is wrong should not edit directly
      selectedItems[0].asset.extensionProperties = {
        ...selectedItems[0].asset.extensionProperties,
        progenitorId,
      };
    }
    dispatch(SaveCustomAsset(selectedItems[0].asset));
  };

  const onFixAsset = (fixed: boolean) => {
    props.handlesFromBlue.fixItems(selectedItems, fixed);
    dispatch(NeedSaveAction(true));
  };

  const setItemSize = (width, depth, height) => {
    selectedItems.forEach((item: Item) => {
      if (item.asset.sku === itemSelected.asset.sku) {
        item.resize(height, width, depth);
      }
    });
    dispatch(NeedSaveAction(true));
  };

  const classes = styles(props);

  const price = useMemo(() => {
    if (itemSelected) {
      return itemSelected.priceAsset();
    }
    return 0;
  }, [itemSelected]);

  return (
    <div className={classes.root}>
      {itemSelected && (
        <>
          <div className={classes.panelUpper}>
            {(selectedItems.length > 1 ||
              selectedItems[0]?.asset?.modifiers?.uplightMod) && (
              <Tabs
                className={classes.tabs}
                value={tabIndex}
                onChange={(e, v) => setTabIndex(v)}
                variant="fullWidth"
                indicatorColor="secondary"
                textColor="primary"
                aria-label="Table Configuration"
              >
                <Tooltip title="Edit Selected Objects">
                  <Tab
                    className={classes.tabIcon}
                    color="secondary"
                    value={TabOptions.itemInfo}
                    icon={<EditOutlined />}
                  />
                </Tooltip>
                {selectedItems.length > 1 && (
                  <Tooltip title="Selection List">
                    <Tab
                      className={classes.tabIcon}
                      value={TabOptions.selectedItems}
                      icon={<ViewList />}
                    />
                  </Tooltip>
                )}
                {selectedItems[0]?.asset?.modifiers?.uplightMod && (
                  <Tab
                    className={classes.tabIcon}
                    value={TabOptions.editUplightMod}
                    icon={<Highlight />}
                  />
                )}
              </Tabs>
            )}
          </div>
          {tabIndex === TabOptions.itemInfo && (
            <>
              <div className={classes.panelLower}>
                <div
                  className={classes.itemImage}
                  draggable={true}
                  onDragEnd={(e: any) => handleDragAsset(e, 'stop')}
                  onTouchEnd={(e: any) => handleDragAsset(e, 'stop')}
                  style={{
                    backgroundImage: `url(${import.meta.env.VITE_APP_PLACEZ_API_URL}/${itemSelected.asset.previewPath}), radial-gradient(#f5f5f5, #909090)`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '400px',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '10px',
                      }}
                    >
                      {SkuType[itemSelected.asset.skuType] === SkuType.TBL && (
                        <Settings
                          className={classes.itemSettings}
                          style={{
                            color: theme.palette.primary.main,
                          }}
                          onClick={() => onCustomize(itemSelected)}
                        />
                      )}
                      <Tooltip title="Deselect">
                        <ClearOutlined
                          color="primary"
                          onClick={cancelEdit}
                          className={classes.cancelButton}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    margin: '10px',
                  }}
                ></div>
                <div className={classes.fieldGrid}>
                  <div className={classes.rowContainer}>
                    <div className={classes.columnContainer}>
                      <Typography variant="body1">Name</Typography>
                      <Typography
                        variant="caption"
                        style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
                      >
                        {itemSelected.asset.name}
                      </Typography>
                    </div>
                    <div className={classes.columnContainer}>
                      <Typography variant="body1">SKU</Typography>
                      <Typography variant="caption">
                        {itemSelected.asset?.vendorSku !== '' &&
                        itemSelected.asset?.vendorSku !== undefined
                          ? itemSelected.asset?.vendorSku
                          : '??'}
                      </Typography>
                    </div>
                  </div>
                  <div className={classes.rowContainer}>
                    <div className={classes.columnContainer}>
                      <Typography variant="body1">Price</Typography>
                      <Typography variant="caption">
                        ${itemSelected.asset.price || price || 0.0}
                      </Typography>
                    </div>
                    <div className={classes.columnContainer}>
                      <Typography variant="body1">Rate</Typography>
                      <Typography variant="caption">
                        {BillingRate[itemSelected.asset.priceRateInHours ?? 0]}
                      </Typography>
                    </div>
                  </div>
                  {/* <FormLabel className={classes.fieldHeading}>
                  Label
                </FormLabel>
                <PlacezTextField
                  className={classes.labelInput}
                  name="label"
                  type="text"
                  onChange={setLabel('titleLabel')}
                  value={itemSelected.asset.labels.titleLabel}
                  onKeyDown={(e) => e.stopPropagation()}
                  multiline
                />
              <FormLabel className={classes.fieldHeading}>
                Show Label
              </FormLabel> */}
                  {/* <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                {itemSelected.asset.showLabel && (
                  <Tooltip title="Hide">
                    <Visibility
                      className={classes.itemSettings}
                      onClick={() => {
                        toggleBoolProp('showLabel')(false)
                      }}
                      style={{
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Tooltip>
                )}
                {!itemSelected.asset.showLabel && (
                  <Tooltip title="Show">
                    <VisibilityOff
                      className={classes.itemSettings}
                      onClick={() => {
                        toggleBoolProp('showLabel')(true)
                      }}
                    />
                  </Tooltip>
                )}
              </div> */}
                  <FormLabel className={classes.fieldHeading}>Name</FormLabel>
                  <PlacezTextField
                    className={classes.labelInput}
                    name="info"
                    type="text"
                    multiline
                    onChange={setStringProp('name')}
                    value={itemSelected.asset.name}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <FormLabel className={classes.fieldHeading}>Info</FormLabel>
                  <PlacezTextField
                    className={classes.labelInput}
                    name="info"
                    type="text"
                    multiline
                    onChange={setLabel('titleLabel')}
                    value={itemSelected.asset.labels.titleLabel}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <FormLabel className={classes.fieldHeading}>Price</FormLabel>
                  <PlacezTextField
                    className={classes.labelInput}
                    name="price"
                    type="text"
                    multiline
                    onChange={setStringProp('price')}
                    value={itemSelected.asset.price}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <FormLabel className={classes.fieldHeading}>Rate</FormLabel>
                  <Select
                    className={classes.labelInput}
                    style={{ flex: 1 }}
                    id="placeSelect"
                    variant="standard"
                    value={itemSelected.asset.priceRateInHours}
                    onChange={setStringProp('priceRateInHours')}
                  >
                    {Object.values(BillingRate)
                      .filter((v) => isNaN(Number(v)))
                      .map((rate) => (
                        <MenuItem key={rate} value={BillingRate[rate]}>
                          {rate}
                        </MenuItem>
                      ))}
                  </Select>
                  {isFloorItem(itemSelected.asset.classType) && (
                    <>
                      <FormLabel className={classes.fieldHeading}>
                        {/* <FormatLineSpacing fontSize='small'/> */}
                        Item Rotation
                      </FormLabel>
                      <RotationControls
                        rotation={rotation}
                        setRotation={rotate}
                        label="Label "
                      />
                    </>
                  )}
                  <FormLabel className={classes.fieldHeading}>
                    Lock Selection
                  </FormLabel>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginRight: '7px',
                    }}
                  >
                    {itemSelected.asset.extensionProperties?.fixed && (
                      <Tooltip title="Locked">
                        <Lock
                          className={classes.itemSettings}
                          onClick={() => {
                            onFixAsset(false);
                          }}
                          style={{
                            color: theme.palette.primary.main,
                          }}
                        />
                      </Tooltip>
                    )}
                    {(!itemSelected.asset.extensionProperties ||
                      !itemSelected.asset.extensionProperties.fixed) && (
                      <Tooltip title="Unlocked">
                        <LockOpen
                          className={classes.itemSettings}
                          onClick={() => {
                            onFixAsset(true);
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>

                  {selectedItems.every((item: Item) => {
                    return (
                      (item instanceof WallItem &&
                        !(item instanceof WallFloorItem) &&
                        !(item instanceof InWallFloorItem)) ||
                      item instanceof CeilingItem
                    );
                  }) && (
                    <div className={classes.modGroup}>
                      <div className={classes.headingContainer}>
                        <Typography className={classes.heading} align="center">
                          Edit Position
                        </Typography>
                      </div>
                      <div className={classes.fieldContainer}>
                        <FormLabel className={classes.fieldHeading}>
                          Height ({units})
                        </FormLabel>
                        <NumberEditor
                          value={itemSelected.position.y}
                          onChange={(value) => {
                            setHeight(value);
                          }}
                          step={1}
                          round={1}
                          dark
                          allowZero
                        />
                      </div>
                    </div>
                  )}
                  {(SkuType[itemSelected.asset.skuType] === SkuType.CHR ||
                    SkuType[itemSelected.asset.skuType] === SkuType.TBL) && (
                    <>
                      <FormLabel className={classes.fieldHeading}>
                        Do Not Count Item
                      </FormLabel>
                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <Checkbox
                          size="small"
                          checked={
                            itemSelected.asset.extensionProperties
                              .excludeFromChairCount
                          }
                          onChange={setBoolProp('excludeFromChairCount')}
                          value={'test'}
                        />
                      </div>
                    </>
                  )}
                  {itemSelected.asset.resizable && (
                    <EditSize
                      itemSelected={itemSelected}
                      onChange={setItemSize}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormLabel className={classes.fieldHeading}>
                      Spacing
                    </FormLabel>
                    {!itemSelected.asset?.extensionProperties
                      ?.spacingLocked && (
                      <>
                        <div>
                          <PlacezTextField
                            style={{ width: '80%' }}
                            type="number"
                            value={Utils.unitsOutNumber(
                              itemSelected.asset.spacing ?? 0,
                              undefined,
                              [ValidUnits.ft, ValidUnits.ftIn].includes(units)
                                ? 1
                                : 0
                            )}
                            onChange={(e) =>
                              setSpacing(undefined, e.target.value)
                            }
                          />
                          {units}
                        </div>
                        <div></div>
                        <PlacezSlider
                          value={Utils.unitsOutNumber(
                            itemSelected.asset.spacing ?? 0,
                            undefined,
                            [ValidUnits.ft, ValidUnits.ftIn].includes(units)
                              ? 1
                              : 0
                          )}
                          step={1}
                          min={0}
                          max={Utils.convertUnitsFromTo(
                            2,
                            'm',
                            Utils.getUnit()
                          )}
                          valueLabelDisplay="auto"
                          onChange={setSpacing}
                          marks={[
                            {
                              value: Utils.convertUnitsFromTo(36, 'in', units),
                            },
                          ]}
                        />
                        <div></div>
                      </>
                    )}
                  </div>
                  {selectedItems.length > 1 && (
                    <AlignItems handlesFromBlue={props.handlesFromBlue} />
                  )}
                </div>
              </div>
              <div className={classes.panelFooter}>
                <div className={classes.fieldGrid}>
                  <Button onClick={copySelected} variant="outlined">
                    Copy
                  </Button>
                  <Button
                    onClick={deleteSelected}
                    variant="outlined"
                    classes={{
                      root: classes.deleteButton,
                    }}
                  >
                    Delete
                  </Button>
                  {selectedItems.length <= 1 &&
                    globalViewState !== GlobalViewState.Fixtures && (
                      <>
                        <Button onClick={onFavoriteAsset} variant="outlined">
                          Add To Favorites
                        </Button>
                        <Button
                          onClick={(e) => {
                            dispatch(
                              InitBatchItem(selectedItems[0].asset, () =>
                                dispatch(ChangeToolState(ToolState.NewBatch))
                              )
                            );
                          }}
                          variant="outlined"
                        >
                          Pattern
                        </Button>
                      </>
                    )}
                </div>
              </div>
            </>
          )}
          {tabIndex === TabOptions.selectedItems && (
            <>
              <div className={classes.panelUpper}>
                <TextField
                  style={{
                    width: '100%',
                    padding: '5px',
                  }}
                  label="New Group Label"
                  value={groupLabel}
                  onChange={(e) => {
                    setGroupLabel(e.target.value);
                  }}
                />

                <div className={classes.buttonDiv}>
                  <Button
                    color="primary"
                    className={classes.button}
                    variant="contained"
                    disabled={groupLabel === ''}
                    onClick={() =>
                      dispatch(SaveAssetGroupAction(selectedItems, groupLabel))
                    }
                  >
                    Save Group
                  </Button>
                </div>
                {/* <List component="nav" aria-label="main mailbox folders">
                {selectedItems.map((item: Item) =>
                  <ListItem
                    button
                    selected={selectedItemIndex === selectedItems.findIndex((slItem: Item) => slItem.asset.instanceId === item.asset.instanceId)}
                    onClick={event => handleItemSelect(event, item.asset.instanceId)}
                    key={item.asset.instanceId}
                  >
                    <ListItemText primary={item.asset.labels.titleLabel} />
                  </ListItem>
                )}
              </List> */}
              </div>
              <div className={classes.panelLower}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 30px',
                    width: '260px',
                    margin: 'none',
                    padding: '4px',
                  }}
                >
                  {inventoryList.map((data, index) => (
                    <Fragment key={index}>
                      <Typography variant="h6">{data.description}</Typography>
                      <Typography
                        variant="body1"
                        style={{ textAlign: 'right' }}
                      >
                        {data.quantity}
                      </Typography>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div className={classes.panelFooter}></div>
            </>
          )}
          {tabIndex === TabOptions.editUplightMod && (
            <EditUplightMod
              modifier={AssetModifierKeys.uplightMod}
              params={selectedItems[0]?.asset?.modifiers}
              onModifierChange={(key, value) =>
                props.handlesFromBlue.setAssetProp(selectedItems, 'modifiers', {
                  ...itemSelected.asset.modifiers,
                  [key]: value,
                })
              }
            />
          )}

          <TableConfigModal
            asset={itemSelected.asset}
            tableConfigModalOpen={showSettings}
            onTableConfigured={onTableConfigured}
            onConfigureCancel={onConfigureCancel}
          />
        </>
      )}
    </div>
  );
};

export default EditItemPanel;
