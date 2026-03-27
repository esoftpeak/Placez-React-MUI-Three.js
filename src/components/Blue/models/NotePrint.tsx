import { Fragment, forwardRef } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { ImageListItem, Theme, Typography } from '@mui/material';
import PlacezNote from '../../../api/placez/models/PlacezNote';

interface Props {
  notes: PlacezNote[];
  sceneName?: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      padding: '0px',
    },
    imageListContainer: {
      flex: 1,
      overflow: 'scroll',
      marginTop: '0px',
    },
    note: {
      padding: '10px',
    },
  })
);

const NotePrint = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
  const classes = styles(props);
  return (
    <div className={classes.root} ref={ref}>
      {props.sceneName &&
        <Typography variant="h5" style={{ marginBottom: '8px' }}>
          {props.sceneName} Notes
        </Typography>
      }
      {props.notes.map((note: PlacezNote, index) => (
        <ImageListItem key={note.id} className={classes.note}>
          <div>
            <Typography variant="h6" style={{ marginBottom: '8px' }}>
              {note.title}
            </Typography>
            {note.content.split('\n').map((line, index) => (
              <Fragment key={index}>
                {line}
                <br />
              </Fragment>
            ))}
          </div>
        </ImageListItem>
      ))}
    </div>
  );
});

export default NotePrint;
