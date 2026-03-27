import { Item } from '../../../../blue/items/item';
import panelStyles from '../../../Styles/panels.css';
import NumberEditor from '../../../NumberEditor';
import { useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { makeStyles } from '@mui/styles';
import { FormLabel, Theme } from '@mui/material';

interface Props {
  itemSelected?: Item;
  width?: number;
  depth?: number;
  height?: number;
  onChange?: (width, depth, height) => void;
}

const EditSize = (props: Props) => {
  const { itemSelected, onChange } = props;

  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  const [itemWidth, setItemWidth] = useState<number>(0);
  const [itemDepth, setItemDepth] = useState<number>(0);
  const [itemHeight, setItemHeight] = useState<number>(0);

  const [size, setSize] = useState<Vector3>(new Vector3());
  const [newSize, setNewSize] = useState<Vector3>(new Vector3());

  const [sizeChange, setSizeChange] = useState<boolean>(false);

  useEffect(() => {
    setSizeChange(true);
    // set new size
  }, [itemWidth, itemDepth, itemHeight]);

  useEffect(() => {
    setItemWidth(Math.round(props.width ?? itemSelected.getWidth()));
    setItemDepth(Math.round(props.depth ?? itemSelected.getDepth()));
    setItemHeight(Math.round(props.height ?? itemSelected.getHeight()));
    setSize(
      new Vector3(
        Math.round(props.depth ?? itemSelected.getDepth()),
        Math.round(props.height ?? itemSelected.getHeight()),
        Math.round(props.width ?? itemSelected.getWidth())
      )
    );
  }, [itemSelected, props.width, props.depth, props.height]);

  //This code change the size of the item in real time
  useEffect(() => {
    if (onChange && itemWidth && itemDepth && itemHeight) {
      onChange(itemWidth, itemDepth, itemHeight);
    }
    setSizeChange(true);
  }, [itemWidth, itemDepth, itemHeight]);

  // const globalViewState: GlobalViewState = useSelector(
  //   (state: ReduxState) => state.globalstate.globalViewState
  // );
  //
  // const flipDepth = () => {
  //   onChange(itemWidth, -itemDepth, itemHeight);
  // };
  //
  // const flipWidth = () => {
  //   onChange(-itemWidth, itemDepth, itemHeight);
  // };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
      }}
    >
      <FormLabel className={classes.fieldHeading}>Width</FormLabel>
      <NumberEditor
        value={itemWidth}
        onChange={(value) => {
          setItemWidth(isNaN(value) ? 0 : value);
        }}
        step={1}
        round={1}
        dark
      />
      <FormLabel className={classes.fieldHeading}>Depth</FormLabel>
      <NumberEditor
        value={itemDepth}
        onChange={(value) => {
          setItemDepth(isNaN(value) ? 0 : value);
        }}
        step={1}
        round={1}
        dark
      />
      <FormLabel className={classes.fieldHeading}>Height</FormLabel>
      <NumberEditor
        value={itemHeight}
        onChange={(value) => {
          setItemHeight(isNaN(value) ? 0 : value);
        }}
        step={1}
        round={1}
        dark
      />
      {/*<div className={classes.buttonDiv} style={{gridColumn: 'span 2'}}>*/}
      {/*  <PlacezActionButton*/}
      {/*    onClick={() => onChange(itemWidth, itemDepth, itemHeight)}*/}
      {/*    disabled={!sizeChange}*/}
      {/*    classes={{*/}
      {/*      root: classes.button,*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Set Size*/}
      {/*  </PlacezActionButton>*/}
      {/*</div>*/}
      {/*{globalViewState === GlobalViewState.Fixtures && (*/}
      {/*  <div className={classes.buttonDiv}>*/}
      {/*    <PlacezActionButton*/}
      {/*      onClick={flipDepth}*/}
      {/*      classes={{*/}
      {/*        root: classes.button,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Flip Depth*/}
      {/*    </PlacezActionButton>*/}
      {/*  </div>*/}
      {/*)}*/}
      {/*{globalViewState === GlobalViewState.Fixtures && (*/}
      {/*  <div className={classes.buttonDiv}>*/}
      {/*    <PlacezActionButton*/}
      {/*      onClick={flipWidth}*/}
      {/*      classes={{*/}
      {/*        root: classes.button,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Flip Width*/}
      {/*    </PlacezActionButton>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
};

export default EditSize;
