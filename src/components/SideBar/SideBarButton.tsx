import { ReactElement } from 'react';
import {
  Grow,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  Tooltip,
} from '@mui/material';
import sideBarStyles from '../Styles/sideBarStyles.css';
import { makeStyles } from '@mui/styles';

interface Props {
  onClick?: () => void;
  selected?: boolean;
  label: string;
  children?: ReactElement<any>;
  disabled?: boolean;
}

const SideBarButton = (props: Props) => {
  const { label, selected, disabled, onClick } = props;

  const styles = makeStyles<Theme>(sideBarStyles);
  const classes = styles(props);

  return (
    <Grow in={true}>
      <div className={classes.rootSBB}>
        <ListItem
          disabled={disabled}
          button
          selected={selected}
          className={classes.listItem}
          onClick={onClick}
          classes={{ selected: classes.activeLink }}
        >
          <Tooltip title={label} placement="right">
            <ListItemIcon classes={{ root: classes.icon }}>
              {props.children}
            </ListItemIcon>
          </Tooltip>
          <ListItemText classes={{ primary: classes.label }} primary={label} />
        </ListItem>
      </div>
    </Grow>
  );
};

export default SideBarButton;
