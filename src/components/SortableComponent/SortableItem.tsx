import { useEffect, useState } from 'react';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { TextField, Typography, Theme } from '@mui/material';
import { Menu, Delete } from '@mui/icons-material';
import { createStyles, makeStyles } from '@mui/styles';
import classnames from 'classnames';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    '@global': {
      '.SortableHelper': {
        zIndex: 1300,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
      },
    },

    root: {
      display: 'grid',
      gridTemplateColumns: '80px 1fr 60px',
      justifyItems: 'center',
      alignItems: 'center',
      height: 62,
      borderTop: `1px solid ${theme.palette.grey[300]}`,
      borderBottom: `1px solid ${theme.palette.grey[300]}`,
      boxShadow: 'none',
      backgroundColor: theme.palette.background.default,
      '&:first-of-type': {
        borderTop: 'none',
      },
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
    noHover: {
      '&:hover': {
        backgroundColor: theme.palette.background.default,
      },
    },
    inputFocused: {
      fontSize: 18,
      color: theme.palette.text.primary,
    },
    textHolder: {
      height: 48,
      width: '100%',
      justifySelf: 'start',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      userSelect: 'none',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      verticalAlign: 'middle',
      fontSize: 18,
      color: theme.palette.grey[700],
    },
    dragHandle: {
      color: theme.palette.primary.main,
      cursor: 'grab',
    },
    disabledHandle: {
      color: theme.palette.grey[500],
    },
    textField: {},
  })
);

interface Props {
  value: { id: number; name: string };
  edited: (item: { id: number; name: string }) => void;
  deleted: (any) => void;
  disabled?: boolean;
}

const Item = (props: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.value.name);

  useEffect(() => {
    setName(props.value.name);
  }, [props.value]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const onChange = (event) => {
    setName(event.target.value.slice(0, 25));
  };

  const onBlur = () => {
    setIsEditing(false);
    const { name: originalName, id } = props.value;

    if (name !== originalName) {
      props.edited({ id, name });
    }
  };

  const onDelete = () => {
    props.deleted(props.value);
  };

  const classes = styles(props);
  const { disabled } = props;

  const DragHandle = SortableHandle(() => (
    <Menu className={classes.dragHandle} />
  ));

  return (
    <div
      className={
        disabled ? classnames(classes.root, classes.noHover) : classes.root
      }
    >
      {disabled ? <Menu className={classes.disabledHandle} /> : <DragHandle />}
      {isEditing ? (
        <div className={classes.textHolder}>
          <TextField
            classes={{ root: classes.textField }}
            autoFocus
            fullWidth
            onChange={onChange}
            name="name"
            value={name}
            onBlur={onBlur}
            margin="none"
            InputProps={{
              classes: {
                focused: classes.inputFocused,
              },
            }}
          />
        </div>
      ) : (
        <Typography
          component="span"
          className={classes.textHolder}
          onClick={disabled ? () => {} : startEditing}
        >
          {name}
        </Typography>
      )}
      {!disabled && <Delete onClick={onDelete} />}
    </div>
  );
};

export default SortableElement(Item);
