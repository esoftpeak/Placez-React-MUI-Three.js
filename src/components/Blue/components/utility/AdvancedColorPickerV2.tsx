import {
  Checkbox, IconButton, Input,
  MenuItem,
  Select,
  Theme,
  Typography,
} from '@mui/material';
import panelStyles from '../../../Styles/panels.css';
import { useEffect, useMemo, useState } from 'react';
import ColorPickerV2 from './ColorPickerV2';
import {
  colorNames,
  Colors,
} from '../../../../api/placez/models/PlacezMaterial';
import { ChromePicker } from 'react-color';
import { createStyles, makeStyles } from '@mui/styles';
import { Clear, Search } from '@mui/icons-material';

interface Props {
  color: string;
  onChange: (e) => void;
  width?: string;
  advanced?: boolean;
}


const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    selectContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // margin: '10px 0',
      marginTop: '10px',
      marginBottom: '10px',
      padding: '0 10px',
      height: '36px',
    },
    selectField: {
      flex: 1,
      marginRight: '50px',
      maxWidth: '120px',
      marginTop: '1px',
      '& .MuiSelect-select': {
        fontSize: '14px',
      },
    },
    searchField: {
      flex: 1,
      '& .MuiInputBase-input': {
        fontSize: '14px',
      },
    },
  })
);


const AdvancedColorPickerV2 = (props: Props) => {
  const styles = makeStyles<Theme>((theme) => panelStyles(theme));
  const customStyles = useStyles(props);

  const classes = { ...styles(props), ...customStyles };
  const [showAdvancedColors, setShowAdvancedColors] = useState(
    props?.advanced || false
  );

  useEffect(() => {
    setShowAdvancedColors(props.advanced);
  }, [props.advanced]);

  const [activeType, setActiveType] = useState('Suggested');
  const [colorFilter, setColorFilter] = useState('');
  const handleClearSearch = () => {
    setColorFilter('')
  }

  const filteredColors = useMemo(() => {
    if (!colorFilter.trim()) {
      return Colors;
    }
    const filterLower = colorFilter.toLowerCase();

    return Colors.filter(color => {
      const hex = color.toLowerCase();

      for (const [name, hexValues] of Object.entries(colorNames)) {
        if (name.includes(filterLower) && hexValues.includes(hex)) {
          return true;
        }
      }
      return hex.includes(filterLower);
    });
  }, [colorFilter]);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className={classes.selectContainer}>
        <Select
          className={classes.selectField}
          id="placeSelect"
          variant="standard"
          value={activeType}
          onChange={(e) => setActiveType(e.target.value)}
        >
          {['Suggested', 'Advanced'].map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
        <Input
          className={classes.searchField}
          placeholder={props.color ? props.color :'Search'}
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          endAdornment={
            colorFilter !== '' ? (
              <IconButton onClick={handleClearSearch} size="small">
                <Clear />
              </IconButton>
            ) : (
              <IconButton size="small">
                <Search />
              </IconButton>
            )
          }
        />
      </div>

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

      {activeType === 'Suggested' && (
        <ColorPickerV2
          color={props.color}
          colors={filteredColors}
          onChange={props.onChange}
        />
      )}

      {activeType === 'Advanced' && (
        <div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'start',
            justifyContent: 'center',
            padding: '15px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'start',
              marginBottom: '15px',
            }}
          >
            <div
              style={{
                width: '110px',
                height: '124px',
                backgroundColor: props.color,
              }}
            />
          </div>

          {/* Chrome picker */}
          <ChromePicker
            color={props.color}
            height="100px"
            onChangeComplete={props.onChange}
            disableAlpha
            styles={{
              default: {
                picker: {
                  boxShadow: 'none',
                  fontFamily: 'inherit',
                  borderRadius: '4px',
                },
                hue: {
                  width: '335px',
                  marginLeft: '-125px',
                  borderRadius: '4px',
                },
                swatch: {
                  display: 'none',
                }
              },
            }}
          />
          <style>
            {`
                .flexbox-fix:last-child {
                  display: none !important;
                }
              `}
          </style>
        </div>
          {/*<div>*/}

          {/*<Input*/}
          {/*  className={classes.searchField}*/}
          {/*  placeholder="Search"*/}
          {/*  value={props.color}*/}
          {/*  // onChange={(e) => setAssetFilter(e.target.value)}*/}
          {/*  endAdornment={*/}
          {/*    <IconButton onClick={handleClearSearch} size="small">*/}
          {/*      <Clear />*/}
          {/*    </IconButton>*/}
          {/*  }*/}
          {/*/>*/}
          {/*</div>*/}
        </div>
      )}
    </div>
  );
};

export default AdvancedColorPickerV2;
