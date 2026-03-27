import { useState } from 'react';
import {
  Theme,
  createStyles,
  Typography,
  Tooltip,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { AssetGroup } from '../../../../../blue/items';
import { Save, Cancel, DeleteOutline, EditOutlined } from '@mui/icons-material';
import {
  DeleteAssetGroupAction,
  UpdateAssetGroupAction,
} from '../../../../../reducers/asset';

interface Props {
  assetGroups: AssetGroup[];
  onDragAssetGroup?: (
    event: any,
    dragType: string,
    assetGroup: AssetGroup
  ) => void;
}

const AssetGroupList = (props: Props) => {
  const classes = styles(props);
  const [selectedAssetGroup, setSelectedAssetGroup] = useState(null);
  const [assetGroupInEdit, setAssetGroupInEdit] = useState(undefined);
  const [newAssetGroupName, setNewAssetGroupName] = useState(undefined);

  const dispatch = useDispatch();

  const updateAssetGroup = (newName: string, assetGroup: AssetGroup) => {
    // onClick={() => saveAssetGroup(this.props.selectedItems, this.state.groupLabel)}>
    dispatch(
      UpdateAssetGroupAction({
        ...assetGroup,
        name: newName,
      })
    );
  };

  const { onDragAssetGroup, assetGroups } = props;

  return (
    <div className={classes.root}>
      <div className={classes.itemList}>
        {assetGroups.map((assetGroup: AssetGroup) => (
          <div
            className={classes.item}
            key={assetGroup.id}
            draggable={true}
            onMouseDown={
              onDragAssetGroup
                ? (e: any) => {
                    setSelectedAssetGroup(assetGroup);
                  }
                : () => {}
            }
            onDrag={
              onDragAssetGroup
                ? (e: any) =>
                    onDragAssetGroup(e, 'dragging', selectedAssetGroup)
                : () => {}
            }
            onDragEnd={
              onDragAssetGroup
                ? (e: any) => onDragAssetGroup(e, 'stop', selectedAssetGroup)
                : () => {}
            }
            onTouchStart={
              onDragAssetGroup
                ? (e: any) => {
                    setSelectedAssetGroup(assetGroup);
                  }
                : () => {}
            }
            onTouchMove={
              onDragAssetGroup
                ? (e: any) =>
                    onDragAssetGroup(e, 'dragging', selectedAssetGroup)
                : () => {}
            }
            onTouchEnd={
              onDragAssetGroup
                ? (e: any) => onDragAssetGroup(e, 'stop', selectedAssetGroup)
                : () => {}
            }
            onClick={() => setSelectedAssetGroup(assetGroup)}
          >
            {assetGroupInEdit === assetGroup.id ? (
              <div className={classes.planItemEditContainer}>
                <TextField
                  className={classes.fullWidthField}
                  id="title"
                  autoFocus
                  value={newAssetGroupName}
                  onChange={(e) => setNewAssetGroupName(e.target.value)}
                  inputProps={{
                    maxLength: 200,
                  }}
                />
                <>
                  <Tooltip title="Save Name">
                    <Save
                      color="inherit"
                      className={classes.iconButton}
                      onClick={(e: any) => {
                        setAssetGroupInEdit(undefined);
                        dispatch(
                          updateAssetGroup(newAssetGroupName, assetGroup)
                        );
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Cancel Name">
                    <Cancel
                      color="inherit"
                      className={classes.iconButton}
                      onClick={() => {
                        setAssetGroupInEdit(undefined);
                      }}
                    />
                  </Tooltip>
                </>
              </div>
            ) : (
              <>
                <Typography className={classes.itemText}>
                  {assetGroup.name}
                </Typography>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '30px 30px 0px',
                  }}
                >
                  <EditOutlined
                    color="inherit"
                    className={classes.iconButton}
                    onClick={(e: any) => {
                      setAssetGroupInEdit(assetGroup.id);
                      setNewAssetGroupName(assetGroup.name);
                    }}
                  />
                  {/*<FileCopyOutlined*/}
                  {/*  color="inherit"*/}
                  {/*  className={classes.iconButton}*/}
                  {/*  onClick={(e: any) =>*/}
                  {/*    dispatch(ChangeCopiedAssetsState(assetGroup))*/}
                  {/*  }*/}
                  {/*/>*/}
                  <DeleteOutline
                    color="inherit"
                    className={classes.iconButton}
                    onClick={(e: any) =>
                      dispatch(DeleteAssetGroupAction(assetGroup.id))
                    }
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      minWidth: '200px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.shadow,
    },
    itemList: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      width: '100%',
      margin: '2.5px 0px',
    },
    settings: {
      position: 'absolute',
      cursor: 'pointer',
      right: 0,
      top: 0,
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.secondary.main,
      },
      margin: '3px',
    },
    delete: {
      position: 'absolute',
      cursor: 'pointer',
      right: 0,
      bottom: 0,
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.secondary.main,
      },
      margin: '3px',
    },
    item: {
      cursor: 'grab',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
      margin: '2.5px 5px',
      padding: '10px',
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
    selectedImageContainer: {
      border: `solid 3px ${theme.palette.primary.main}`,
      borderRadius: 4,
      display: 'flex',
      position: 'relative',
      width: '112px',
      height: '112px',
      maxWidth: '112px',
      maxHeight: '112px',
    },
    imageContainer: {
      border: 'solid 2px transparent',
      display: 'flex',
      position: 'relative',
      minWidth: '112px',
      minHeight: '112px',
    },
    itemText: {
      marginTop: 4,
      fontWeight: 'bold',
      fontSize: 18,
      overflow: 'hidden',
      textAlign: 'center',
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
    },
    progress: {
      position: 'absolute',
      top: '35px',
      left: '35px',
    },
    planItemEditContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      flex: 1,
      alignItems: 'center',
    },
    iconButton: {
      cursor: 'pointer',
      color: theme.palette.text.primary,
    },
  })
);

export default AssetGroupList;
