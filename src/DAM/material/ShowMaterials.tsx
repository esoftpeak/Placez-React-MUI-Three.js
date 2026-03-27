import { PlacezMaterial } from '../../api/placez/models/PlacezMaterial';
import { Edit as EditIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { Link } from 'react-router-dom';
import { ReduxState } from '../../reducers';
import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';

type Props = {};

const ShowMaterials = (props: Props) => {
  const materials = useSelector(
    (state: ReduxState) => state.material.materials
  );

  const host = import.meta.env.VITE_APP_PLACEZ_API_URL;

  const listMaterials = (materials: PlacezMaterial[]) => {
    return materials.map((material: PlacezMaterial) => {
      return (
        <ImageListItem key={material.id}>
          <img src={`${host}${material.preview}`} alt="" />
          <ImageListItemBar
            title={material.name}
            // subtitle={<span>by: {tile.author}</span>}
            actionIcon={
              <Link to={`/media/material/${material.id}`}>
                <EditIcon style={{ color: 'purple', marginRight: '15px' }} />
              </Link>
            }
          />
        </ImageListItem>
      );
    });
  };

  return (
    <div
      style={{
        margin: '100px',
        height: 'calc(100vh - 200px)',
        overflow: 'auto',
      }}
    >
      <ImageList cols={5}>{listMaterials(materials)}</ImageList>
    </div>
  );
};

export default ShowMaterials;
