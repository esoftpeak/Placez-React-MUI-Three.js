import React, { createRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';

import { createSelector } from 'reselect';

import { Theme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { DoneAll, Clear, ExpandMore } from '@mui/icons-material';

import Scene from '../../../api/placez/models/Scene';
import { getClientById } from '../../../reducers/client';
import PlacezLayoutPlan from '../../../api/placez/models/PlacezLayoutPlan';
import {
  Stepper,
  Typography,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  DialogContent,
  DialogActions,
  DialogTitle,
  useTheme,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ReactToPrint from 'react-to-print';
import { Print } from '@mui/icons-material';
import { Attendee, placezApi } from '../../../api';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import hideHeaderFooter from '../../../assets/images/hideHeaderFooter.png';
import { AttendeeMetadata } from '../../../api/placez/models/Attendee';
import { Utils } from '../../../blue/core/utils';
import { getEntrees } from '../../../reducers/attendee';

import placezLogoPurple from '../../../assets/images/placezLogoPurplex512.png';
import TableList from './TableList';
import AttendeeList from './AttendeeList';
import { autoCropper } from '../../../helpers/autoCropper';
import InventoryList from './InventoryList';
import EntreeList from './EntreeList';
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from '../../../sharing/utils/localStorageHelper';
import { SkuType } from '../../../blue/items/asset';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../Hooks/useLocalStorageState';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import NotePrint from '../../Blue/models/NotePrint';
import FileSelector from '../../Utils/FileSelector';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontWeight: 400,
      lineHeight: '1.5',
      width: '100%',
      margin: 'auto',
      overflowY: 'scroll',
      display: 'flex',
      flexDirection: 'column',
      imageRendering: '-webkit-optimize-contrast',
      backgroundColor: theme.palette.background.default,
    },
    printContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      margin: '2cm',
    },
    stepContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: theme.palette.text.primary,
      padding: '0px',
    },
    printDiv: {
      color: '#000000',
    },
    actions: {
      borderTop: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.background.paper,
    },
    layoutName: {
      color: theme.palette.primary.main,
    },
    screenshotContainer: {
      flex: 1,
      width: '100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      margin: '20px 0px',
      pageBreakInside: 'avoid',
      minHeight: '10cm',
      maxHeight: '17cm',
    },
    sceneName: {
      fontSize: 22,
      textTransform: 'uppercase',
      margin: '30px 0px',
      display: 'flex',
    },
    summary: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    summaryCard: {
      display: 'flex',
      flexDirection: 'column',
      margin: '10px',
    },
    summaryTitle: {
      flex: 1,
      color: theme.palette.primary.main,
      fontWeight: 520,
      fontSize: 18,
    },
    sceneDate: {
      color: theme.palette.primary.main,
    },
    divider: {
      margin: '10px 0',
    },
    informationSection: {
      display: 'flex',
      justifyContent: 'flex-start',
      padding: 10,
      whiteSpace: 'pre-wrap',
    },
    ul: {
      paddingLeft: '20px',
    },
    sectionColumn: {
      width: '33.3%',
    },
    sectionLabel: {
      color: theme.palette.primary.main,
    },
    button: {
      marginRight: theme.spacing(1),
    },
    cancelButton: {
      backgroundColor: '#f4f4f4',
      color: theme.palette.primary.main,
      marginRight: theme.spacing(1),
      width: '120px',
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    categorySettings: {
      display: 'grid',
      width: '100%',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      marginLeft: '60px',
      marginRight: '60px',
    },
    groupHeading: {
      width: '75%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
      marginTop: '15px',
      marginLeft: 'auto',
      marginRight: 'auto',
      alignSelf: 'stretch',
    },
    printSetting: {},
    pageBreakWrapper: {
      pageBreakBefore: 'always',
      breakBefore: 'always',
      display: 'flex',
      flexDirection: 'column',
    },
    coverPage: {
      pageBreakInside: 'avoid',
      display: 'flex',
      flexDirection: 'column',
      '@media print': {
        height: '100%',
      },
    },
    report: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '20px',
      // display: 'grid',
      // gridTemplateColumns: '50px 1fr',
      whiteSpace: 'pre',
    },
    table: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '20px',
      pageBreakInside: 'avoid',
    },
    gridItemLeft: {
      fontSize: '18pt',
      textAlign: 'center',
      alignSelf: 'start',
    },
    gridItemRight: {
      borderRight: 'none',
    },
    pageHeading: {
      borderRight: 'none',
      fontSize: '24pt',
      color: theme.palette.primary.main,
      display: 'flex',
      alignSelf: 'start',
    },
    printOnlyFooter: {
      display: 'none',
      '@media print': {
        display: 'block',
        position: 'fixed',
      },
    },
    printOnlyHeader: {
      display: 'none',
      '@media print': {
        display: 'block',
        position: 'fixed',
        top: '0px',
        right: '0px',
      },
    },
    footer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      width: '100vw',
      columnGap: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    headerContent: {
      display: 'grid',
      gridTemplateColumns: '60px 180px',
      alignSelf: 'start',
    },
    footerCell: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    uncheckHeaderFooter: {
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      alignItems: 'center',
    },
    attendeeGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridGap: '6px',
    },
    entreeGrid: {
      alignSelf: 'center',
      display: 'flex',
      flexWrap: 'wrap',
    },
    entreeCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
      margin: '5px',
    },
    stepperRoot: {
      // backgroundColor: theme.palette.secondary.main,
      // color: theme.palette.primary.contrastText,
    },
    stepLabel: {
      // color: `${theme.palette.primary.contrastText} !important`,
    },
    labelIcon: {
      color: theme.palette.primary.dark,
    },
    labelIconActive: {
      color: `${theme.palette.primary.main} !important`,
    },
    labelIconCompleted: {
      color: `${theme.palette.primary.dark} !important`,
    },
    tabs: {
      margin: '15px',
    },
    accordion: {
      width: '75%',
    },
    hideInPrint: {
      marginTop: '20px',
      '@media print': {
        display: 'none',
        marginTop: '0px',
      },
    },
  })
);

