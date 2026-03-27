import { Theme } from '@mui/material';

import { createStyles } from '@mui/styles';

// Components
import { MenuItem, MenuList } from '@mui/material';
import { makeStyles } from '@mui/styles';

// Icons

import { Filter } from './Filters';

interface Props {
  selectedId?: number;
  filter: Filter<any>;
  onChange: any;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      margin: `0px ${theme.spacing(4)}px`,
      padding: '2px',
    },
    heading: {
      ...theme.typography.body2,
      fontSize: 11,
      textTransform: 'uppercase',
      paddingBottom: theme.spacing(),
      borderBottom: `solid 1px ${theme.palette.grey[400]}`,
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      minHeight: 16,
      width: 140,
      padding: `0px 0px 0px ${theme.spacing()}px`,
      fontSize: 14,
      fontWeight: 'bold',
    },
    itemName: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    selected: {
      border: `2px solid ${theme.palette.primary.main} !important`,
      borderRadius: '4px !important',
    },
  })
);

const MultiFilterMenu = (props: Props) => {
  const { filter, selectedId, onChange } = props;
  const classes = styles(props);
  return (
    <div className={classes.root}>
      <div className={classes.heading}>{filter.name}</div>
      <MenuList>
        {filter.items.map((item: any) => (
          <MenuItem
            key={`item-${item.name}-${item.id}`}
            onClick={() => {
              onChange(item.id);
            }}
            selected={selectedId === item.id}
            value={item.id}
            classes={{
              root: classes.item,
              selected: classes.selected,
            }}
          >
            <span className={classes.itemName}>{item.name}</span>
            {/* {selectedId === item.id ? <IconButton><RemoveIcon/></IconButton> : ''} */}
          </MenuItem>
        ))}
      </MenuList>
    </div>
  );
};

export default MultiFilterMenu;
