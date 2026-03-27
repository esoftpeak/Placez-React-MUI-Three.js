import { Checkbox, Divider, Theme } from '@mui/material';

import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

import settingStyles from '../../components/Styles/SettingStyles.css';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../components/Hooks/useLocalStorageState';

interface Props {}

const CollisionSettings = (props: Props) => {
  const styles = makeStyles<Theme>(settingStyles);
  const classes = styles(props);

  const [collisionPrevention, setCollisionPrevention] = useLocalStorageState(
    LocalStorageKey.CollisionPrevention
  );
  const [collisionDetection, setCollisionDetection] = useLocalStorageState(
    LocalStorageKey.CollisionDetection
  );
  const [keepInRoom, setKeepInRoom] = useLocalStorageState(
    LocalStorageKey.KeepInRoom
  );
  const [snapPosition, setSnapPosition] = useLocalStorageState(
    LocalStorageKey.SnapPosition
  );

  const [twentyFourHourTime, setTwentyFourHourTime] = useLocalStorageState(
    LocalStorageKey.TwentyFourHourTime
  );

  return (
    <div className={classes.root}>
      <div className={classes.form}>
        <div className={classes.formControl}>
          <Typography variant="body1">Collision Prevention</Typography>
          <Checkbox
            checked={collisionPrevention}
            onChange={(e) => setCollisionPrevention(e.target.checked)}
          />
        </div>
        <Divider />
        <div className={classes.formControl}>
          <Typography variant="body1">Collision Detection</Typography>
          <Checkbox
            checked={collisionDetection}
            onChange={(e) => setCollisionDetection(e.target.checked)}
          />
        </div>
        <Divider />
        <div className={classes.formControl}>
          <Typography variant="body1">Keep In Room</Typography>
          <Checkbox
            checked={keepInRoom}
            onChange={(e) => setKeepInRoom(e.target.checked)}
          />
        </div>
        <Divider />
        <div className={classes.formControl}>
          <Typography variant="body1">Snap Position</Typography>
          <Checkbox
            checked={snapPosition}
            onChange={(e) => setSnapPosition(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default CollisionSettings;
