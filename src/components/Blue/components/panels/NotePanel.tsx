import { forwardRef } from 'react';
import PlacezNote from '../../../../api/placez/models/PlacezNote';
import { createStyles, makeStyles } from '@mui/styles';
import { ImageList, ImageListItem, Theme, Typography } from '@mui/material';
import NoteModal from '../../../Modals/NoteModal';
import { ModalConsumer } from '../../../Modals/ModalContext';

interface Props {
  notes: PlacezNote[];
  onDeleteNote?: (id: string) => void;
  onSaveNote?: (note: PlacezNote) => void;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
    },

    imageListContainer: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    note: {
      ...theme.PlacezBorderStyles,
      padding: '20px',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      '&:hover': {
        cursor: 'pointer',
      },
    },
    noteContent: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
      height: '100px',
      maxHeight: '100px',
      minHeight: '100px',
      overflowY: 'auto',
    },
  })
);

const NotePanel = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
  const classes = styles(props);
  const { onSaveNote, onDeleteNote } = props;
  return (
    <div className={classes.root} ref={ref}>
      <ImageList
        variant="masonry"
        cols={3}
        gap={12}
        className={classes.imageListContainer}
      >
        {props.notes.map((note: PlacezNote, index) => (
          <ImageListItem key={note.id} className={classes.note}>
            <ModalConsumer>
              {({ showModal, props }) => (
                <div
                  onClick={() => {
                    if (onSaveNote && onDeleteNote) {
                      showModal(NoteModal, {
                        ...props,
                        note,
                        onSaveNote,
                        onDeleteNote,
                      });
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{
                      marginBottom: '8px',
                      height: '40px',
                      overflowY: 'hidden',
                    }}
                  >
                    {note.title}
                  </Typography>

                  <Typography className={classes.noteContent}>
                    {note.content}
                  </Typography>
                </div>
              )}
            </ModalConsumer>
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
});

export default NotePanel;
