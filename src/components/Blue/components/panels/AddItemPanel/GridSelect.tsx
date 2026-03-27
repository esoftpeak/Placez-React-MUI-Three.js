import { IconButton, Theme, Tooltip, Typography, useTheme } from "@mui/material"
import { createStyles, makeStyles } from "@mui/styles"
import { Utils } from "../../../../../blue/core/utils"
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material"
import { useState } from "react"

interface Props {
  items: any[];
  onSelectItem: (item: any) => void;
  selectedItem: any;
  showThisMany?: number;
}

const gap = '5px';
const tileHeight = 90;

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      gridTemplateColumns: `1fr 1fr 1fr 1fr`,
      gridAutoRows: tileHeight + 'px',
      gridGap: gap,
      margin: gap,
    },
    swatch: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '&:hover': {
        transform: 'scale(1.05)',
      },
      backgroundColor: theme.palette.background.shadow,
    },
    selected: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '&:hover': {
        transform: 'scale(1.05)',
      },
      backgroundColor: theme.palette.secondary.main,
    },
    input: {
      gridColumn: '4/-1',
    },
  })
);

const GridSelect = (props: Props) => {

  const classes = styles(props);
  const { items, onSelectItem, selectedItem, showThisMany} = props;
  const howManyItems = showThisMany ?? 8;
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className={classes.root}
        style={{
          maxHeight: expanded ? '' : howManyItems / 4 * tileHeight + 'px',
          overflow: 'hidden',
        }}
      >
        {items.map((item) => (
          <Tooltip key={item.name} title={item.label}>
            <div
              key={item.id}
              className={selectedItem === item.name ? classes.selected : classes.swatch}
              onClick={() => onSelectItem(item)}
            >
              <div
                style={{
                  fontSize: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}>
                {item.icon ?? Utils.GetInitials(item.name)}
              </div>
              {!item.icon && <Typography variant="body2" style={{margin: '5px',  whiteSpace: 'nowrap'}}>{item.name}</Typography>}
            </div>
          </Tooltip>
        ))}
      </div>
      {items.length > howManyItems &&
        <div style={{gridColumn: 'span 4', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <IconButton onClick={e => setExpanded(!expanded)}>
            { expanded ?
              <KeyboardArrowUp/> :
              <KeyboardArrowDown/>
            }
          </IconButton>
        </div>
      }
    </div>
  )
}

export default GridSelect
