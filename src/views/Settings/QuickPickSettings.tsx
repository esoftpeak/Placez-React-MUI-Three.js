import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createStyles } from '@mui/styles';

import { Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { SortableComponent } from '../../components/SortableComponent';
import { AddPickListOption } from '../../reducers/settings';

import { PickListOption } from '../../api';
import { ReduxState } from '../../reducers';
import produce from 'immer';
import PlacezActionButton from '../../components/PlacezUIComponents/PlacezActionButton';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    sortableContainer: {
      flex: '1 1 auto',
      overflowY: 'auto',
    },
    actions: {
      gridColumn: '1 / span 2',
      marginTop: theme.spacing(4),

      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    actionButton: {
      padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
      margin: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      width: 200,
      height: 40,
    },
  })
);

interface Props {
  selectedPicklist: string;
}

const QuickPickSettings = (props: Props) => {
  const storePicklists = useSelector(
    (state: ReduxState) => state.settings.pickLists
  );

  const dispatch = useDispatch();

  const [inEdit, setInEdit] = useState<boolean>(false);
  const [selectedQuickPick, setSelectedQuickPick] = useState<string>('');
  const [currentPickListId, setCurrentPickLIstId] = useState<number>(0);
  const [currentOptions, setCurrentOptions] = useState<PickListOption[]>([]);
  const [picklists, setPicklists] = useState<any>(storePicklists);
  const [optionsBak, setOptionsBak] = useState<PickListOption[]>([]);

  const getName = (): string => {
    switch (selectedQuickPick) {
      case 'setup-style':
        return 'Setup Style';
      case 'status':
        return 'Scene Type';
      case 'client-type':
        return 'Client Type';
      case 'place-type':
        return 'Place Type';
      default:
        return '';
    }
  };

  const changePickList = (selectedListName: string) => {
    const currentPickList = picklists.find((list) => {
      return list.name === selectedListName;
    });
    if (!currentPickList) {
      return;
    }

    // setup ui with current picklist
    setSelectedQuickPick(selectedListName);
    setCurrentPickLIstId(currentPickList.id);
    setCurrentOptions(copyCurrentpicklistOptions(selectedListName));
  };

  useEffect(() => {
    if (props.selectedPicklist) {
      changePickList(props.selectedPicklist);
    }
  }, [props.selectedPicklist]);

  const handleChangePickList = (event) => {
    if (inEdit) {
      return;
    }

    const selectedListName = event.target.value;
    changePickList(selectedListName);
  };

  const onEdit = () => {
    setOptionsBak(currentOptions);
    setInEdit(true);
  };

  const onCancel = () => {
    setCurrentOptions(optionsBak);
    setInEdit(false);
  };

  const onSave = () => {
    setInEdit(false);
    saveOptions();
  };

  const saveOptions = () => {
    if (selectedQuickPick && storePicklists) {
      const prevOptions = storePicklists.find((list) => {
        return list.name === selectedQuickPick;
      }).picklistOptions;
      if (currentOptions) {
        dispatch(AddPickListOption(currentOptions, prevOptions));
      }
    }
  };

  const updateOptions = (changeOptions) => {
    updateOrder(changeOptions);
    saveOptions();
  };

  const updateOptionName = (changeOption) => {
    const newOptions = produce(currentOptions, (draftOptions) => {
      draftOptions.map((draftOption) => {
        if (draftOption.id === changeOption.id) {
          draftOption.name = changeOption.name;
        }
      });
    });

    updateOrder(newOptions);
  };

  const updateOrder = (options: PickListOption[]) => {
    setCurrentOptions(
      produce(options, (draftOptions: PickListOption[]) => {
        draftOptions.map((draftOption, index) => {
          draftOption.sortOrder = index;
        });
      })
    );
  };

  const addOption = () => {
    //  add new option to current options
    const newOptions = [...currentOptions];
    const newId = newOptions.filter((option) => option.id < 0).length + 1;

    const newOption = {
      id: 0,
      name: 'new',
      sortOrder: 9999,
      picklistId: currentPickListId,
    } as PickListOption;
    newOptions.push(newOption);

    const updatedPicklist = {
      ...picklists.find((list) => {
        return list.name === selectedQuickPick;
      }),
      picklistOptions: newOptions,
    };

    // update the current PickList with the new options
    const updatedPicklists = picklists.filter((list) => {
      return list.name !== selectedQuickPick;
    });
    updatedPicklists.push(updatedPicklist);

    setPicklists(updatedPicklists);
    setCurrentOptions(newOptions);
  };

  const copyCurrentpicklistOptions = (listName) => {
    const list = picklists.find((list) => {
      return list.name === listName;
    });
    if (list) {
      return [...list.picklistOptions].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
    }
    return [];
  };

  useEffect(() => {
    if (selectedQuickPick === '') changePickList('SetupStyle');
  }, [picklists]);

  useEffect(() => {
    setPicklists(storePicklists);
  }, [storePicklists]);

  useEffect(() => {
    saveOptions();
  }, [currentOptions]);

  const classes = styles(props);
  const theme = useTheme();
  return (
    <div className={classes.root}>
      <div className={classes.sortableContainer}>
        <SortableComponent
          updateOptions={updateOptions}
          updateOptionName={updateOptionName}
          items={currentOptions}
        />
      </div>
      <PlacezActionButton
        className={classes.actions}
        onClick={addOption}
        disabled={inEdit}
      >
        Add Picklist Option
      </PlacezActionButton>
    </div>
  );
};

export default QuickPickSettings;
