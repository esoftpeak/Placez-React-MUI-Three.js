import { Add, Cancel, Delete, Edit, Save } from '@mui/icons-material';
import * as React from 'react';

export const MyCommandCell = (props) => {
  const { dataItem } = props;
  const inEdit = dataItem[props.editField];
  const id = dataItem.id;

  const isNewItem = dataItem.id === undefined;

  return inEdit ? (
    <td className="k-command-cell">
      {isNewItem && (
        <>
          <Add onClick={() => props.add(dataItem)} />
          <Delete onClick={() => props.remove(dataItem)} />
        </>
      )}
      {!isNewItem && (
        <>
          <Save color="primary" onClick={() => props.update(dataItem)} />
          <Cancel onClick={() => props.cancel(dataItem)} />
        </>
      )}
    </td>
  ) : id ? (
    <td className="k-command-cell">
      <Edit onClick={() => props.edit(dataItem)} />
      <Delete color="error" onClick={() => props.remove(dataItem)} />
    </td>
  ) : (
    <td className="k-command-cell" />
  );
};
