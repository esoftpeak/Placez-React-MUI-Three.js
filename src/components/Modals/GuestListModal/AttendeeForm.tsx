import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers/index';
import {
  CreateAttendee,
  UpdateAttendee,
  UpdateAttendees,
} from '../../../reducers/attendee';
import { Attendee } from '../../../api';
import { WithModalContext } from '../withModalContext';
import XLSX from 'xlsx';

import { Theme } from '@mui/material';


import {
  DialogActions,
  DialogContent,
  Button,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import '@mui/material/';
import FileSelector from '../../Utils/FileSelector';
import { Utils } from '../../../blue/core/utils';
import {
  Input as InputIcon,
  DeleteSweep,
  CloudDownload,
} from '@mui/icons-material';
import { AttendeeModalState } from '../../../models/AttendeeModalState';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { orderBy } from '@progress/kendo-data-query';
import { AttendeeMetadata } from '../../../api/placez/models/Attendee';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { UniversalModalWrapper } from '../UniversalModalWrapper'
import { AreYouSureDelete } from '../UniversalModal'
import { tableStyles } from '../../Tables/tableSyles.css'
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton'
import { DownloadPDFIcon, DownloadXLSXIcon } from '../../../assets/icons'

interface Props extends WithModalContext {}

const AttendeeForm = (props: Props) => {
  const [attendeeModalState, setAttendeeModalState] = useState(
    AttendeeModalState.ImportAttendee
  );
  const [attendeesChanged, setAttendeesChanged] = useState(false);
  const [attendeeSelectedRow, setAttendeeSelectedRow] = useState(0);
  const [sort, setSort] = useState([]);
  const [modifiedAttendee, setModifiedAttendee] = useState(undefined);

  const dispatch = useDispatch();
  const attendees = useSelector(
    (state: ReduxState) => state.attendee.attendees
  );

  const handleFieldChange = (prop: string) => (event: any) => {
    setModifiedAttendee({
      ...modifiedAttendee,
      [prop]: event.target.value,
    });
  };

  const handleSaveAttendeesToLayout = () => {
    props.modalContext.hideModal();
  };

  const handleFileSubmit = (files: FileList) => {
    readFile(files);
  };

  const readFile = async (files: FileList) => {
    const reader = new FileReader();
    reader.readAsBinaryString(files[0]);

    reader.onload = () => {
      const wb: XLSX.WorkBook = XLSX.read(reader.result, {
        type: 'binary',
      });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      applyAttendees(json as Attendee[]);
    };
  };

  const applyAttendees = (loadedAttendees: Attendee[]) => {
    const newAttendees = loadedAttendees.map((elem) => {
      const ret: Attendee = {};
      Object.keys(elem).forEach((k) => {
        ret[Utils.camelize(k)] = elem[k];
      });
      return ret;
    });

    const importedAttendee = newAttendees.filter(
      (attendee) => attendee.firstName
    );
    const allAttendees = [...attendees, ...importedAttendee];

    setAttendeesChanged(true);
    setAttendeeModalState(AttendeeModalState.ListView);
    dispatch(UpdateAttendees(allAttendees));
  };

  useEffect(() => {
    if (attendees.length) {
      setAttendeeModalState(AttendeeModalState.ListView);
    }
  }, []);

  const switchToImport = (e) => {
    setAttendeeModalState(AttendeeModalState.ImportAttendee);
  };

  const clearAttendees = (e) => {
    const emptyAttendees = [] as Attendee[];
    dispatch(UpdateAttendees(emptyAttendees));
  };

  const exportAttendees = (e) => {
    const fileName = 'attendees.xlsx';
    const filterOut = [
      'id',
      'layoutId',
      'deleted',
      'createdUtcDateTime',
      'lastModifiedBy',
      'createdBy',
      'lastModifiedUtcDateTime',
    ];
    const cleanAttendees = JSON.parse(JSON.stringify(attendees));
    cleanAttendees.forEach((attendee) => {
      filterOut.forEach((key) => {
        delete attendee[key];
      });
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(cleanAttendees);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'test');
    XLSX.writeFile(wb, fileName);
  };

  const updateAttendee = (attendee: Attendee) => {
    const updatedAttendee = {
      ...attendee,
      ...modifiedAttendee,
    };

    const newAttendee = !attendee.id;
    if (newAttendee) {
      dispatch(CreateAttendee(updatedAttendee));
    } else {
      dispatch(UpdateAttendee(updatedAttendee));
    }

    setAttendeeModalState(AttendeeModalState.ListView);
  };

  const handleSave = (e) => {
    e.preventDefault();

    switch (attendeeModalState) {
      case AttendeeModalState.ListView:
        handleSaveAttendeesToLayout();
        break;
      case AttendeeModalState.ImportAttendee:
        break;
      default:
    }
  };

  const { hideModal } = props.modalContext;
  const styles = makeStyles<Theme>(tableStyles);
  const classes = styles(props);

  let gridPDFExport: GridPDFExport | null;
  const exportPDF = () => {
    if (gridPDFExport !== null) {
      gridPDFExport.save();
    }
  };

  const attendeeGrid = (
    <Grid
      sortable
      sort={sort}
      onSortChange={(e) => setSort(e.sort)}
      selectedField="selected"
      data={orderBy(attendees, sort)}
    >
      {AttendeeMetadata.filter(
        (metadata) => metadata !== 'tableInfo' && metadata !== 'chairNumber'
      ).map((metadata) => {
        return (
          <GridColumn
            field={metadata}
            title={Utils.camelToUpperCase(metadata)}
            key={metadata}
          />
        );
      })}
    </Grid>
  );

  const pdfGrid = (
    <Grid
      sortable
      sort={sort}
      onSortChange={(e) => setSort(e.sort)}
      selectedField="selected"
      data={orderBy(attendees, sort)}
      scrollable={'none'}
      className={classes.gridRoot}
    >
      {AttendeeMetadata.filter(
        (metadata) => metadata !== 'tableInfo' && metadata !== 'chairNumber'
      ).map((metadata) => {
        return (
          <GridColumn
            field={metadata}
            title={Utils.camelToUpperCase(metadata)}
            key={metadata}
          />
        );
      })}
    </Grid>
  );

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '10px 20%'
      }}>
        <Button
          href={`${import.meta.env.VITE_APP_PLACEZ_API_URL}/Assets/e63e74f2-7199-42f1-bee8-259e5d7d61d4.csv`}
        >
          <CloudDownload className={classes.attendeeCRUDbutton} />
          &nbsp;Template
        </Button>
        <div>
          <FileSelector
            customID="AttendeeCSV"
            handleFileSubmit={handleFileSubmit}
            accept=".csv, .xls, .xlsx"
            optionButton={
              <Button>
                <InputIcon className={classes.attendeeCRUDbutton} />
                &nbsp;Import
              </Button>
            }
          />
        </div>
        <UniversalModalWrapper
          onDelete={clearAttendees}
          modalHeader="Are you sure?"
        >
          <Tooltip title="Delete All">
            <Button>
              <DeleteSweep className={classes.attendeeCRUDbutton} />
              &nbsp;Clear
            </Button>
          </Tooltip>
          {AreYouSureDelete('All Guests', false)}
        </UniversalModalWrapper>
        <Button
          onClick={(e) => exportAttendees(e)}
        >
          <DownloadXLSXIcon className={classes.attendeeCRUDbutton} />
          &nbsp;Excel
        </Button>
        <Button onClick={exportPDF}>
          <DownloadPDFIcon className={classes.attendeeCRUDbutton} />
          &nbsp;PDF
        </Button>
      </div>
      <DialogContent dividers={false} className={classes.content}>
          {attendeeGrid}
          <GridPDFExport ref={(pdfExport) => (gridPDFExport = pdfExport)}>
            {pdfGrid}
          </GridPDFExport>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <PlacezActionButton
          onClick={(e) => handleSave(e)}
        >
          Save
        </PlacezActionButton>
        <PlacezActionButton
          onClick={(e) => props.modalContext.hideModal()}
        >
          Close
        </PlacezActionButton>
      </DialogActions>
    </>
  );
};


export default AttendeeForm;
