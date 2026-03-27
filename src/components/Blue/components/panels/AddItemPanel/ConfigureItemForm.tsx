import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Theme, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Asset } from '../../../../../blue/items/asset';

import panelStyles from '../../../../Styles/panels.css';
import { InitBatchItem, SetBatchSettings } from '../../../../../reducers/blue';
import { AssetClassType } from '../../../../../blue/items/factory';
import { GlobalViewState, ToolState } from '../../../../../models/GlobalState';
import { ReduxState } from '../../../../../reducers';
import { ChangeToolState } from '../../../../../reducers/globalState';
import { ControllerType } from '../../../../../models/BlueState';
import { BatchTypes } from '../../../../../blue/model/batchPatterns';
import { Utils } from '../../../../../blue/core/utils';
import { isWallItem } from '../../../../../blue/items/item';
import PlacezActionButton from '../../../../PlacezUIComponents/PlacezActionButton'

interface Props {
  item: Asset;
}

const ConfigureItemForm = (props: Props) => {
  const [item, setItem] = useState<Asset>(props.item);
  const [batchReady, setBatchReady] = useState<boolean>(false);
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(panelStyles);
  const globalViewState: GlobalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );

  useEffect(() => {
    if (
      props.item !== null &&
      props.item !== undefined &&
      props.item.classType !== AssetClassType.WallItem &&
      props.item.classType !== AssetClassType.InWallItem &&
      props.item.classType !== AssetClassType.WallFloorItem &&
      props.item.classType !== AssetClassType.InWallFloorItem
    ) {
      setBatchReady(false);
      setItem(props.item);
    }
  }, [props.item, setBatchReady]);

  useEffect(() => {
    if (item && !isWallItem(item.classType)) {
      //tempbatch item makes holes in walls
      dispatch(
        SetBatchSettings({
          asset: item,
          controllerType: ControllerType.Main,
          batchType: BatchTypes.grid,
          rowSpacing: Utils.convertUnitsFromTo(36, 'in', 'cm'),
          colSpacing: Utils.convertUnitsFromTo(36, 'in', 'cm'),
          rowAisleSpacing: 0,
          columnAisleSpacing: 0,
          numberOfRowAisles: 0,
          numberOfColumnAisles: 0,
          rotation: 0,
          skew: 0,
          maxGuest: 0,
          batchRows: 0,
          batchColumns: 0,
        })
      );
      dispatch(InitBatchItem(item, () => setBatchReady(true)));
    }
  }, [item]);

  const classes = styles(props);

  return (
    <>
      {globalViewState !== GlobalViewState.Fixtures &&
        item &&
        item.classType !== AssetClassType.WallItem &&
        item.classType !== AssetClassType.InWallItem &&
        item.classType !== AssetClassType.WallFloorItem &&
        item.classType !== AssetClassType.InWallFloorItem && (
          <>
            {batchReady ? (
              <PlacezActionButton
                onClick={(e) => dispatch(ChangeToolState(ToolState.AddBatch))}
              >
                Batch
              </PlacezActionButton>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
              </div>
            )}
          </>
        )}
    </>
  );
};

export default ConfigureItemForm;
