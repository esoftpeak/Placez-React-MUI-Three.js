import * as React from 'react';
import {
  DropDownList,
  DropDownListChangeEvent,
} from '@progress/kendo-react-dropdowns';
import { GridCellProps } from '@progress/kendo-react-grid';
import { BillingRate } from '../../../blue/core/utils';
import { createStyles, makeStyles } from '@mui/styles';

const styles = makeStyles(() =>
  createStyles({
    DropDownCell: {
      width: '100px',
      '& .k-animation-container': {
        position: 'fixed',
        zIndex: 980,
      },
    },
  })
);

export const DropDownCell = (props: GridCellProps) => {
  const localizedData = Object.values(BillingRate)
    .filter((v) => isNaN(Number(v)))
    .map((rate) => {
      return {
        value: BillingRate[rate],
        text: rate,
      };
    });

  const handleChange = (e: DropDownListChangeEvent) => {

    if (props.onChange) {
      (props.onChange as any)({
        dataIndex: 0,
        dataItem: props.dataItem,
        field: props.field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value,
      });
    }
  };

  const { dataItem } = props;
  const field = props.field || '';
  const dataValue = dataItem[field] ?? '';

  const classes = styles(props);

  return (
    <td>
      {dataItem.inEdit ? (
        <DropDownList
          className={classes.DropDownCell}
          onChange={handleChange}
          value={localizedData.find((c) => {
            return c.value === dataValue;
          })}
          dataItemKey="value"
          data={localizedData}
          textField="text"
        />
      ) : (
        BillingRate[dataValue]
      )}
    </td>
  );
};
