import { Button, CircularProgress, IconButton, Input, Theme, Tooltip, Typography } from "@mui/material"
import { Photosphere } from "../../../models/Photosphere"
import { useEffect, useState } from "react"
import { ControlsType, PhotosphereSetup } from "../../../models"
import { makeStyles } from '@mui/styles';
import panelStyles from "../../../../Styles/panels.css"
import PhotosphereViewer from "../PhotosphereViewer"
import {
  Edit,
  Delete,
  Cancel,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useSelector } from "react-redux"
import { ReduxState } from "../../../../../reducers"
import { AreYouSureDelete } from "../../../../Modals/UniversalModal"
import { UniversalModalWrapper } from "../../../../Modals/UniversalModalWrapper"

type Props = {
  sphere: Photosphere,
  selected: boolean,
  edit: boolean,
  onDragPhotosphere: (e: any, sphere: Photosphere) => void,
  onMove: (e: any) => void,
  photosphereSetup: PhotosphereSetup,
  onPhotosphere: (sphere: Photosphere) => void,
  onDelete: (sphere: Photosphere) => void,
  handleUpdatePhotosphere: (sphere: Photosphere) => void,
  saveName: (sphere: Photosphere) => void,
  setNewName: (newName: string) => void,
}

const PhotosphereCard = (props: Props) => {
  const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
  const {
    edit,
    sphere,
    selected,
    photosphereSetup,
    onPhotosphere,
    onDragPhotosphere,
    onMove,
    onDelete,
    handleUpdatePhotosphere,
    setNewName,
    saveName
  } = props

  const [imageLoaded, setImageLoaded] = useState(false)

  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  const controlsType = useSelector(
    (state: ReduxState) => state.blue.controlsType
  );

  const [editName, setEditName] = useState<boolean>(false);

  useEffect(() => {
    setEditName(false);
  }, [selected]);

  return (
        <div
          className={ selected
            ? classes.selectedListItem
            : classes.listItem
          }
          >
          {edit && (
            <div
              className={classes.photosphereImageContainer}
              draggable={edit}
              onDragEnd={(e: any) => onDragPhotosphere(e, sphere)}
              onTouchMove={(e: any) => onMove(e)}
              onMouseMove={(e: any) => onMove(e)}
              onTouchEnd={(e: any) => onDragPhotosphere(e, sphere)}
            >
              <div
                onClick={(e) => {
                  if (
                    photosphereSetup === PhotosphereSetup.Home ||
                    photosphereSetup === PhotosphereSetup.View
                  )
                    onPhotosphere(sphere);
                }}
                key={sphere.imagePath}
                className={classes.photosphereImageContainer}
              >
                <PhotosphereViewer
                  key={sphere.id}
                  photosphere={sphere}
                  updatePhotosphere={(e) => {
                    handleUpdatePhotosphere(e);
                  }}
                ></PhotosphereViewer>
              </div>
            </div>
          )}
          {!edit && (
            <div
              onClick={(e) => {
                if (
                  photosphereSetup === PhotosphereSetup.Home ||
                  photosphereSetup === PhotosphereSetup.View
                )
                  onPhotosphere(sphere);
              }}
              key={sphere.imagePath}
              className={classes.photosphereImageContainer}
            >
              <img
                className={classes.image}
                style={{display: imageLoaded ? 'block' : 'none'}}
                src={
                  sphere.thumbnailPath
                    ? `${host}${sphere.thumbnailPath}`
                    : `${host}${sphere.imagePath}`
                }
                alt={'Setup Photosphere'}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded &&
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '190px'
                }}>
                  <CircularProgress />
                </div>
              }
              <Typography className={classes.photosphereName} align="center">
                {' '}
                {sphere.name}{' '}
              </Typography>
            </div>
          )}

          {edit && sphere.transformation && (
            <div className={classes.photosphereTitleContainer}>
              {selected ? (
                <>
                  {editName ? (
                    <>
                      <Tooltip title="Save Name">
                        <IconButton
                          onClick={() => {
                            setEditName(false);
                            saveName(sphere);
                            setNewName('');
                          }}
                          className={classes.iconButton}
                        >
                          <SaveIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Input
                        placeholder="Edit Name"
                        id="adornment-password"
                        defaultValue={sphere.name}
                        onChange={(event) => {
                          setNewName(event.target.value);
                        }}
                      />
                      <Tooltip title="Cancel">
                        <IconButton
                          onClick={() => {
                            setEditName(false);
                            setNewName('');
                          }}
                          className={classes.iconButton}
                        >
                          <Cancel fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit Name">
                        <IconButton
                          onClick={() => {
                            setEditName(true);
                          }}
                          className={classes.iconButton}
                        >
                          <Edit fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Typography
                        className={classes.photosphereName}
                        align="center"
                      >
                        {' '}
                        {sphere.name}{' '}
                      </Typography>
                      <UniversalModalWrapper
                        onDelete={() => onDelete(sphere)}
                        modalHeader="Are you sure?"
                      >
                        <Tooltip title="Delete Photosphere">
                          <IconButton
                            className={classes.deletePhotosphereButton}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {AreYouSureDelete('a Photosphere')}
                      </UniversalModalWrapper>
                    </>
                  )}
                </>
              ) : (
                <Typography className={classes.photosphereName} align="center">
                  {' '}
                  {sphere.name}{' '}
                </Typography>
              )}
            </div>
          )}

          {!sphere.transformation &&
            edit &&
            controlsType !== ControlsType.OrthographicControls && (
              <Button
                onClick={(e) => {
                  if (
                    photosphereSetup === PhotosphereSetup.Home ||
                    photosphereSetup === PhotosphereSetup.View
                  )
                    onPhotosphere(sphere);
                }}
              >
                Setup Photosphere
              </Button>
            )}

          {!sphere.transformation &&
            edit &&
            controlsType === ControlsType.OrthographicControls && (
              <div className={classes.photosphereHeight}>
                <Typography variant="body2">
                  {' '}
                  Drag above image to Layout{' '}
                </Typography>
              </div>
            )}
        </div>
  )
}

export default PhotosphereCard
