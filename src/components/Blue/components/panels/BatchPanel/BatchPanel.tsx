import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Theme,
  FormLabel,
  Button,
  Tooltip,
  Checkbox,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { ClearOutlined } from '@mui/icons-material';
import panelStyles from '../../../../Styles/panels.css';
import { ReduxState } from '../../../../../reducers';
import { Utils } from '../../../../../blue/core/utils';
import {
  BatchAddParams,
  BatchTypes,
} from '../../../../../blue/model/batchPatterns';
import { TableTypes } from '../../../../../blue/itemModifiers/ChairMod';
import {
  ApplyBatch,
  CancelBatch,
  SetBatchSettings,
} from '../../../../../reducers/blue';
import { SkuType } from '../../../../../blue/items/asset';
import NumberEditor from '../../../../NumberEditor';
import PlacezTextField from '../../../../PlacezUIComponents/PlacezTextField'
import classNames from 'classnames'
import RotationControls from '../../utility/RotationControls'
import GridSelect from '../AddItemPanel/GridSelect'
import DotMatrixBatchPatternTile from './DotMatrixBatchPatternTile'
import { HelpOptions } from '../../../../../Context Providers/HelpProvider/HelpOptions'
import { useHelp } from '../../../../../Context Providers/HelpProvider/HelpContext'

interface Props {
  onBack: Function;
}

