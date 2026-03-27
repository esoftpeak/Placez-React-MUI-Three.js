import {
  Button,
  DialogActions,
  DialogContent,
  Theme,
  useTheme,
} from '@mui/material';

import { createStyles } from '@mui/styles';

import { Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PlacezLongTextField from '../PlacezUIComponents/PlacezLongTextField';
import withModalContext, { WithModalContext } from './withModalContext';
import Note from '../../api/placez/models/PlacezNote';
import { useState } from 'react';

interface Props extends WithModalContext {
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  note: Note;
}

const styles = makeStyles<Theme>((theme: Theme) => createStyles({}));

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const NoteModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const theme = useTheme();
  const classes = styles(props);

  const [title, setTitle] = useState(props?.note?.title ?? '');
  const [content, setContent] = useState(props?.note?.content ?? '');

  const fieldBg = theme.palette.mode === 'dark'
    ? theme.palette.background.paper
    : '#fff';

  const fieldTextColor = theme.palette.text.primary;

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      open={true}
      aria-labelledby="place-modal"
      onClose={handleClose(modalProps)}
      fullWidth={true}
      scroll="paper"
      {...props}
    >
      <DialogContent style={{ backgroundColor: theme.palette.background.default }}>
        <PlacezLongTextField
          multiline
          id="note-title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          minRows={1}
          maxRows={1}
          style={{
            width: '100%',
            border: '1px solid #5C236F',
            borderRadius: '5px',
            overflow: 'hidden',
            background: fieldBg,
            marginBottom: '10px',
            color: fieldTextColor,
          }}
          inputProps={{
            style: {
              fontSize: '18px',
              color: fieldTextColor,
            },
          }}
        />

        <PlacezLongTextField
          multiline
          id="note-contents"
          placeholder="Note"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minRows={4}
          maxRows={12}
          style={{
            width: '100%',
            border: '1px solid #5C236F',
            borderRadius: '5px',
            overflow: 'hidden',
            background: fieldBg,
            color: fieldTextColor,
          }}
          inputProps={{
            style: {
              fontSize: '18px',
              color: fieldTextColor,
            },
          }}
        />
      </DialogContent>

      <DialogActions
        style={{
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Button variant="outlined"
          sx={(theme) => ({
            ...(theme.palette.mode === 'dark' && { color: theme.palette.common.white }),
          })}
          onClick={(e) => modalProps.modalContext.hideModal()}>
          Cancel
        </Button>

        {props?.note?.id && (
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              props.onDeleteNote(props.note.id);
              modalProps.modalContext.hideModal();
            }}
          >
            Delete
          </Button>
        )}

        <Button
          variant="outlined"
          color="primary"
          sx={(theme) => ({
            ...(theme.palette.mode === 'dark' && { color: theme.palette.common.white }),
          })}
          onClick={(e) => {
            props.onSaveNote({ title, content, id: props?.note?.id });
            modalProps.modalContext.hideModal();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(NoteModal);
