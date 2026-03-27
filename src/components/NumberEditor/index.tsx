import React, { useEffect, useState } from 'react';
import { IconButton, Theme } from '@mui/material';

import { makeStyles, createStyles } from '@mui/styles';

import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

import classnames from 'classnames';
import { Utils } from '../../blue/core/utils';
import * as math from 'mathjs';
import { LocalStorageKey } from '../Hooks/useLocalStorageState';
import { ValidUnits } from '../../api/placez/models/UserSetting';
import NumberFormat from 'react-number-format';

const borderColor = '#FFFFFF';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flex: 1,
      minWidth: '0px',
      justifyContent: 'space-between',
    },
    buttonGroup: {
      display: 'flex',
      flex: 1,
      minWidth: '0px',
      justifyContent: 'center',
    },
    buttonIcon: {
      color: theme.palette.text.primary,
    },
    inputDark: {
      textAlign: 'center',
      background: 'transparent',
      color: theme.palette.text.primary,
      outline: 'none',
      position: 'relative',
      border: 'none',
      borderBottom: `1px solid ${theme.palette.text.disabled}`,
      '&:focus': {
        borderColor,
        outline: 'none',
      },
      marginTop: '1px',
      marginBottom: '1px',
      minWidth: '0px',
      flex: 1,
    },
    input: {
      minWidth: '0px',
      flex: 1,
      textAlign: 'center',
      background: 'transparent',
      color: theme.palette.text.primary,
      outline: 'none',
      position: 'relative',
      border: 'none',
      borderBottom: `1px solid ${theme.palette.text.disabled}`,
      '&:focus': {
        borderColor,
        outline: 'none',
      },
      marginTop: '1px',
      marginBottom: '1px',
    },
  })
);

type Props = {
  value: number; // Assumes this number is in cm
  round?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  dark?: boolean;
  allowZero?: boolean;
  unitless?: boolean;
};

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.stopPropagation();
  setTimeout(() => {
    e.target.select();
  }, 0);
};

