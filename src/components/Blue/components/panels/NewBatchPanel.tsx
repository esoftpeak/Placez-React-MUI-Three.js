import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Theme, Typography, Button, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Asset } from '../../../../blue/items/asset';
import { debounce } from 'ts-debounce';
import { ClearOutlined } from '@mui/icons-material';
import panelStyles from '../../../Styles/panels.css';
import { ValidUnits } from '../../../../api/placez/models/UserSetting';
import { ReduxState } from '../../../../reducers';
import { Utils } from '../../../../blue/core/utils';
import {
  BatchAddParams,
  BatchTypes,
} from '../../../../blue/model/batchPatterns';
import {
  ApplyBatch,
  CancelBatch,
  SetBatchSettings,
} from '../../../../reducers/blue';
import { ControllerType } from '../../../../models/BlueState';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../../Hooks/useLocalStorageState';

interface Props {
  onBack: Function;
}

const NewBatchPanel = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const batchSettings = useSelector(
    (state: ReduxState) => state.blue.batchSettings
  );
  const dispatch = useDispatch();

  const selectedItems = useSelector(
    (state: ReduxState) => state.blue.selectedItems
  );

  useEffect(() => {
    if (selectedItems[0] !== undefined) {
      setAsset(selectedItems[0].asset);
    }
  }, [selectedItems]);

  const [asset, setAsset] = useState<Asset>(undefined);
  const [batchType, setBatchType] = useState<BatchTypes>(undefined);
  const [rotation, setRotation] = useState<number>(0);
  const [rowSpacing, setRowSpacing] = useState<number>(
    Utils.convertUnitsFromTo(36, 'in', 'cm')
  );
  const [rowAisleSpacing, setRowAisleSpacing] = useState<number>(0);
  const [colSpacing, setColSpacing] = useState<number>(
    Utils.convertUnitsFromTo(36, 'in', 'cm')
  );
  const [columnAisleSpacing, setColumnAisleSpacing] = useState<number>(0);
  const [numberOfRowAisles, setNumberOfRowAisles] = useState<number>(0);
  const [numberOfColumnAisles, setNumberOfColumnAisles] = useState<number>(0);
  const [skew, setSkew] = useState<number>(0);
  const [maxGuest, setMaxGuest] = useState<number>(0);

  const units = useLocalStorageSelector<ValidUnits>(LocalStorageKey.Units);

  useEffect(() => {
    addBatchItem();
  }, []);

  useEffect(() => {
    switch (batchType) {
      case BatchTypes.grid:
        dispatch(
          SetBatchSettings({
            controllerType: ControllerType.Batch,
            batchType,
          })
        );
        break;
      case BatchTypes.linear:
        dispatch(
          SetBatchSettings({
            controllerType: ControllerType.Batch,
            batchType,
          })
        );
        break;
      case BatchTypes.random:
        dispatch(
          SetBatchSettings({
            batchType,
          })
        );
        break;
      case BatchTypes.banquet:
        dispatch(
          SetBatchSettings({
            controllerType: ControllerType.Batch,
            batchType,
          })
        );
        break;

      default:
        break;
    }
  }, [batchType]);

  const updateBatch = () => {
    const itemUIConfg: BatchAddParams = {
      asset: asset,
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
    };
  };

  const addBatchItem = debounce(updateBatch, 500);

  useEffect(() => {
    addBatchItem();
  }, [
    batchType,
    rotation,
    rowSpacing,
    rowAisleSpacing,
    colSpacing,
    columnAisleSpacing,
    numberOfRowAisles,
    numberOfColumnAisles,
    skew,
    maxGuest,
    addBatchItem,
  ]);

  const configureBatch = (e) => {
    switch (e.target.value) {
      case 'grid':
        setBatchType(e.target.value);
        setSkew(0);
        setRowAisleSpacing(0);
        setNumberOfRowAisles(0);
        setRowSpacing(Utils.convertUnitsFromTo(36, 'in', 'cm'));
        setColSpacing(Utils.convertUnitsFromTo(36, 'in', 'cm'));
        break;
      case 'banquet':
        setBatchType(e.target.value);
        setSkew(0);
        break;
      case 'family':
        setBatchType(e.target.value);
        break;
      case 'theater':
        setBatchType(e.target.value);
        setSkew((30 / 180) * Math.PI);
        setRowAisleSpacing(48);
        setNumberOfRowAisles(2);
        setRowSpacing(0);
        setRotation(0);
        break;
      case 'uShape':
        setBatchType(e.target.value);
        setSkew(0);
        break;
      case 'hollowSquare':
        setBatchType(e.target.value);
        setSkew(0);
        break;
      case 'cabaret':
        setBatchType(e.target.value);
        setSkew(0);
        setRowSpacing(24);
        setColSpacing(24);
        break;
      case 'circle':
        setBatchType(e.target.value);
        break;
      case 'horseshoe':
        setBatchType(e.target.value);
        break;
      default:
        break;
    }
  };

  const backToItem = () => {
    props.onBack();
  };

  const setLength = (setMethod) => (value) => {
    if (isNaN(value)) return;
    setMethod(value ?? 0);
  };

  const setAngle =
    (
      setMethod,
      currentValue: number,
      adjustmentAngle: number,
      direction: -1 | 1
    ) =>
    () => {
      setMethod(currentValue + direction * adjustmentAngle);
    };

  const setSpacing = (value) => (e) => {
    if (isNaN(value) || value === 0) return;
    setColSpacing(value || 0);
    setRowSpacing(value || 0);
  };

  const classes = styles(props);

  return (
    <div className={classes.root}>
      <div className={classes.panelUpper}>
        <div className={classes.mainHeadingContainer}>
          <div className={classes.cancelButton} />
          <Typography className={classes.title}>Pattern</Typography>
          <Tooltip title="Cancel Item Configuration">
            <ClearOutlined
              color="primary"
              onClick={() => dispatch(CancelBatch())}
              className={classes.cancelButton}
            />
          </Tooltip>
        </div>
        <div className={classes.titleContainer}>
          <Typography className={classes.itemFieldHeading} align="center">
            {asset?.name}
          </Typography>
        </div>
      </div>
      {batchType === undefined && (
        <div className={classes.panelLower}>
          <Button
            onClick={(e) => setBatchType(BatchTypes.linear)}
            className={classes.button}
            variant="outlined"
            style={{
              flex: 1,
            }}
            classes={{
              root: classes.button,
            }}
          >
            Linear
          </Button>
          <Button
            onClick={(e) => setBatchType(BatchTypes.grid)}
            className={classes.button}
            variant="outlined"
            style={{
              flex: 1,
            }}
            classes={{
              root: classes.button,
            }}
          >
            Grid
          </Button>
          {/* <Button
            onClick={e => setBatchType(BatchTypes.random)}
            className={classes.button}
            variant="outlined"
            style={{
              flex: 1,
            }}
            classes={{
              root: classes.button,
            }}>
            Random
          </Button> */}
          {/* <Button
            onClick={e => setBatchType(BatchTypes.banquet)}
            className={classes.button}
            variant="outlined"
            style={{
              flex: 1,
            }}
            classes={{
              root: classes.button,
            }}>
            Banquet
          </Button> */}
        </div>
      )}
      {batchType === BatchTypes.linear && (
        <div className={classes.panelLower}>
          {/* <div className={classes.fieldContainer}>
            <FormLabel className={classes.fieldHeading}>
              Spacing ({units})
            </FormLabel>
            <NumberEditor
              value={(batchSettings as any).spacing}
              onChange={() => setSpacing}
              step={1}
              round={1}
              dark
              allowZero
            />
          </div> */}
          <div className={classes.field}>
            <Button
              className={classes.button}
              onClick={(e) => setBatchType(undefined)}
              variant="outlined"
              classes={{
                root: classes.button,
              }}
            >
              Change Batch Type
            </Button>
          </div>
        </div>
      )}
      {batchType === BatchTypes.grid && (
        <div className={classes.panelLower}>
          <div className={classes.field}>
            <Button
              className={classes.button}
              onClick={(e) => setBatchType(undefined)}
              variant="outlined"
              classes={{
                root: classes.button,
              }}
            >
              Change Batch Type
            </Button>
          </div>
        </div>
      )}
      {batchType === BatchTypes.banquet && (
        <div className={classes.panelLower}>
          <div className={classes.field}>
            <Button
              className={classes.button}
              onClick={(e) => setBatchType(undefined)}
              variant="outlined"
              classes={{
                root: classes.button,
              }}
            >
              Change Batch Type
            </Button>
          </div>
        </div>
      )}
      <div className={classes.panelFooter}>
        {batchType !== undefined && (
          <div className={classes.field}>
            <Button
              className={classes.button}
              onClick={() => dispatch(ApplyBatch())}
              variant="outlined"
              classes={{
                root: classes.button,
              }}
            >
              Apply
            </Button>
          </div>
        )}
        <div className={classes.field}>
          <Button
            className={classes.button}
            onClick={() => dispatch(CancelBatch())}
            variant="outlined"
            classes={{
              root: classes.button,
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewBatchPanel;