interface Props {
  layout: PlacezLayoutPlan;
  scene: Scene;
  getInventory: any;
  onScreenshot: Function;
  hideModal: (event: any) => void;
}

enum stepsEnum {
  'Print Settings',
  'Crop Image',
  // 'Print Layout',
  'Preview',
}

const getSteps = () => {
  const steps = [
    ...Object.keys(stepsEnum).filter((x) => Number.isNaN(Number(x))),
  ];
  return steps;
};

type categories =
  | 'diagram'
  | 'serving'
  | 'seating'
  | 'contacts'
  | 'tables'
  | 'inventory'
  | 'allergy';
const categoryPrefixes = [
  'diagram',
  'serving',
  'seating',
  'contacts',
  'tables',
  'inventory',
  'allergy',
];

const designerElementRef = createRef<HTMLDivElement>();

const PrintPane = (props: Props) => {
  const theme: Theme = useTheme();
  const dispatch = useDispatch();
  const classes = styles(props);

  const stylesForModal = makeStyles<Theme>(formModalStyles);
  const modalClasses = stylesForModal(props);

  const reactCropRef = React.useRef();
  const pressedKeys = {};

  const [base64Screenshot, setBase64Screenshot] = useState<string>('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const [client, setClient] = useState(null);
  const [groupedInventoryInfo, setGropedInventoryInfo] = useState({});
  const [steps, setSteps] = useState(getSteps());
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState<Set<number>>(new Set<number>());
  const [sort, setSort] = useState<{ field: string; dir: any }>({
    field: 'lastName',
    dir: 'asc' as const,
  });
  const [seating, setSeating] = useState(
    AttendeeMetadata.reduce((acc, current, index) => {
      acc[current] = index < 4 ? true : false;
      return acc;
    }, {})
  );

  const [autoCrop, setAutoCrop] = useState(true);
  const [crop, setCrop] = useState(undefined);
  const [cropperWidth, setCropperWidth] = useState(null);
  const [cropperHeight, setCropperHeight] = useState(null);
  const [expanded, setExpanded] = React.useState<categories | false>(false);

  const assetBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const attendees = useSelector(
    (state: ReduxState) => state.attendee.attendees
  );
  const floorplan = useSelector(
    (state: ReduxState) => state.designer.floorPlan
  );
  const entrees = useSelector((state: ReduxState) =>
    getEntrees(state.attendee.attendees)
  );
  const companyLogo = useSelector((state: ReduxState) => getCompanyLogo(state));
  const userRole = useSelector(
    (state: ReduxState) => state.oidc.user.profile.role
  );
  const clients = useSelector((state: ReduxState) => state.client.clients);
  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );

  const [clientId, setClientId] = useState<number>(undefined);

  useEffect(() => {
    setClient(getClientById(clients, props.scene.clientId));
  }, [clients, props.scene]);

  const [viewToggles, setViewToggles] = useState<{ [key: string]: boolean }>(
    getFromLocalStorage('printSettings') ?? {
      diagramEventName: true,
      diagramLogo: true,
      diagramScreenshot: true,
      diagramEventManager: false,
      diagramDate: false,
      diagramFloorplan: false,
      diagramNotes: false,
      diagramTime: false,
      diagramGuestCount: false,
      diagramClientName: false,
      diagramSubeventName: false,

      servingEntreeTotals: false,

      allergyLastName: false,
      allergyFirstName: false,
      allergyTableInfo: false,
      allergyChairNumber: false,
      allergyAllergies: false,

      seatingLastName: false,
      seatingFirstName: false,
      seatingGroup: false,
      seatingTableInfo: false,
      seatingChairNumber: false,
      seatingMeal: false,
      seatingAllergies: false,
      seatingRSVP: false,

      contactsLastName: false,
      contactsFirstName: false,
      contactsGroup: false,
      contactsPhone: false,
      contactsEmail: false,
      contactsRSVP: false,

      tablesLastName: false,
      tablesFirstName: false,
      tablesGroup: false,
      tablesChairNumber: false,
      tablesMeal: false,
      tableEntrees: false,
      tablesAllergies: false,
      tableRSVP: false,

      inventoryQuantity: false,
      inventoryDescription: false,
      inventoryNotes: false,
      inventoryGroup: false,
      inventoryCheckbox: false,
    }
  );

  useEffect(() => {
    saveToLocalStorage('printSettings', viewToggles);
  }, [viewToggles]);

  const showSection = (category, viewToggles) => {
    return Object.keys(viewToggles)
      .filter((toggle) => toggle.includes(category))
      .map((toggle) => viewToggles[toggle])
      .some((toggle) => toggle === true);
  };

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const formatStartEndDate = (startDateStr: Date, endDateStr: Date): string => {
    if (!startDateStr) {
      return '';
    }
    const startDate = new Date(startDateStr);

    const formatedStartDate = startDate.toLocaleDateString('en-US', options);
    const startTimeSplited = formatedStartDate.split(',');

    if (!endDateStr) {
      return `${viewToggles.diagramDate ? startTimeSplited[0] : ''} ${viewToggles.diagramTime ? startTimeSplited[startTimeSplited.length - 1] : ''}`;
    }

    const endDate = new Date(endDateStr);
    const formatedEndDate = endDate.toLocaleTimeString('en-US', options);
    const endTimeSplited = formatedEndDate.split(',');

    if (
      endDate.getFullYear() === startDate.getFullYear() &&
      endDate.getMonth() === startDate.getMonth() &&
      endDate.getDay() === startDate.getDay()
    ) {
      return `${viewToggles.diagramDate ? startTimeSplited[0] : ''} ${viewToggles.diagramTime ? startTimeSplited[startTimeSplited.length - 1] : ''} ${viewToggles.diagramTime ? '-' : ''} ${viewToggles.diagramTime ? endTimeSplited[endTimeSplited.length - 1] : ''}`;
    }

    return `${viewToggles.diagramDate ? startTimeSplited[0] : ''} ${viewToggles.diagramTime ? startTimeSplited[startTimeSplited.length - 1] : ''} ${viewToggles.diagramTime || viewToggles.diagramDate ? '-' : ''} ${viewToggles.diagramDate ? endTimeSplited[0] : ''} ${viewToggles.diagramTime ? endTimeSplited[endTimeSplited.length - 1] : ''}`;
  };

  const groupInventory = () => {
    const groupedInventoryInfo: {
      [type: string]: { [assetId: string]: { name: string; quantity: number } };
    } = {};
    props?.getInventory?.()?.forEach((inventorySku) => {
      const asset = assetBySku[inventorySku.assetSku];
      if (!asset || !asset.skuType) {
        return;
      }

      const species = SkuType[asset.skuType];

      if (
        groupedInventoryInfo[species] &&
        groupedInventoryInfo[species][asset.id]
      ) {
        const inventoryInfo = groupedInventoryInfo[species][asset.id];
        groupedInventoryInfo[species][asset.id] = {
          ...inventoryInfo,
          quantity: inventoryInfo.quantity + inventorySku.count,
        };
      } else if (groupedInventoryInfo[species]) {
        groupedInventoryInfo[species][asset.id] = {
          name: asset.name,
          quantity: inventorySku.count,
        };
      } else {
        groupedInventoryInfo[species] = {
          [asset.id]: { name: asset.name, quantity: inventorySku.count },
        };
      }
    });

    setGropedInventoryInfo(groupedInventoryInfo);
  };

  useEffect(() => {
    const { onScreenshot } = props;
    const inventory = props?.getInventory?.();
    const downloadScreenshot = false;
    const base64Screenshot = onScreenshot(downloadScreenshot);

    const printSettings: { [key: string]: boolean } =
      getFromLocalStorage('printSettings');
    if (printSettings) {
      setViewToggles(printSettings);
    }

    setBase64Screenshot(base64Screenshot);

    autoCropper(base64Screenshot).then((croppedImage: string) =>
      setCroppedImageUrl(croppedImage)
    );

    if (inventory) {
      groupInventory();
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {}, [autoCrop]);

  const someAttendeeSettings = (seating: {
    [key: string]: boolean;
  }): boolean => {
    return Object.keys(seating).some((key: string) => {
      return seating[key];
    });
  };

  useEffect(() => {
    if (!someAttendeeSettings(seating)) {
      setViewToggles({
        ...viewToggles,
        showAttendeeReport: false,
        showTableCards: false,
      });
    }
  }, [seating]);

  const onKeyDown = (e) => {
    pressedKeys[e.keyCode] = true;
  };
  const onKeyUp = (e) => {
    pressedKeys[e.keyCode] = false;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setViewToggles({
      ...viewToggles,
      [event.target.name]: event.target.checked,
    });
  };

  const handlePanel =
    (panel: categories) =>
    (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleAttendeeSettingChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSeating({
      ...seating,
      [event.target.name]: event.target.checked,
    });
  };

  const onCropComplete = () => {
    if (!autoCrop) {
      makeClientCrop(crop);
    }
  };

  const onCropChange = (crop) => {
    setCrop(crop);
    setCropperHeight((reactCropRef.current as any).imageRef.height);
    setCropperWidth((reactCropRef.current as any).imageRef.width);
  };

  const makeClientCrop = (crop) => {
    if (base64Screenshot && crop.width && crop.height) {
      const image = new Image();
      image.onload = () => {
        const croppedImageUrl = getCroppedImg(image, crop);
        setCroppedImageUrl(croppedImageUrl);
      };
      image.src = base64Screenshot;
    }
  };

  const getCroppedImg = (originalImage, crop): string => {
    const canvas = document.createElement('canvas');
    const scaleX = originalImage.naturalWidth / cropperWidth;
    const scaleY = originalImage.naturalHeight / cropperHeight;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      originalImage,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return canvas.toDataURL('image/png');
  };

  const selectAll = (select) => () => {
    const newToggles = {};
    Object.keys(viewToggles).forEach((key) => {
      newToggles[key] = select;
    });
    if (select === false) {
      newToggles['diagramScreenshot'] = true;
    }
    setViewToggles(newToggles);

    const newSeating = {};
    Object.keys(seating).forEach((key) => {
      newSeating[key] = select;
    });
    setSeating(newSeating);
  };

  const toggleDiv = (toggle: keyof typeof viewToggles) => {
    let cleanedToggle = toggle as string;

    // Check if toggle string starts with any of the category prefixes and remove it
    categoryPrefixes.forEach((prefix) => {
      if (cleanedToggle.startsWith(prefix)) {
        cleanedToggle = cleanedToggle.replace(prefix, '');
      }
    });

    return (
      <FormControlLabel
        key={toggle}
        className={classes.printSetting}
        control={
          <Checkbox
            checked={viewToggles[toggle]}
            onChange={handleChange}
            name={toggle as string}
          />
        }
        label={Utils.camelToUpperCase(cleanedToggle)}
      />
    );
  };

  const categoryToggles = (category: categories) => {
    return Object.keys(viewToggles)
      .filter((key) => key.includes(category))
      .map((key) => toggleDiv(key));
  };

  const getCategorySettings = (
    category: categories
  ): { [key: string]: boolean } => {
    const ret = Object.keys(viewToggles)
      .filter((key) => key.includes(category))
      .reduce((acc, key) => {
        let cleanedKey = key.replace(category, '');
        cleanedKey = cleanedKey.charAt(0).toLowerCase() + cleanedKey.slice(1);
        // make first letter lowercase
        acc[cleanedKey] = viewToggles[key];
        return acc;
      }, {});
    return ret;
  };

  const someCategorySettings = (category: categories): boolean => {
    const ret = Object.keys(viewToggles)
      .filter((key) => key.includes(category))
      .some((key) => viewToggles[key]);
    return ret;
  };

  const createTableList = (attendees: Attendee[]): Attendee[][] => {
    const separatedList = attendees.reduce((acc, obj) => {
      const tableInfo = obj.tableInfo;
      if (tableInfo === undefined) return acc;
      if (!acc[tableInfo]) {
        acc[tableInfo] = [];
      }
      acc[tableInfo].push(obj);
      return acc;
    }, {});
    return Object.values(separatedList);
  };

  const [selectedLogo, setSelectedLogo] = useState(null);
  const handleFileSubmit = (files: FileList) => {
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file, file.name);

    placezApi.postBlob(formData).then((data) => {
      setSelectedLogo(data.parsedBody.url);
    });
  };

  const getStepContent = (step: number) => {
    const { layout, scene } = props;

    switch (step) {
      case stepsEnum['Print Settings']:
        return (
          <div className={classes.stepContent}>
            <div className={classes.groupHeading}>
              <Typography variant="h6">Print Controls</Typography>
              <div
                style={{
                  display: 'flex',
                  height: '36px',
                }}
              >
                <Tooltip title="Select All">
                  <IconButton onClick={selectAll(true)}>
                    <DoneAll />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear All">
                  <IconButton onClick={selectAll(false)}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <Accordion
              className={classes.accordion}
              expanded={
                expanded === 'diagram' || someCategorySettings('diagram')
              }
              onChange={handlePanel('diagram')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>General</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('diagram')}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={
                expanded === 'serving' || someCategorySettings('serving')
              }
              onChange={handlePanel('serving')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>Serving</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('serving')}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={
                expanded === 'allergy' || someCategorySettings('allergy')
              }
              onChange={handlePanel('allergy')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>Allergy</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('allergy')}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={
                expanded === 'seating' || someCategorySettings('seating')
              }
              onChange={handlePanel('seating')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>Seating</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('seating')}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={
                expanded === 'contacts' || someCategorySettings('contacts')
              }
              onChange={handlePanel('contacts')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>Contacts</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('contacts')}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={expanded === 'tables' || someCategorySettings('tables')}
              onChange={handlePanel('tables')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>Tables</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('tables')}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              className={classes.accordion}
              expanded={
                expanded === 'inventory' || someCategorySettings('inventory')
              }
              onChange={handlePanel('inventory')}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography className={classes.heading}>Inventory</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.categorySettings}>
                  {categoryToggles('inventory')}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        );
      case stepsEnum['Print Layout']:
        return (
          <div className={classes.stepContent}>
            <div>
              <img src={hideHeaderFooter} alt="" />
            </div>
            <Typography variant="h5" style={{ margin: '20px' }}>
              {`Remove headers and footers in Chrome print preview - "More
              settings"`}
            </Typography>
          </div>
        );
      case stepsEnum['Crop Image']:
        return (
          <div className={classes.stepContent}>
            <div
              style={{
                display: 'flex',
                alignSelf: 'stretch',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}></div>
              <Tabs
                className={classes.tabs}
                value={autoCrop}
                onChange={(e, v) => {
                  setAutoCrop(v);
                  if (base64Screenshot) {
                    autoCropper(base64Screenshot).then((croppedImage: string) =>
                      setCroppedImageUrl(croppedImage)
                    );
                  }
                }}
                variant="fullWidth"
                scrollButtons={false}
                aria-label="scrollable prevent tabs example"
                indicatorColor="secondary"
                textColor="primary"
              >
                <Tab
                  className={classes.tabIcon}
                  aria-label="Settings"
                  value={true}
                  label="Auto"
                />
                <Tab
                  className={classes.tabIcon}
                  aria-label="Materials"
                  value={false}
                  label="Manual"
                />
              </Tabs>
              <div style={{ flex: 1 }}>
                {autoCrop === false && (
                  <Typography variant="caption" style={{ width: '100%' }}>
                    *Click image to crop for print
                  </Typography>
                )}
              </div>
            </div>
            {autoCrop === true && (
              <div
                style={{
                  width: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <img
                  className={classes.screenshotContainer}
                  src={croppedImageUrl}
                  alt="screenshot"
                />
              </div>
            )}
            {autoCrop === false && (
              <>
                <div
                  style={{
                    height: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white !important',
                  }}
                >
                  <ReactCrop
                    ref={reactCropRef}
                    src={base64Screenshot}
                    crop={crop}
                    onChange={(newCrop) => onCropChange(newCrop)}
                  />
                </div>
              </>
            )}
          </div>
        );
      case stepsEnum['Preview']:
        return (
          <div className={classes.printContent}>
            <div className={classes.printDiv} ref={designerElementRef}>
              <div className={classes.coverPage}>
                <div className={classes.header}>
                  <div className={classes.logoContainer}>
                    {viewToggles.diagramLogo && (
                      <img
                        style={{ alignSelf: 'start' }}
                        src={
                          selectedLogo ||
                          companyLogo?.settingValue ||
                          placezLogoPurple
                        }
                        alt="logo"
                        height={50}
                      />
                    )}
                    <div className={classes.hideInPrint}>
                      {activeStep === 2 && viewToggles.diagramLogo && (
                        <FileSelector
                          isInsidePrint
                          customID={'replace logo'}
                          handleFileSubmit={handleFileSubmit}
                          buttonText={'Change logo'}
                          accept={'image/*'}
                        />
                      )}
                    </div>
                    {viewToggles.diagramEventName && (
                      <div className={classes.sceneName}>
                        {' '}
                        <div
                          style={{
                            color: theme.palette.primary.main,
                            marginRight: '14px',
                          }}
                        >
                          Event:{' '}
                        </div>{' '}
                        {scene.name}{' '}
                      </div>
                    )}
                  </div>
                  <div className={classes.headerContent}>
                    {viewToggles.diagramDate && (
                      <>
                        <div className={classes.summaryTitle}> Date: </div>
                        <div>
                          {new Date(scene.startUtcDateTime).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </div>
                      </>
                    )}
                    {viewToggles.diagramTime && (
                      <>
                        <div className={classes.summaryTitle}>Time: </div>
                        <div>
                          {new Date(scene.startUtcDateTime).toLocaleTimeString(
                            'en-US',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: !twentyFourHourTime,
                            }
                          )}{' '}
                          -
                          {new Date(scene.endUtcDateTime).toLocaleTimeString(
                            'en-US',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: !twentyFourHourTime,
                            }
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {viewToggles.diagramScreenshot && (
                  <div
                    className={classes.screenshotContainer}
                    style={{ backgroundImage: `url(${croppedImageUrl})` }}
                  ></div>
                )}
                <div className={classes.summary}>
                  {viewToggles.diagramClientName && (
                    <div className={classes.summaryCard}>
                      <div className={classes.summaryTitle}>Client:</div>
                      {client?.name ?? ''}
                    </div>
                  )}
                  {viewToggles.diagramSubeventName && (
                    <div className={classes.summaryCard}>
                      <div className={classes.summaryTitle}>Subevent:</div>
                      {layout.name}
                    </div>
                  )}
                  {viewToggles.diagramEventManager && (
                    <div className={classes.summaryCard}>
                      <div className={classes.summaryTitle}>Event Manager:</div>
                      {scene?.manager ?? ''}
                    </div>
                  )}
                  {viewToggles.diagramFloorplan && (
                    <div className={classes.summaryCard}>
                      <div className={classes.summaryTitle}>Room:</div>
                      {floorplan?.name ?? ''}
                    </div>
                  )}
                </div>
              </div>
              {viewToggles.diagramNotes && (
                <div className={classes.pageBreakWrapper}>
                  <div className={classes.pageHeading}>Notes</div>
                  <NotePrint notes={scene?.notes} />
                </div>
              )}
              {someCategorySettings('inventory') && (
                <div className={classes.pageBreakWrapper}>
                  <div className={classes.pageHeading}>Inventory Report</div>
                  <div className={classes.report}>
                    <InventoryList
                      inventorySettings={getCategorySettings('inventory')}
                      items={props?.getInventory?.()}
                      hideBorder
                    />
                  </div>
                </div>
              )}

              {(someCategorySettings('serving') ||
                someCategorySettings('allergy') ||
                someCategorySettings('seating')) && (
                <div className={classes.pageBreakWrapper}>
                  <div className={classes.pageHeading}>Serving Report</div>
                  {someCategorySettings('serving') && (
                    <div className={classes.report}>
                      <div className={classes.gridItemLeft}>Entrees</div>
                      <EntreeList rows={entrees} hideBorder />
                    </div>
                  )}
                  {someCategorySettings('allergy') && (
                    <div className={classes.report}>
                      <div className={classes.gridItemLeft}>Allergies</div>
                      <AttendeeList
                        attendees={attendees.filter(
                          (attendee) =>
                            attendee.allergies !== undefined &&
                            attendee.allergies !== 'none'
                        )}
                        attendeeSettings={getCategorySettings('allergy')}
                        hideBorder
                      />
                    </div>
                  )}
                  {someCategorySettings('seating') && (
                    <div className={classes.report}>
                      <div className={classes.gridItemLeft}>Seating</div>
                      <AttendeeList
                        attendees={attendees}
                        attendeeSettings={getCategorySettings('seating')}
                        hideBorder
                      />
                    </div>
                  )}
                </div>
              )}

              {someCategorySettings('contacts') && (
                <div className={classes.pageBreakWrapper}>
                  <div className={classes.pageHeading}>Attendee Contacts</div>
                  <div className={classes.gridItemRight}>
                    <AttendeeList
                      attendees={attendees}
                      attendeeSettings={getCategorySettings('contacts')}
                      hideBorder
                    />
                  </div>
                </div>
              )}

              {someCategorySettings('tables') && (
                <div className={classes.pageBreakWrapper}>
                  <div className={classes.pageHeading}>Tables Report</div>
                  {createTableList(attendees).map((table) => (
                    <div className={classes.table}>
                      <div
                        className={classes.gridItemLeft}
                      >{`Table ${table[0].tableInfo}`}</div>
                      <TableList
                        hideBorder
                        attendees={table}
                        attendeeSettings={getCategorySettings('tables')}
                      />
                      <div style={{ margin: '20px' }}></div>
                      {viewToggles.tableEntrees && (
                        <EntreeList
                          rows={getEntrees(table)}
                          guestCount={table.length}
                          hideBorder
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  const isStepOptional = (step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    if (activeStep === stepsEnum['Crop Image']) {
      onCropComplete();
    }

    setActiveStep(activeStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(activeStep + 1);
    const newSkipped = new Set(skipped.values());
    newSkipped.add(activeStep);
    setSkipped(newSkipped);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  if (!base64Screenshot) {
    return <></>;
  }

  return (
    <>
      <DialogTitle className={modalClasses.dialogTitle}>
        <Stepper className={classes.stepperRoot} activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};
            if (isStepOptional(index)) {
              labelProps.optional = (
                <Typography variant="caption">Optional</Typography>
              );
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel
                  StepIconProps={{
                    classes: {
                      root: classes.labelIcon,
                      active: classes.labelIconActive,
                      completed: classes.labelIconCompleted,
                    },
                  }}
                  classes={{
                    label: classes.stepLabel,
                    iconContainer: classes.labelIcon,
                  }}
                  {...labelProps}
                >
                  <div className={classes.stepLabel}>{label}</div>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </DialogTitle>
      <DialogContent
        className={classes.dialogContent}
        style={{ height: '600px' }}
        dividers={true}
      >
        {getStepContent(activeStep)}
      </DialogContent>
      <DialogActions className={modalClasses.dialogActions}>
        <PlacezActionButton disabled={activeStep === 0} onClick={handleBack}>
          Back
        </PlacezActionButton>
        {isStepOptional(activeStep) && (
          <PlacezActionButton onClick={handleSkip}>Skip</PlacezActionButton>
        )}
        {activeStep !== steps.length - 1 && (
          <PlacezActionButton onClick={handleNext}>Next</PlacezActionButton>
        )}
        {activeStep === steps.length - 1 && (
          <ReactToPrint
            trigger={() => (
              <PlacezActionButton>
                <Print />
              </PlacezActionButton>
            )}
            content={() => {
              if (pressedKeys['80']) {
                console.log(designerElementRef.current);
              }
              const css = '@page { margin: 0px; }';
              const head =
                document.head || document.getElementsByTagName('head')[0];
              const style = document.createElement('style');

              style.media = 'print';
              style.appendChild(document.createTextNode(css));

              head.appendChild(style);
              return designerElementRef.current;
            }}
          />
        )}
        <PlacezActionButton onClick={props.hideModal}>Close</PlacezActionButton>
      </DialogActions>
    </>
  );
};

const getUserSettings = (state) => {
  return state.settings.userSettings;
};

const getCompanyLogo = createSelector([getUserSettings], (userSettings) =>
  userSettings.find((setting) => setting.name === 'Company Logo')
);

export default PrintPane;
