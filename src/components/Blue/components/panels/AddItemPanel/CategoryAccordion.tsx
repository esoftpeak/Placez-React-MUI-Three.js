import { Collapse, Theme, Typography, useTheme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import ItemList from './ItemList';
import { Asset } from '../../../../../blue/items/asset';
import { SecondaryCategory } from '../../../../../api';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react'

interface Props {
  onDragAsset: (event: any, dragType: string, asset: Asset) => void;
  category: SecondaryCategory;
  onSelect: (item: any) => void;
  selectedAsset: Asset;
}

const CategoryAccordion = (props: Props) => {
  const classes = styles(props);
  const { category, selectedAsset, onSelect } = props;

  const [expanded, setExpanded] = useState(false);
  const [detailHeight, setDetailHeight] = useState('0px');

  const handleChange = () => {
      setExpanded(!expanded);
      setDetailHeight(expanded ? '100px !important' : '200px !important'); // Adjust '100px' to desired partially shown height
  };
  const theme = useTheme();

  return (

    <div
      key={category.name}
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {category.itemSkus.length > 0 &&
        <>
          <div
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '20px', margin: '10px 0px' }}
          >
            <Typography variant="body1" className={classes.categoryName}>
              {category.name}
            </Typography>
          </div>
          <Collapse collapsedSize={'115px'} in={expanded}>
            <ItemList
              skus={category.itemSkus}
              onDragAsset={props.onDragAsset}
              onSelect={onSelect}
              selectedAsset={selectedAsset}
              cols={3}
            />
          </Collapse>
          <div style={{ height: '36px', backgroundColor: theme.palette.background.shadow, display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}
            onClick={handleChange}
          >
            {category.itemSkus.length > 3 &&
              <>
                {!expanded &&  <ExpandMore />}
                {expanded && <ExpandLess />}
              </>
            }
          </div>
        </>
      }

    </div>
  );
};

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
      gridTemplateColumns: '1fr 1fr',
      padding: '0px',
      width: '100%',
    },
  })
);

export default CategoryAccordion;
