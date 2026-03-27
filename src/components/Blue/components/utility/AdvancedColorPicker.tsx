import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Theme,
  Typography,
} from '@mui/material';
import panelStyles from '../../../Styles/panels.css';
import { useEffect, useState } from 'react';
import ColorPicker from './ColorPicker';
import {
  Colors,
  MinifiedColors,
} from '../../../../api/placez/models/PlacezMaterial';

import { ChromePicker } from 'react-color';
import { makeStyles } from '@mui/styles';
import { ExpandMore } from '@mui/icons-material';

interface Props {
  color: string;
  onChange: (e) => void;
  width?: string;
  advanced?: boolean;
}

const AdvancedColorPicker = (props: Props) => {
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles(props);

  const [showAllColors, setShowAllColors] = useState(true);
  const [showAdvancedColors, setShowAdvancedColors] = useState(
    props?.advanced || false
  );

  useEffect(() => {
    setShowAdvancedColors(props.advanced);
  }, [props.advanced]);

  return (
    <>
      {props.advanced === undefined && (
        <div className={classes.headingContainerLight}>
          <Typography className={classes.heading} align="center">
            Advanced Colors
          </Typography>
          <Checkbox
            size="small"
            checked={showAdvancedColors}
            onChange={(e, v) => setShowAdvancedColors(v)}
          />
        </div>
      )}
      <Accordion
        expanded={!showAdvancedColors}
        onChange={() => setShowAdvancedColors(!showAdvancedColors)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          Color Picker
        </AccordionSummary>
        <AccordionDetails>
          <div className={classes.circlePickerContainer}>
            {!showAllColors && (
              <ColorPicker
                width={'360px'}
                color={props.color}
                colors={MinifiedColors}
                // className={classes.picker}
                onChange={props.onChange}
              />
            )}
            {showAllColors && (
              <ColorPicker
                width={'380px'}
                color={props.color}
                colors={Colors}
                // className={classes.picker}
                onChange={props.onChange}
              />
            )}
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={showAdvancedColors}
        onChange={() => setShowAdvancedColors(!showAdvancedColors)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          Advanced Color
        </AccordionSummary>
        <AccordionDetails>
          <div
            className={classes.pickerContainer}
            id="nfc"
            style={{
              marginTop: '5px',
            }}
          >
            <ChromePicker
              width={'300px'}
              color={props.color}
              onChangeComplete={props.onChange}
            />
          </div>
        </AccordionDetails>
      </Accordion>
      {/* {!showAdvancedColors && (
        <div className={classes.circlePickerContainer}>
          <ColorPicker
            width={'380px'}
            color={props.color}
            colors={Colors}
            // className={classes.picker}
            onChange={props.onChange}
          />
        </div>
      )}
      {showAdvancedColors && (
        <div
          className={classes.pickerContainer}
          id="nfc"
          style={{
          }}
        >
          <ChromePicker
            width={'320px'}
          color={props.color} onChangeComplete={props.onChange} />
        </div>
      )} */}
    </>
  );
};

export default AdvancedColorPicker;
