import { RotateLeft, RotateRight } from "@mui/icons-material"
import { IconButton, TextField, Tooltip } from "@mui/material"
import { useState } from "react"

type Props = {
  rotation: number; // should always be in radians
  setRotation: (rotation: number) => void;
  label: string;
  rotationAmount?: number;
  hideInput?: boolean;
  degrees?: boolean;
}

const RotationControls = (props: Props) => {
  const { rotation, setRotation, rotationAmount, hideInput, degrees } = props;

  const defaultRotationAmountDegrees = 180 / 8;
  const detentDegrees = rotationAmount ?? defaultRotationAmountDegrees;
  const detentRadians = (detentDegrees * Math.PI) / 180;

  const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

  const [rotationInDegrees, setRotationInDegrees] = useState(degrees ? rotation : radiansToDegrees(rotation));

  const handleRotationChange = (newRotationInDegrees: number) => {
    const newRotationInRadians = degreesToRadians(newRotationInDegrees);
    setRotation(degrees ? newRotationInDegrees : newRotationInRadians);
    setRotationInDegrees(newRotationInDegrees);
  };

  return (
    <div style={{ display: 'flex', justifyContent: hideInput ? 'end' : 'space-between', alignItems: 'center' }}>
      <Tooltip title="Rotate Clockwise">
        <IconButton
          onClick={() => handleRotationChange((rotationInDegrees - detentDegrees + 360) % 360)}
        >
          <RotateRight />
        </IconButton>
      </Tooltip>
      {!hideInput &&
        <form
          noValidate
          autoComplete="off"
        >
          <TextField
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const newDegrees = parseInt(e.target.value) % 360;
              handleRotationChange(isNaN(newDegrees) ? 0 : newDegrees);
            }}
            variant="standard"
            inputProps={{
              style: { textAlign: 'center' },
              maxLength: 3,
            }}
            FormHelperTextProps={{
              style: {
                textAlign: 'center',
              },
            }}
            value={rotationInDegrees}
          />
        </form>
      }
      <Tooltip title="Rotate Counterclockwise">
        <IconButton
          onClick={() => handleRotationChange((rotationInDegrees + detentDegrees) % 360)}
        >
          <RotateLeft />
        </IconButton>
      </Tooltip>
    </div>
  )
}

export default RotationControls;
