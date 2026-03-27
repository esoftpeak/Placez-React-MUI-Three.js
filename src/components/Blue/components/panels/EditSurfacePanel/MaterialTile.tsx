import { createStyles, makeStyles } from "@mui/styles"
import { PlacedMaterial, PlacezMaterial } from "../../../../../api/placez/models/PlacezMaterial"
import { Utils } from "../../../../../blue/core/utils"
import { Theme } from "@mui/material"

type Props = {
  material: PlacezMaterial;
  setMaterial: (material: PlacedMaterial) => void;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '120px',
    },
    selected: {
      minHeight: '120px',
      display: 'flex',
      alignItems: 'flex-end',
      '&:hover': {
        cursor: 'pointer',
        transform: 'scale(1.02)',
      },
    },
    unSelected: {
      minHeight: '120px',
      display: 'flex',
      alignItems: 'flex-end',
      '&:hover': {
        cursor: 'pointer',
        transform: 'scale(1.02)',
      },
    },
    caption: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }
  })
);

const MaterialTile = (props: Props) => {
  const { material } = props;
  const classes = styles(props);
  const handleTextureChange = (mat: PlacedMaterial) => {
    props.setMaterial({
      ...props.material,
      appliedMaterialId: mat ? mat.id : null,
      scale: mat ? mat.scale : null,
      threeJSMaterial: {
        ...props.material.threeJSMaterial,
        color: Utils.hexColorToDec('#ffffff'),
      },
      preview: mat.preview,
    });
  };

  const host = import.meta.env.VITE_APP_PLACEZ_API_URL;

  return (
    <div className={classes.root}>
      <div
        onClick={() => handleTextureChange(material)}
        key={material.id}
        className={
          material.id === props.material.id
            ? classes.selected
            : classes.unSelected
        }
        style={{
          backgroundImage: `url(${material.preview ? `${host}${material.preview}` : ''})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
      </div>
      <div className={classes.caption}>
        <span>{material.name}</span>
      </div>
    </div>
  );
}


export default MaterialTile;