const BatchPanel = (props: Props) => {
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(panelStyles);
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );

  const batchSettings: BatchAddParams = useSelector(
    (state: ReduxState) => state.blue.batchSettings
  );

  const { showHelp } = useHelp();

  useEffect(() => {
    // this kicks off batching in controller since tool state has been set
    dispatch(SetBatchSettings(batchSettings));
    showHelp(HelpOptions.BatchPanel);

  }, []);

  const confirmBatch = () => {
    dispatch(ApplyBatch());
  };

  const cancel = () => {
    dispatch(
      SetBatchSettings({
        ...batchSettings,
        maxGuest: 0,
      })
    );
    dispatch(SetBatchSettings());
  };

  const configureBatch = (batchItem: {name: BatchTypes}) => {
    const batchType = batchItem.name;
    switch (batchType) {
      case BatchTypes.grid:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
            skew: 0,
            rowAisleSpacing: 0,
            numberOfRowAisles: 0,
            rowSpacing: Utils.convertUnitsFromTo(36, 'in', 'cm'),
            colSpacing: Utils.convertUnitsFromTo(36, 'in', 'cm'),
          })
        );
        break;
      case BatchTypes.banquet:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
            skew: 0,
          })
        );
        break;
      case BatchTypes.family:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
          })
        );
        break;
      case BatchTypes.theater:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
            skew: (30 / 180) * Math.PI,

            rowAisleSpacing: 48,
            numberOfRowAisles: 2,
            rowSpacing: 0,
            rotation: 0,
          })
        );
        break;
      case BatchTypes.uShape:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
            skew: 0,
          })
        );
        break;
      case BatchTypes.hollowSquare:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
            skew: 0,
          })
        );
        break;
      case BatchTypes.cabaret:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
            skew: 0,
            rowSpacing: 24,
            colSpacing: 24,
          })
        );
        break;
      case BatchTypes.circle:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
          })
        );
        break;
      case BatchTypes.horseshoe:
        dispatch(
          SetBatchSettings({
            ...batchSettings,
            batchType,
          })
        );
        break;
      default:
        break;
    }
  };

  const backToItem = () => {
    dispatch(CancelBatch());
  };

  const setLength = (prop) => (value) => {
    if (isNaN(value)) return;
    dispatch(
      SetBatchSettings({
        ...batchSettings,
        [prop]: value ?? 0,
      })
    );
  };

  const setAngle = (prop) =>
    (angle) => {
      dispatch(
        SetBatchSettings({
          ...batchSettings,
          [prop]: angle,
        })
      );
    };


  const adjustAngle =
    (prop, currentValue: number, adjustmentAngle: number, direction: -1 | 1) =>
    () => {
      dispatch(
        SetBatchSettings({
          ...batchSettings,
          [prop]: currentValue + direction * adjustmentAngle,
        })
      );
    };

  const setSpacing = (value) => (e) => {
    if (isNaN(value) || value === 0) return;
    dispatch(
      SetBatchSettings({
        ...batchSettings,
        colSpacing: value || 0,
        rowSpacing: value || 0,
      })
    );
  };

  const classes = styles(props);

  const [tabIndex, setTabIndex] = useState<number>(0);
  const [fitObjectsInSelectionBox, setFitObjectsInSelectionBox] = useState<boolean>(true);

  const {
    asset,
    batchType,
    rowSpacing,
    colSpacing,
    rowAisleSpacing,
    columnAisleSpacing,
    numberOfRowAisles,
    numberOfColumnAisles,
    rotation,
    skew,
    maxGuest,
    batchRows,
    batchColumns,
  } = batchSettings;

  const batchOptions = [
    {
      name: BatchTypes.grid,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]}
            />,
      label: 'Grid'
    }, {
      name: BatchTypes.banquet,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[true, false, true, false, false, true, false, true, true, false, true, false, false, true, false, true]}
            />,
      label: 'Banquet'
    }]
  if ([SkuType.CHR, SkuType.BEN].includes(
    SkuType[asset?.skuType]) ||
    (SkuType[asset?.skuType] === SkuType.TBL)
  ) batchOptions.push({
    name: BatchTypes.theater,
    icon: <DotMatrixBatchPatternTile
            rowColCount={4}
            pattern={[false, true, true, true, true, true, true, false, true, true, true, false, false, true, true, true]}
          />,
    label: 'Theater'
  })
  if (SkuType[asset?.skuType] === SkuType.TBL &&
    asset?.modifiers?.chairMod &&
    [TableTypes.Banquet, TableTypes.Square].includes(
      asset?.modifiers?.chairMod.tableType
    )
  ) batchOptions.push(
    {
      name: BatchTypes.family,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[
                false, true, true, false,
                false, true, true, false,
                false, true, true, false,
                false, true, true, false
              ]}
            />,
      label: 'Family'
    },
    {
      name: BatchTypes.hollowSquare,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[
                true, true, true, true,
                true, false, false, true,
                true, false, false, true,
                true, true, true, true]}
            />,
      label: 'Hollow Square'
    },
    {
      name: BatchTypes.uShape,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[
                true, true, true, true,
                true, false, false, true,
                true, false, false, true,
                true, false, false, true
              ]}
            />,
      label: 'U-Shape'
    }
  )
  if (SkuType[asset?.skuType] === SkuType.TBL &&
    asset?.modifiers?.chairMod &&
    [TableTypes.Round, TableTypes.Oval].includes(
      asset?.modifiers?.chairMod.tableType
    )
  ) batchOptions.push({
    name: BatchTypes.cabaret,
    icon: <DotMatrixBatchPatternTile
            rowColCount={4}
            pattern={[
              true, false, true, false,
              false, true, false, true,
              true, false, true, false,
              false, true, false, true
            ]}
          />,
    label: 'Cabaret'
  })
  batchOptions.push(
    {
      name: BatchTypes.circle,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[
                false, true, true, false,
                true, false, false, true,
                true, false, false, true,
                false, true, true, false
              ]}
            />,
      label: 'Circle'
    },
    {
      name: BatchTypes.horseshoe,
      icon: <DotMatrixBatchPatternTile
              rowColCount={4}
              pattern={[
                false, true, true, false,
                true, false, false, true,
                true, false, false, true,
                true, false, false, true
              ]}
            />,
      label: 'Horseshoe'
    }
  )

  return (
    <div className={classes.root}>
      <div className={classes.panelUpper}>
      </div>

      <div className={classes.panelLower}>
        <div
          className={classes.itemImage}
          style={{
            backgroundImage: `url(${import.meta.env.VITE_APP_PLACEZ_API_URL}/Organization/${userProfile.organization_id}/MediaAssetFile/${asset?.sku}/preview), radial-gradient(#f5f5f5, #909090)`,
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
            }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'end',
                margin: '10px',
              }}
            >
              <Tooltip title="Cancel Batch">
                <ClearOutlined
                  color="primary"
                  onClick={backToItem}
                  className={classes.cancelButton}
                />
              </Tooltip>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '10px',
            }}
          >
          </div>
        </div>
        {/* <BatchSelect
          value={batchType}
          onChange={configureBatch}
        /> */}
        <GridSelect
          items={batchOptions}
          selectedItem={batchType}
          onSelectItem={configureBatch}
          showThisMany={4}
        />

        {/* <div className={classes.itemImageContainer}>
          <img
            className={classes.itemImage}
            alt={'image'}
            src={batchtype}
          />
        </div> */}

        <div
          style={{padding: '5px', height: '100%'}}
         >
        <div className={classNames(classes.fieldGrid, classes.shadowBackground)}>
        {[BatchTypes.grid, BatchTypes.banquet, BatchTypes.cabaret, BatchTypes.theater, BatchTypes.family].includes(batchType) &&
          <>
            <FormLabel className={classes.fieldHeading}>
              Fit in Selection Box
            </FormLabel>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Checkbox
                size="small"
                checked={ fitObjectsInSelectionBox}
                onChange={(e, checked) => {
                  if (checked) {
                    dispatch(
                      SetBatchSettings({
                        ...batchSettings,
                        batchRows: 0,
                        batchColumns: 0,
                      })
                    );
                  }
                  setFitObjectsInSelectionBox(checked)
                }}
                value={'test'}
              />
            </div>
          </>
        }

        {[
          BatchTypes.grid,
          BatchTypes.banquet,
          BatchTypes.cabaret,
          BatchTypes.family,
        ].includes(batchType) &&
          fitObjectsInSelectionBox && (
          <>
            <FormLabel className={classes.fieldHeading}>
              {batchSettings?.asset?.modifiers?.chairMod?.seatPositions
                  ?.length > 0
                  ? 'Guest Count (Optional)'
                  : 'Item Count (Optional)'
              }
            </FormLabel>
            <PlacezTextField
              onChange={(e) => {
                dispatch(
                  SetBatchSettings({
                    ...batchSettings,
                    maxGuest: isNaN(parseInt(e.target.value, 10))
                      ? 0
                      : parseInt(e.target.value, 10),
                  })
                );
              }}
              style={{ marginBottom: '5px' }}
              inputProps={{
                style: { textAlign: 'center' },
                maxLength: 3,
              }}
              value={maxGuest}
            />
          </>
        )}

        {[BatchTypes.grid, BatchTypes.banquet, BatchTypes.cabaret].includes(
          batchType
        ) && (
          <>
            <FormLabel className={classes.fieldHeading}>
              Rotation
            </FormLabel>
            <RotationControls
              rotation={rotation}
              setRotation={setAngle('rotation')}
              label='Label '
              hideInput
            />
          </>
        )}
        {[BatchTypes.theater].includes(batchType) && (
          <>
            <FormLabel className={classes.fieldHeading}>Angle</FormLabel>
            <RotationControls
              rotation={skew}
              setRotation={setAngle('skew')}
              label='Label '
              hideInput
              rotationAmount={Math.PI / 90}
            />
          </>
        )}
        {[
          BatchTypes.grid,
          BatchTypes.banquet,
          BatchTypes.theater,
          BatchTypes.cabaret,
          BatchTypes.family,
        ].includes(batchType) && (
          <>
            {!fitObjectsInSelectionBox &&
              <div className={classes.stackedGridProperty}>
                <FormLabel className={classes.fieldHeading}>Rows</FormLabel>
                <NumberEditor
                  value={batchRows}
                  unitless
                  onChange={(value) => {
                    dispatch(
                      SetBatchSettings({
                        ...batchSettings,
                        batchRows: value,
                      })
                    );
                  }}
                  step={1}
                  round={1}
                  dark
                  allowZero
                />
              </div>
            }
          </>
        )}
        {[BatchTypes.circle, BatchTypes.horseshoe].includes(batchType) && (
          <>
            <div className={classes.stackedGridProperty}>
              <FormLabel className={classes.fieldHeading}>Row Spacing</FormLabel>
              <NumberEditor
                value={rowSpacing}
                onChange={setLength('rowSpacing')}
                step={1}
                round={1}
                dark
                allowZero
              />
            </div>
          </>
        )}
        {[
          BatchTypes.grid,
          BatchTypes.banquet,
          BatchTypes.family,
          BatchTypes.theater,
          BatchTypes.cabaret,
        ].includes(batchType) && (
          <>
            {!fitObjectsInSelectionBox &&
              <div className={classes.stackedGridProperty}>
                <FormLabel className={classes.fieldHeading}>Columns</FormLabel>
                <NumberEditor
                  value={batchColumns}
                  unitless
                  onChange={(value) =>
                    dispatch(
                      SetBatchSettings({
                        ...batchSettings,
                        batchColumns: value,
                      })
                    )
                  }
                  step={1}
                  round={1}
                  dark
                  allowZero
                />
              </div>
            }
          </>
        )}
        {[
          BatchTypes.grid,
          BatchTypes.banquet,
          BatchTypes.theater,
          BatchTypes.cabaret,
        ].includes(batchType) && (
          <div className={classes.stackedGridProperty}>
            <FormLabel className={classes.fieldHeading}>Row Spacing</FormLabel>
            <NumberEditor
              value={rowSpacing}
              onChange={setLength('rowSpacing')}
              step={1}
              round={1}
              dark
              allowZero
            />
          </div>
        )}
        {[
          BatchTypes.grid,
          BatchTypes.banquet,
          BatchTypes.family,
          BatchTypes.theater,
          BatchTypes.cabaret,
        ].includes(batchType) && (
          <>
            <div className={classes.stackedGridProperty}>
              <FormLabel className={classes.fieldHeading}>Column Spacing</FormLabel>
              <NumberEditor
                value={colSpacing}
                onChange={setLength('colSpacing')}
                step={1}
                round={1}
                dark
                allowZero
              />
            </div>
          </>
        )}
        {[
          BatchTypes.grid,
          BatchTypes.theater,
          BatchTypes.cabaret,
        ].includes(batchType) && (
          <>
            <div className={classes.stackedGridProperty}>
              <FormLabel className={classes.fieldHeading}>
                Row Aisles
              </FormLabel>
              <NumberEditor
                value={numberOfRowAisles}
                onChange={setLength('numberOfRowAisles')}
                step={1}
                round={1}
                dark
                allowZero
                unitless
              />
            </div>
            <div className={classes.stackedGridProperty}>
              <FormLabel className={classes.fieldHeading}>
                Column Aisles
              </FormLabel>
              <NumberEditor
                value={numberOfColumnAisles}
                onChange={setLength('numberOfColumnAisles')}
                step={1}
                round={1}
                dark
                allowZero
                unitless
              />
            </div>
            <div className={classes.stackedGridProperty}>
              <FormLabel className={classes.fieldHeading}>Row Aisles Width</FormLabel>
              <NumberEditor
                value={rowAisleSpacing}
                onChange={setLength('rowAisleSpacing')}
                step={1}
                round={1}
                dark
                allowZero
              />
            </div>
            <div className={classes.stackedGridProperty}>
              <FormLabel className={classes.fieldHeading}>Column Aisles Width</FormLabel>
              <NumberEditor
                value={columnAisleSpacing}
                onChange={setLength('columnAisleSpacing')}
                step={1}
                round={1}
                dark
                allowZero
              />
            </div>
          </>
        )}
        </div>
        </div>
      </div>
      <div className={classes.panelFooter}>
        <div className={classes.field}>
          <Button
            className={classes.button}
            onClick={cancel}
            variant="outlined"
            classes={{
              root: classes.button,
            }}
          >
            Reset
          </Button>
          <Button
            className={classes.button}
            onClick={confirmBatch}
            variant="outlined"
            classes={{
              root: classes.button,
            }}
          >
            Apply
          </Button>
        </div>
        {/* <div className={classes.field}>
          <Button
            className={classes.button}
            onClick={backToItem}
            variant="outlined"
            classes={{
              root: classes.button,
            }}
          >
            Cancel
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default BatchPanel;
