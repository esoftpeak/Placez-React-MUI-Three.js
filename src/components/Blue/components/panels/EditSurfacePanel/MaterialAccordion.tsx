import { Collapse, IconButton, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react'
import { PlacezMaterial } from '../../../../../api/placez/models/PlacezMaterial'
import MaterialTile from './MaterialTile'

interface Props {
  materials: PlacezMaterial[];
  category: string;
  setMaterial: (material: PlacezMaterial) => void;
}


const MaterialAccordion = (props: Props) => {
  const classes = styles(props);
  const { category, materials, setMaterial } = props;

  const [expanded, setExpanded] = useState(false);

  const handleChange = () => {
      setExpanded(!expanded);
  };

  return (
    <div
      key={category}
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {materials.length > 0 &&
        <>
          <div
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '20px' }}
            onClick={handleChange}
          >
            <Typography variant="body1" className={classes.categoryName}>
              {category}
            </Typography>
            {materials.length > 3 &&
            <IconButton>
              {!expanded &&  <ExpandMore />}
              {expanded && <ExpandLess />}
            </IconButton>
            }
          </div>
          <Collapse collapsedSize={'148px'} in={expanded}>
            <div className={classes.itemList}>

            {materials
              .map((material) => (
                <MaterialTile
                  material={material}
                  setMaterial={setMaterial}

                />
              ))
            }
            </div>
          </Collapse>
        </>
      }

    </div>
  );
};

const gap = '6px';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    categoryName: {
      display: 'inline',
      color: theme.palette.text.primary,
    },
    accordionList: {
      display: 'grid',
      width: '100%',
      minWidth: '0px',
      gridTemplateColumns: '1fr',
      rowGap: '2px',
    },
    detailsRoot: {
      minHeight: '100px !important',
      visibility: 'visible',
    },
    itemList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: gap,
      padding: gap,
      width: '100%',
    },
  })
);

export default MaterialAccordion;
