// @ts-nocheck
import { SortableContainer, arrayMove } from 'react-sortable-hoc';
import { Theme, createStyles } from '@mui/material';
import { makeStyles } from '@mui/styles';

import SortableItem from './SortableItem';

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    test: {
      marginTop: '20px',
      borderRadius: '4px',
      height: '100%',
    },
    helper: {
      zIndex: 1300,
    },
    '@global': {
      '.sortable-ghost': {
        visibility: 'hidden',
      },
    },
  })
);

const SortableList = SortableContainer(
  ({
    items,
    edited,
    deleted,
    classes,
    disabled,
  }: {
    items: any[];
    edited: (newItem: any) => void;
    deleted: (id: string | number) => void;
    classes: any;
    disabled?: boolean;
  }) => {
    return (
      <div className={classes.test}>
        {items.map((value, index) => (
          <SortableItem
            key={value.id ?? `item-${index}`}
            index={index}
            value={value}
            edited={edited}
            deleted={deleted}
            disabled={disabled}
          />
        ))}
      </div>
    );
  }
);

interface Props {
  updateOptions: Function;
  updateOptionName: Function;
  items: any[];
  disabled?: boolean;
}

const SortableComponent = (props: Props) => {
  const { updateOptions, updateOptionName, items, disabled } = props;
  const classes = useStyles({});

  const onSortEnd = ({ oldIndex, newIndex }) => {
    updateOptions(arrayMove(items, oldIndex, newIndex));
  };

  const edited = (newItem) => {
    updateOptionName(newItem);
  };

  const deleted = (selectedItem) => {
    const newItems = items.filter((item) => item !== selectedItem);
    updateOptions(newItems);
  };

  return (
    <SortableList
      classes={classes}
      items={items}
      edited={edited}
      onSortEnd={onSortEnd}
      lockAxis="y"
      useDragHandle
      hideSortableGhost={false}     
      helperClass={classes.helper}
      deleted={deleted}
      disabled={disabled}
    />
  );
};

export default SortableComponent;
