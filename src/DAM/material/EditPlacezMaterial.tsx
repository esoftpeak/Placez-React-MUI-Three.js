import { useState, useEffect, useRef } from 'react';

import { useParams, useNavigate } from 'react-router';
import {
  PlacezMaterial,
  DefaultMaterial,
  DefaultTexture,
  GetImgUrlForMap,
  TypesOfMaps,
} from '../../api/placez/models/PlacezMaterial';
import { ChromePicker } from 'react-color';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { Slider, Button, Paper, Switch, Typography, Card } from '@mui/material';
import { placezApi } from '../../api';
import FileSelector from '../../components/Utils/FileSelector';
import { MaterialPreview } from '../../blue/materialPreview';
import { Utils } from '../../blue/core/utils';
import produce from 'immer';
import Jumbotron from '../../components/Jumbotron';
import PlacezTagger from '../../components/PlacezUIComponents/PlacezTagger'

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      overflow: 'scroll',
    },
    form: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
    },
    column: {
      flex: '1 1 25%',
      padding: '10px',
      width: '100%',
      minWidth: 500,
      overflow: 'scroll',
    },
    detailsColumn: {
      marginRight: '20px',
      paddingRight: '20px',
    },
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    field: {
      width: '100%',
      minWidth: '300px',
    },
    imagePreviewContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePreview: {
      width: '500px',
    },
    cameraColumn: {
      display: 'inline-flex',
      flexDirection: 'row',
    },
    actions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-evenly',
    },
    actionButton: {
      padding: `${theme.spacing()}px ${theme.spacing()}px`,
      margin: theme.spacing(),
      borderRadius: theme.shape.borderRadius,
      width: '150px',
      height: 40,
    },
    mapImage: {
      width: '100px',
      height: '100px',
      backgroundColor: theme.palette.primary.main,
    },

    label: {
      width: '100px',
      marginRight: '15px',
    },
    lineItem: {
      display: 'flex',
      flexDirection: 'row',
      margin: '10px',
      padding: '10px',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    subProperty: {
      display: 'flex',
      flexDirection: 'row',
      margin: '5px',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    info: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      margin: '10px',
    },
    infoLine: {
      display: 'flex',
      flexDirection: 'row',
    },
    picker: {
      alignSelf: 'center',
    },
  })
);

type Props = {};

