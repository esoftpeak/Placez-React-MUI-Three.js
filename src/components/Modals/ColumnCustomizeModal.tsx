import React, { useState, useEffect, useCallback } from 'react';
import withModalContext, { WithModalContext } from './withModalContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Checkbox,
  useTheme,
} from '@mui/material';
import { DragHandle } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import formModalStyles from '../Styles/FormModal.css';

export interface ColumnVisibility {
  field: string;
  title: string;
  visible: boolean;
}

interface Props extends WithModalContext {
  onExportPDF: () => void;
  onExportExcel: () => void;
  columnVisibility: ColumnVisibility[];
  onColumnVisibilityChange: (columns: ColumnVisibility[]) => void;
}

interface DragItem {
  index: number;
  field: string;
  type: string;
}

interface DraggableListItemProps {
  column: ColumnVisibility;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  onColumnToggle: (field: string) => void;
  classes: any;
}

const ItemType = 'COLUMN';

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  column,
  index,
  moveColumn,
  onColumnToggle,
  classes,
}) => {
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index, field: column.field, type: ItemType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (!drag) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={classes.gridItem}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div
        className={classes.columnBox}
        style={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 6,
          color: theme.palette.text.primary,
        }}
      >
        <div className={classes.columnInfo}>
          <Checkbox
            checked={column.visible}
            onChange={() => onColumnToggle(column.field)}
            sx={{
              color: theme.palette.text.primary,
              '&.Mui-checked': { color: theme.palette.primary.main },
            }}
          />
          <span
            className={classes.columnTitle}
            style={{
              color: theme.palette.text.primary,
            }}
          >
            {column.title}
          </span>
        </div>

        <DragHandle style={{ cursor: 'grab', color: theme.palette.text.primary }} />
      </div>
    </div>
  );
};

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const ColumnCustomizeModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const [localColumns, setLocalColumns] = useState<ColumnVisibility[]>(
    modalProps.columnVisibility || []
  );

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  useEffect(() => {
    setLocalColumns(modalProps.columnVisibility || []);
  }, [modalProps.columnVisibility]);

  const handleColumnToggle = (field: string) => {
    const updatedColumns = localColumns.map((column) =>
      column.field === field ? { ...column, visible: !column.visible } : column
    );
    setLocalColumns(updatedColumns);
  };

  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      const draggedColumn = updatedColumns[dragIndex];
      updatedColumns.splice(dragIndex, 1);
      updatedColumns.splice(hoverIndex, 0, draggedColumn);
      return updatedColumns;
    });
  }, []);

  const handleSave = () => {
    modalProps.onColumnVisibilityChange(localColumns);
    modalProps.modalContext.hideModal();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog
        classes={{
          paper: classes.modal,
        }}
        open={true}
        aria-labelledby="place-modal"
        maxWidth="sm"
        fullWidth={true}
        onClose={handleClose(modalProps)}
        {...props}
      >
        <DialogTitle className={classes.dialogTitle}>Customize</DialogTitle>
        <DialogContent
          className={classes.dialogContent}
          style={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '30px',
            height: '300px',
          }}
        >
          <div className={classes.gridContainer}>
            {localColumns.map((column, index) => (
              <DraggableListItem
                key={column.field}
                column={column}
                index={index}
                moveColumn={moveColumn}
                onColumnToggle={handleColumnToggle}
                classes={classes}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            variant="outlined"
            sx={(theme) => ({
              ...(theme.palette.mode === 'dark' && { color: theme.palette.common.white }),
            })}
            onClick={(e) => modalProps.modalContext.hideModal()}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

export default withModalContext(ColumnCustomizeModal);