const NumberEditor = (props: Props) => {
  const [units] = useState(() => {
    try {
      const storedValue = localStorage.getItem(LocalStorageKey.Units);
      return storedValue !== null ? JSON.parse(storedValue) : 'ftin';
    } catch {
      return 'ftin';
    }
  });

  const valueToString = (value: number): string => {
    if (props.unitless) {
      return `${Utils.roundDigits(value, props.round ? props.round : 0)}`;
    } else {
      return Utils.unitsOutString(value);
    }
  };

  const valueToFeet = (value: number): number => {
    const dimension = math.unit(value, 'cm');
    const split = dimension.splitUnit(['ft', 'in']);
    return split[0].toNumber('ft');
  };

  const valueToInch = (value: number): number => {
    const dimension = math.unit(value, 'cm');
    const split = dimension.splitUnit(['ft', 'in']);
    return split[1].toNumber('in');
  };

  const [stringValue, setStringValue] = useState(valueToString(props.value));
  const [feet, setFeet] = useState<number>(valueToFeet(props.value));
  const [inch, setInch] = useState<number>(valueToInch(props.value));

  useEffect(() => {
    setStringValue(valueToString(props.value));
    setFeet(valueToFeet(props.value));
    setInch(valueToInch(props.value));
  }, [props.value]);

  const parseInputValue = (value: string, unit?: string) => {
    setStringValue(value);
    let out;
    try {
      out = math.evaluate(value);
    } catch (error) {
      console.warn(error);
    }
    if (out) {
      if (props.unitless) {
        props.onChange(out.toNumber());
      } else if (!props.unitless && unit) {
        props.onChange(out.convert(unit).toNumber('cm'));
      } else {
        props.onChange(out.toNumber('cm'));
      }
    }
  };

  const unitChange = (change: string) => () => {
    if (props.unitless) {
      props.onChange(props.value + 1);
    } else {
      const out = math.evaluate(`${stringValue} ${change}`).toNumber('cm');
      props.onChange(out);
    }
  };

  const feetChange = (change: string) => () => {
    const out = math.evaluate(`${feet}ft ${change} + ${inch}in`).toNumber('cm');
    props.onChange(out);
  };

  const inchChange = (change: string) => () => {
    const out = math
      .evaluate(`${feet}ft  + ${inch}in ${change}`)
      .toNumber('cm');
    props.onChange(out);
  };

  const unitlessChange = (change: number) => () => {
    props.onChange(props.value + change);
  };

  const classes = styles(props);

  return (
    <>
      {props.unitless && (
        <div className={classes.buttonGroup}>
          <IconButton
            size="small"
            onClick={props.disabled ? () => {} : unitlessChange(-1)}
          >
            <RemoveIcon fontSize="inherit" />
          </IconButton>
          <NumberFormat
            disabled={props.disabled}
            className={
              props.dark
                ? classnames(classes.inputDark)
                : classnames(classes.input)
            }
            value={stringValue}
            defaultValue={0}
            decimalScale={0}
            displayType={props.disabled ? 'text' : 'input'}
            decimalSeparator={'.'}
            onChange={(e) => {
              const out = math.evaluate(e.target.value).toNumber();
              props.onChange(out);
            }}
            onFocus={handleFocus}
          />
          <IconButton
            size="small"
            onClick={props.disabled ? () => {} : unitlessChange(+1)}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </div>
      )}
      {units !== ValidUnits.ftIn && !props.unitless && (
        <div className={classes.buttonGroup}>
          <IconButton
            size="small"
            onClick={props.disabled ? () => {} : unitChange(`- 1${units}`)}
          >
            <RemoveIcon fontSize="inherit" />
          </IconButton>
          <NumberFormat
            style={{ flex: 1 }}
            disabled={props.disabled}
            className={
              props.dark
                ? classnames(classes.inputDark)
                : classnames(classes.input)
            }
            value={stringValue}
            suffix={units}
            defaultValue={0}
            decimalScale={units === ValidUnits.ft ? 2 : 0}
            displayType={props.disabled ? 'text' : 'input'}
            decimalSeparator={'.'}
            onChange={(e) => {
              const out = math.evaluate(e.target.value).toNumber('cm');
              props.onChange(out);
            }}
            onFocus={handleFocus}
          />
          <IconButton
            size="small"
            onClick={props.disabled ? () => {} : unitChange(`+ 1${units}`)}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </div>
      )}
      {units === ValidUnits.ftIn && !props.unitless && (
        <div style={{ display: 'flex' }}>
          <div className={classes.buttonGroup}>
            <IconButton
              size="small"
              onClick={props.disabled ? () => {} : feetChange(`- 1ft`)}
            >
              <RemoveIcon fontSize="inherit" />
            </IconButton>
            <NumberFormat
              disabled={props.disabled}
              className={
                props.dark
                  ? classnames(classes.inputDark)
                  : classnames(classes.input)
              }
              suffix={'ft'}
              value={feet}
              defaultValue={0}
              decimalScale={0}
              displayType={props.disabled ? 'text' : 'input'}
              decimalSeparator={'.'}
              onChange={(e) => {
                const out = math
                  .evaluate(`${e.target.value ?? '0ft'} + ${inch}in`)
                  .toNumber('cm');
                props.onChange(out);
              }}
              onFocus={handleFocus}
            />
            <IconButton
              size="small"
              onClick={props.disabled ? () => {} : feetChange(`+ 1ft`)}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </div>
          <div className={classes.buttonGroup}>
            <IconButton
              size="small"
              onClick={props.disabled ? () => {} : inchChange(`- 1in`)}
            >
              <RemoveIcon fontSize="inherit" />
            </IconButton>
            <NumberFormat
              disabled={props.disabled}
              className={
                props.dark
                  ? classnames(classes.inputDark)
                  : classnames(classes.input)
              }
              value={inch}
              suffix={'in'}
              defaultValue={0}
              decimalScale={0}
              displayType={props.disabled ? 'text' : 'input'}
              decimalSeparator={'.'}
              onChange={(e) => {
                const out = math
                  .evaluate(`${feet}ft  + ${e.target.value ?? '0in'}`)
                  .toNumber('cm');
                props.onChange(out);
              }}
              onFocus={handleFocus}
            />
            <IconButton
              size="small"
              onClick={props.disabled ? () => {} : inchChange(`+ 1in`)}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
};

export default NumberEditor;