const EditPlacezMaterial = (props: Props) => {
  const classes = styles(props);
  const { id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<PlacezMaterial>({
    id: '',
    tags: [],
    name: '',
    scale: undefined,
    preview: undefined,
    threeJSMaterial: undefined,
  });

  const blueElementRef = useRef<HTMLDivElement>();
  const [blueRef, setBlueRef] = useState(undefined);

  const newBlueRef = () => {
    setBlueRef(new MaterialPreview(blueElementRef.current, material));
  };

  useEffect(() => {
    if (blueRef) {
      blueRef.updateMaterial(material);
    } else {
      newBlueRef();
    }
  }, [material]);

  useEffect(() => {
    if (id) {
      placezApi.getMaterial(id).then((response) => {
        setMaterial(response.parsedBody);
      });
    } else {
      setMaterial({
        ...DefaultMaterial,
        id: Utils.guid(),
        threeJSMaterial: {
          ...DefaultMaterial.threeJSMaterial,
          uuid: Utils.guid(),
        },
      });
    }
    return () => {
      if (blueRef) {
        blueRef.dispose();
      }
    };
  }, []);

  const screenCapture = () => {
    blueRef.getBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, `${material.id}.png`);
      placezApi.postBlob(formData).then((data) => {
        setMaterial({
          ...material,
          preview: `/${data.parsedBody.path}`,
        });
      });
    });
  };

  const handleCreate = () => {
    placezApi.postMaterial(material).then((response) => {
      alert('update successful');
      navigate(-1);
    });
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    setMaterial({
      ...material,
      [name]: value,
    });
  };

  const handleTagsChange = (newTags) => {
    setMaterial(
      produce(material, (draft) => {
        draft.tags = newTags;
      })
    );
  };

  const handleScaleChange = (e, v) => {
    setMaterial({
      ...material,
      scale: v,
    });
  };

  const handleMapSubmit = (mapType: string) => (files: FileList) => {
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);

    placezApi.postBlob(formData).then((data) => {
      const imageUUID = Utils.guid();
      const textureUUID = Utils.guid();
      const newImages = [...material.threeJSMaterial.images];
      newImages.push({
        uuid: imageUUID,
        url: `/${data.parsedBody.path}`,
      });
      const newTextures = [...material.threeJSMaterial.textures];
      newTextures.push({
        ...DefaultTexture,
        uuid: textureUUID,
        image: imageUUID,
      });

      setMaterial({
        ...material,
        threeJSMaterial: {
          ...material.threeJSMaterial,
          images: [...newImages],
          textures: [...newTextures],
          [mapType]: textureUUID,
        },
      });
    });
  };

  const updateThreeJSMaterial = (prop, value) => {
    setMaterial({
      ...material,
      threeJSMaterial: {
        ...material.threeJSMaterial,
        [prop]: value,
      },
    });
  };

  const removeMap = (mapType: string) => () => {
    updateThreeJSMaterial(mapType, undefined);
  };

  const handleCancel = (e) => {
    navigate(-1);
  };

  const handleDelete = (e) => {
    placezApi.deleteMaterial(material.id).then((data) => {
      navigate(-1);
    });
  };

  const setProp = (prop: string) => (e, v) => {
    updateThreeJSMaterial(prop, v);
  };

  const toggleProp = (prop: string) => (e, v) => {
    if (prop === 'transparent') {
      if (v) {
        if (material.threeJSMaterial.opacity) return;
        updateThreeJSMaterial('opacity', 1.0);
        updateThreeJSMaterial('prop', v);
      } else {
        updateThreeJSMaterial('opacity', 1.0);
        updateThreeJSMaterial('prop', v);
      }
    }
    if (prop === 'envMap') {
      if (v) {
        const imageUUID = Utils.guid();
        const textureUUID = Utils.guid();
        const newImages = [...material.threeJSMaterial.images];
        newImages.push({
          uuid: imageUUID,
          url: [
            `${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/posX`,
            `${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/posY`,
            `${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/negY`,
            `${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/posX`,
            `${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/posY`,
            `${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/negY`,
          ],
        });
        const newTextures = [...material.threeJSMaterial.textures];
        newTextures.push({
          ...DefaultTexture,
          uuid: textureUUID,
          image: imageUUID,
          mapping: 301,
          wrap: [1001, 1001],
          flipY: false,
          encoding: 3000,
        });

        setMaterial({
          ...material,
          threeJSMaterial: {
            ...material.threeJSMaterial,
            images: [...newImages],
            textures: [...newTextures],
            envMap: textureUUID,
          },
        });
      } else {
        updateThreeJSMaterial('envMap', null);
      }
    }
  };

  const handleMaterialColorChange = (e) => {
    updateThreeJSMaterial('color', Utils.hexColorToDec(e.hex));
  };

  const listMaps = (material: PlacezMaterial) =>
    TypesOfMaps.map((mapType) => {
      if (material && material.threeJSMaterial) {
        return (
          <Paper className={classes.lineItem} key={mapType}>
            <div>
              <img
                className={classes.mapImage}
                src={GetImgUrlForMap(material, mapType)}
                alt=""
              />
            </div>
            <div className={classes.info}>
              <div className={classes.subProperty}>
                <Typography variant="h6">{mapType}</Typography>
                <div className={classes.infoLine}>
                  <FileSelector
                    customID={mapType}
                    handleFileSubmit={handleMapSubmit(mapType)}
                    accept=".jpeg,.jpg,.png"
                  />
                  <Button
                    onClick={removeMap(mapType)}
                    variant="contained"
                    color="secondary"
                  >
                    Remove Map
                  </Button>
                </div>
              </div>
              {material.threeJSMaterial.displacementScale &&
                mapType === 'displacementMap' && (
                  <div className={classes.subProperty}>
                    <div className={classes.label}>Height Scale</div>
                    <Slider
                      value={material.scale ? material.scale : 1}
                      step={1}
                      min={0}
                      max={50}
                      valueLabelDisplay="auto"
                      onChange={setProp(mapType)}
                      color="secondary"
                    />
                  </div>
                )}
              {material.threeJSMaterial.map && mapType === 'map' && (
                <div className={classes.subProperty}>
                  <div className={classes.label}>Image Size (cm)</div>
                  <Slider
                    value={material.scale ? material.scale : 1}
                    step={10}
                    min={1}
                    max={1000}
                    valueLabelDisplay="auto"
                    onChange={handleScaleChange}
                    color="secondary"
                  />
                </div>
              )}
            </div>
          </Paper>
        );
      }
      return <div key={mapType}>THREEJSMATERIAL NOT LOADED</div>;
    });

  const color = '#9e9e9e'; // Future capability to override color
  const host = import.meta.env.VITE_APP_PLACEZ_API_URL;

  return (
    <div className={classes.root}>
      <Jumbotron title="Edit Material Details" />
      <div className={classes.actions}>
        <Button
          onClick={handleCreate}
          className={classes.actionButton}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
        <Button
          onClick={handleCancel}
          className={classes.actionButton}
          variant="contained"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          className={classes.actionButton}
          variant="contained"
          color="secondary"
        >
          Delete
        </Button>
      </div>
      <div>
        <div className={classes.form}>
          <div className={classes.column}>
            <div className={classes.detailsColumn}>
              <div className={classes.cameraColumn}>
                <div
                  id="contentViewer"
                  ref={blueElementRef}
                  style={{
                    background: `radial-gradient(#ffffff, ${color})`,
                    width: '600px',
                    height: '400px',
                  }}
                />
                <button onClick={screenCapture}>Take Picture</button>
              </div>
              <Card className={classes.imagePreviewContainer}>
                <img
                  className={classes.imagePreview}
                  src={`${host}${material.preview}`}
                  alt=""
                />
              </Card>
            </div>
          </div>
          {material && material.threeJSMaterial && (
            <div
              className={classes.column}
              style={{
                height: '90vh',
              }}
            >
              <div className={classes.detailsColumn}>
                <div className={classes.fieldContainer}>
                  <div className={classes.lineItem}>
                    <div>Name</div>
                    <div>
                      <input
                        name="name"
                        type="text"
                        className={classes.field}
                        value={material.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className={classes.lineItem}>
                    <div>Tags</div>
                    <PlacezTagger
                      tags={material.tags ?? []}
                      onChange={handleTagsChange}
                    />
                  </div>

                  <div className={classes.lineItem}>
                    <div className={classes.label}>Roughness</div>
                    <Slider
                      value={
                        material.threeJSMaterial
                          ? material.threeJSMaterial.roughness
                          : 0
                      }
                      step={0.05}
                      min={0}
                      max={1}
                      valueLabelDisplay="auto"
                      onChange={setProp('roughness')}
                      color="secondary"
                    />
                  </div>

                  <div className={classes.lineItem}>
                    <div className={classes.label}>Metalness</div>
                    <Slider
                      value={
                        material.threeJSMaterial
                          ? material.threeJSMaterial.metalness
                          : 0
                      }
                      step={0.05}
                      min={0}
                      max={1}
                      valueLabelDisplay="auto"
                      onChange={setProp('metalness')}
                      color="secondary"
                    />
                  </div>

                  <div className={classes.lineItem}>
                    <div className={classes.label}>Transparent</div>
                    <Switch
                      value={
                        material.threeJSMaterial
                          ? material.threeJSMaterial.transparent
                          : false
                      }
                      onChange={toggleProp('transparent')}
                    />
                  </div>
                  {material.threeJSMaterial &&
                    material.threeJSMaterial.transparent && (
                      <div className={classes.lineItem}>
                        <div className={classes.label}>Opacity</div>
                        <Slider
                          value={
                            material.threeJSMaterial
                              ? material.threeJSMaterial.opacity
                              : 1
                          }
                          step={0.05}
                          min={0}
                          max={1}
                          valueLabelDisplay="auto"
                          onChange={setProp('opacity')}
                          color="secondary"
                        />
                      </div>
                    )}

                  <div className={classes.lineItem}>
                    <div className={classes.label}>Mirror Finish</div>
                    <Switch
                      value={
                        material.threeJSMaterial &&
                        material.threeJSMaterial.envMap
                          ? true
                          : false
                      }
                      onChange={toggleProp('envMap')}
                    />
                  </div>

                  <ChromePicker
                    className={classes.picker}
                    color={Utils.decColorToHex(material.threeJSMaterial.color)}
                    onChangeComplete={handleMaterialColorChange}
                  />

                  {listMaps(material)}

                  {/* <div item xs={3}>
                </div>
                <div item xs={9}>
                  <input
                    name="scale"
                    type="text"
                    className={classes.field}
                    value={`${process.env['ENV_PLACEZ_API_URL']}/Organization/${props.userProfile.organization_id}/MediaAssetFile/${material.id}`}
                  />
                </div> */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPlacezMaterial;
