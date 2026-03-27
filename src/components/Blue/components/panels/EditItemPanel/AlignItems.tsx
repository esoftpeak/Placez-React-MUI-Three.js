import { useDispatch, useSelector } from 'react-redux';

import {
  Theme,
  Tooltip,
  FormLabel,
  IconButton,
} from '@mui/material';

import {
  AlignVerticalTop,
  AlignVerticalCenter,
  AlignVerticalBottom,
  AlignHorizontalLeft,
  AlignHorizontalCenter,
  AlignHorizontalRight,
} from '@mui/icons-material';

import { HandlesFromBlue } from '../../../models';

import { Item } from '../../../../../blue/items/item';
import panelStyles from '../../../../Styles/panels.css';
import { ReduxState } from '../../../../../reducers';
import {
  HorizAlignModifiers,
  VertAlignModifiers,
} from '../../../../../blue/three/controller';
import {
  NeedSaveAction,
} from '../../../../../reducers/blue';
import { makeStyles } from '@mui/styles';

interface Props {
  handlesFromBlue: HandlesFromBlue;
}

const AlignItems = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const dispatch = useDispatch();

  const selectedItems = useSelector( (state: ReduxState) => state.blue.selectedItems);

  const alignVert = (modifier: VertAlignModifiers) => () => {
    (window as any).gtag('event', 'edit_item', 'align');
    props.handlesFromBlue.alignVertical(modifier);
    dispatch(NeedSaveAction(true));
    selectedItems.forEach((item: Item) => {
      item.updateItem();
    });
  };

  const alignHoriz = (modifier: HorizAlignModifiers) => () => {
    (window as any).gtag('event', 'edit_item', 'align');
    props.handlesFromBlue.alignHorizontal(modifier);
    dispatch(NeedSaveAction(true));
    selectedItems.forEach((item: Item) => {
      item.updateItem();
    });
  };

  const classes = styles(props);

  return (
    <>
    {selectedItems.length > 1 && (
      <>
        <FormLabel className={classes.fieldHeading}>
        Vertical Align
        </FormLabel>
        <div style={{display: 'flex', justifyContent: 'center', alignItems:'center' }}>
          <Tooltip title="Align Top">
            <IconButton
              onClick={alignHoriz(HorizAlignModifiers.top)}
              className={classes.button}
              classes={{
                root: classes.deleteButton,
              }}
            >
              <AlignVerticalTop />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton
              onClick={alignHoriz(HorizAlignModifiers.center)}
              className={classes.button}
              classes={{
                root: classes.deleteButton,
              }}
            >
              <AlignVerticalCenter />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Bottom">
            <IconButton
              onClick={alignHoriz(HorizAlignModifiers.bottom)}
              className={classes.button}
              classes={{
                root: classes.deleteButton,
              }}
            >
              <AlignVerticalBottom />
            </IconButton>
          </Tooltip>
        </div>
        <FormLabel className={classes.fieldHeading}>
        Horizontal Align
        </FormLabel>
        <div style={{display: 'flex', justifyContent: 'center', alignItems:'center' }}>
          <Tooltip title="Align Left">
            <IconButton
              onClick={alignVert(VertAlignModifiers.left)}
              className={classes.button}
              classes={{
                root: classes.deleteButton,
              }}
            >
              <AlignHorizontalLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton
              onClick={alignVert(VertAlignModifiers.center)}
              className={classes.button}
              classes={{
                root: classes.deleteButton,
              }}
            >
              <AlignHorizontalCenter />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton
              onClick={alignVert(VertAlignModifiers.right)}
              className={classes.button}
              classes={{
                root: classes.deleteButton,
              }}
            >
              <AlignHorizontalRight />
            </IconButton>
          </Tooltip>
        </div>
      </>
    )}
  </>)
};

export default AlignItems;
