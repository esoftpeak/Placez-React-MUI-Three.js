import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../../../reducers';
import {
  ChangeViewState,
  LicenseType,
  canEditLayout,
  isAdmin,
} from '../../../reducers/globalState';
import { PhotosphereIcon } from '../../../assets/icons/PhotosphereIcon';
import { useNavigate } from 'react-router';
import { Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { AnnotationsIcon, BackIcon, ChairIcon, PlannerIcon } from '../../../assets/icons';

import {
  Refresh,
  Image,
  PersonOutlined,
  VrpanoOutlined,
  ChatBubbleOutline,
  PaletteOutlined,
} from '@mui/icons-material';
import { ModalConsumer } from '../../Modals/ModalContext';

// TODO: In the future should import from Blue npm package
import ButtonController from './ButtonController';
import { GlobalViewState, ViewState } from '../../../models/GlobalState';
import { ToggleChatPanel } from '../../../reducers/chat';
import ScanModal from '../../Modals/ScanModal';
import sideBarStyles from '../../Styles/sideBarStyles.css';
import SideBarButton from '../SideBarButton';

type Props = {
  // TODO useselector guest
  guest?: boolean;
};

const enum ButtonLabels {
  Planner = 'Floorplan',
  Item = 'Item',
  SwitchTo2D = 'Switch to 2D',
  SwitchTo3D = 'Switch to 3D',
  Photosphere = 'Photosphere',
  Attendees = 'Attendees',
  Notes = 'Notes',
  NumberTables = 'Number Tables',
  StreetView = 'Street View',
  Shapes = 'Shapes',
  Annotations = 'Annotations',
  Textures = 'Textures',
}

const PlannerSidebar = (props: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const styles = makeStyles<Theme>(sideBarStyles);
  const classes = styles(props);

  const theme = useTheme();
  const iconColor = theme.palette.text.primary;

  const [floorplanButtonController, setFloorplanButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Planner, true, true, true, () => {})
    );
  const [itemButtonController, setItemButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Item, true, true, true, () => {})
    );
  const [photosphereViewButtonController, setphotosphereViewButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Photosphere, true, true, true, () => {})
    );
  const [photosphereEditButtonController, setphotosphereEditButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Photosphere, true, true, true, () => {})
    );
  const [streetViewButtonController, setStreetViewButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.StreetView, true, true, true, () => {})
    );
  const [attendeeViewButtonController, setAttendeeViewButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Attendees, true, true, true, () => {})
    );
  const [annotationsButtonController, setAnnotationsButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Notes, true, true, true, () => {})
    );
  const [texturesButtonController, setTexturesButtonController] =
    useState<ButtonController>(
      new ButtonController(ButtonLabels.Textures, true, true, true, () => {})
    );

  const viewState = useSelector((state: ReduxState) => state.globalstate.viewState);
  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const layoutLoading = useSelector(
    (state: ReduxState) => state.blue.layoutLoading
  );
  const license = useSelector(
    (state: ReduxState) => state.globalstate.licenseState
  );
  const chatPanelState = useSelector(
    (state: ReduxState) => state.chat.chatPanelState
  );
  const needSave = useSelector((state: ReduxState) => state.blue.needSave);
  const saving = useSelector((state: ReduxState) => state.blue.saving);
  const dirty = needSave || saving;
  const ready = useSelector(
    (state: ReduxState) =>
      state.blue.blueInitialized && state.blue.sceneScanLoaded
  );
  const navigationDisabled = useSelector(
    (state: ReduxState) => state.globalstate.navigationDisabled
  );

  const admin = useSelector((state: ReduxState) => isAdmin(state));
  const guestCanEditLayout = useSelector((state: ReduxState) =>
    canEditLayout(state)
  );

  useEffect(() => {
    let floorplanButtonController = new ButtonController(
      ButtonLabels.Planner,
      true,
      false,
      false,
      () => {}
    );
    let texturesButtonController = new ButtonController(
      ButtonLabels.Textures,
      true,
      false,
      false,
      () => {}
    );
    let itemButtonController = new ButtonController(
      ButtonLabels.Item,
      true,
      false,
      false,
      () => {}
    );
    let photosphereViewButtonController = new ButtonController(
      ButtonLabels.Photosphere,
      true,
      false,
      false,
      () => {}
    );
    let photosphereEditButtonController = new ButtonController(
      ButtonLabels.Photosphere,
      true,
      false,
      false,
      () => {}
    );
    let streetViewButtonController = new ButtonController(
      ButtonLabels.StreetView,
      true,
      false,
      false,
      () => {}
    );
    let attendeeViewButtonController = new ButtonController(
      ButtonLabels.Attendees,
      true,
      false,
      false,
      () => {}
    );
    let annotationsButtonController = new ButtonController(
      ButtonLabels.Annotations,
      true,
      false,
      false,
      () => {}
    );

    // BASIC LICENSE
    if (
      license === LicenseType.Placez ||
      license === LicenseType.PlacezPlus ||
      license === LicenseType.PlacezPro
    ) {
      itemButtonController = new ButtonController(
        ButtonLabels.Item,
        false,
        false,
        false,
        () => dispatch(ChangeViewState(ViewState.TwoDView, viewState))
      );
      annotationsButtonController = new ButtonController(
        ButtonLabels.Annotations,
        false,
        false,
        false,
        () => dispatch(ChangeViewState(ViewState.LabelView, viewState))
      );
      photosphereViewButtonController = new ButtonController(
        ButtonLabels.Photosphere,
        true,
        true,
        false,
        () => {}
      );
      photosphereEditButtonController = new ButtonController(
        ButtonLabels.Photosphere,
        true,
        true,
        false,
        () => {}
      );

      if (globalViewState === GlobalViewState.Fixtures) {
        floorplanButtonController = new ButtonController(
          ButtonLabels.Planner,
          false,
          false,
          false,
          () => dispatch(ChangeViewState(ViewState.Floorplan, viewState))
        );

        texturesButtonController = new ButtonController(
          ButtonLabels.Textures,
          false,
          false,
          false,
          () => dispatch(ChangeViewState(ViewState.TextureView, viewState))
        );

        if (viewState === ViewState.Floorplan) {
          floorplanButtonController = new ButtonController(
            ButtonLabels.Planner,
            false,
            false,
            true,
            () => {}
          );
        }

        if (viewState === ViewState.TextureView) {
          texturesButtonController = new ButtonController(
            ButtonLabels.Textures,
            false,
            false,
            true,
            () => {}
          );
        }

        if (viewState === ViewState.TwoDView || viewState === ViewState.ThreeDView) {
          itemButtonController = new ButtonController(
            ButtonLabels.Item,
            false,
            false,
            true,
            () => {}
          );
        }

        if (viewState === ViewState.ShapeView || viewState === ViewState.LabelView) {
          annotationsButtonController = new ButtonController(
            ButtonLabels.Annotations,
            false,
            false,
            true,
            () => {}
          );
        }
      }

      if (globalViewState === GlobalViewState.Layout) {
        floorplanButtonController = new ButtonController(
          'Planner',
          true,
          false,
          false,
          () => {}
        );
        itemButtonController = new ButtonController(
          ButtonLabels.Item,
          false,
          false,
          false,
          () => dispatch(ChangeViewState(ViewState.TwoDView, viewState))
        );
        attendeeViewButtonController = new ButtonController(
          ButtonLabels.Attendees,
          false,
          layoutLoading,
          false,
          () => dispatch(ChangeViewState(ViewState.AttendeeView, viewState))
        );
        if (viewState === ViewState.TwoDView || viewState === ViewState.ThreeDView) {
          itemButtonController = new ButtonController(
            ButtonLabels.Item,
            false,
            false,
            true,
            () => {}
          );
        }
        if (viewState === ViewState.AttendeeView) {
          attendeeViewButtonController = new ButtonController(
            ButtonLabels.Attendees,
            false,
            false,
            true,
            () => {}
          );
        }
        if (
          viewState === ViewState.LabelView ||
          viewState === ViewState.ShapeView ||
          viewState === ViewState.NumberView
        ) {
          annotationsButtonController = new ButtonController(
            ButtonLabels.Annotations,
            false,
            false,
            true,
            () => {}
          );
        }
      }
    }

    if (license === LicenseType.PlacezPlus || license === LicenseType.PlacezPro) {
      if (globalViewState === GlobalViewState.Fixtures) {
        if (viewState === ViewState.TwoDView || viewState === ViewState.ThreeDView) {
          itemButtonController = new ButtonController(
            ButtonLabels.Item,
            false,
            false,
            true,
            () => {}
          );
        }
      }

      if (globalViewState === GlobalViewState.Layout) {
        streetViewButtonController = new ButtonController(
          ButtonLabels.StreetView,
          false,
          false,
          false,
          () => dispatch(ChangeViewState(ViewState.StreetView, viewState))
        );
        attendeeViewButtonController = new ButtonController(
          ButtonLabels.Attendees,
          false,
          layoutLoading,
          false,
          () => dispatch(ChangeViewState(ViewState.AttendeeView, viewState))
        );

        if (viewState === ViewState.TwoDView) {
          streetViewButtonController = new ButtonController(
            ButtonLabels.StreetView,
            false,
            true,
            false,
            () => {}
          );
        }
        if (viewState === ViewState.StreetView) {
          streetViewButtonController = new ButtonController(
            ButtonLabels.StreetView,
            false,
            false,
            true,
            () => {}
          );
        }
        if (viewState === ViewState.AttendeeView) {
          attendeeViewButtonController = new ButtonController(
            ButtonLabels.Attendees,
            false,
            false,
            true,
            () => {}
          );
        }
        if (
          viewState === ViewState.NumberView ||
          viewState === ViewState.ShapeView ||
          viewState === ViewState.LabelView
        ) {
          annotationsButtonController = new ButtonController(
            ButtonLabels.Annotations,
            false,
            false,
            true,
            () => {}
          );
        }
      }
    }

    if (license === LicenseType.PlacezPro) {
      if (globalViewState === GlobalViewState.Fixtures) {
        photosphereEditButtonController = new ButtonController(
          ButtonLabels.Photosphere,
          false,
          false,
          false,
          () => dispatch(ChangeViewState(ViewState.PhotosphereEdit, viewState))
        );

        if (viewState === ViewState.PhotosphereEdit) {
          photosphereEditButtonController = new ButtonController(
            ButtonLabels.Photosphere,
            false,
            false,
            true,
            () => {}
          );
        }
      }

      if (globalViewState === GlobalViewState.Layout) {
        photosphereViewButtonController = new ButtonController(
          ButtonLabels.Photosphere,
          false,
          layoutLoading,
          false,
          () => dispatch(ChangeViewState(ViewState.PhotosphereView, viewState))
        );
        streetViewButtonController = new ButtonController(
          ButtonLabels.StreetView,
          false,
          false,
          false,
          () => dispatch(ChangeViewState(ViewState.StreetView, viewState))
        );

        if (viewState === ViewState.PhotosphereView) {
          photosphereViewButtonController = new ButtonController(
            ButtonLabels.Photosphere,
            false,
            false,
            true,
            () => {}
          );
        }
        if (viewState === ViewState.StreetView) {
          streetViewButtonController = new ButtonController(
            ButtonLabels.StreetView,
            false,
            false,
            true,
            () => {}
          );
        }
      }
    }

    setFloorplanButtonController(floorplanButtonController);
    setTexturesButtonController(texturesButtonController);
    setItemButtonController(itemButtonController);
    setphotosphereViewButtonController(photosphereViewButtonController);
    setphotosphereEditButtonController(photosphereEditButtonController);
    setStreetViewButtonController(streetViewButtonController);
    setAttendeeViewButtonController(attendeeViewButtonController);
    setAnnotationsButtonController(annotationsButtonController);
  }, [globalViewState, layoutLoading, viewState]);

  const renderAddButtons = () => {
    const { guest } = props;

    if (globalViewState !== GlobalViewState.Layout) {
      return null;
    }

    return (
      <>
        <SideBarButton
          label="Chat"
          selected={chatPanelState}
          onClick={() => dispatch(ToggleChatPanel())}
        >
          <ChatBubbleOutline className={classes.icon} />
        </SideBarButton>
      </>
    );
  };

  const { guest } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {guest ? (
        <SideBarButton
          label="Refresh"
          onClick={() => {
            window.location.reload();
          }}
        >
          <Refresh className={classes.icon} />
        </SideBarButton>
      ) : (
        <SideBarButton disabled={dirty} label="Back" onClick={() => navigate(-1)}>
          <BackIcon className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!floorplanButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || floorplanButtonController.disabled}
          onClick={floorplanButtonController.onClick}
          label={floorplanButtonController.label}
          selected={floorplanButtonController.selected}
        >
          <PlannerIcon className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!texturesButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || texturesButtonController.disabled}
          onClick={texturesButtonController.onClick}
          label={texturesButtonController.label}
          selected={texturesButtonController.selected}
        >
          <PaletteOutlined className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!itemButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || itemButtonController.disabled}
          onClick={itemButtonController.onClick}
          label={itemButtonController.label}
          selected={itemButtonController.selected}
        >
          <ChairIcon style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!photosphereViewButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || photosphereViewButtonController.disabled}
          onClick={photosphereViewButtonController.onClick}
          label={photosphereViewButtonController.label}
          selected={photosphereViewButtonController.selected}
        >
          <PhotosphereIcon className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!photosphereEditButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || photosphereEditButtonController.disabled}
          onClick={photosphereEditButtonController.onClick}
          label={photosphereEditButtonController.label}
          selected={photosphereEditButtonController.selected}
        >
          <PhotosphereIcon className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!streetViewButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || streetViewButtonController.disabled}
          onClick={streetViewButtonController.onClick}
          label={streetViewButtonController.label}
          selected={streetViewButtonController.selected}
        >
          <VrpanoOutlined className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!attendeeViewButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || attendeeViewButtonController.disabled}
          onClick={attendeeViewButtonController.onClick}
          label={attendeeViewButtonController.label}
          selected={attendeeViewButtonController.selected}
        >
          <PersonOutlined className={classes.icon} style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {!annotationsButtonController.hidden && (
        <SideBarButton
          disabled={!ready || navigationDisabled || dirty || annotationsButtonController.disabled}
          onClick={annotationsButtonController.onClick}
          label={annotationsButtonController.label}
          selected={annotationsButtonController.selected}
        >
          <AnnotationsIcon style={{ color: iconColor }} />
        </SideBarButton>
      )}

      {ready && renderAddButtons()}

      {ready &&
        globalViewState === GlobalViewState.Fixtures &&
        (license === LicenseType.PlacezPlus || license === LicenseType.PlacezPro) &&
        !guest &&
        admin && (
          <ModalConsumer>
            {({ showModal, props }) => (
              <SideBarButton
                disabled={!ready}
                label="Scene Scan"
                onClick={() => showModal(ScanModal, { ...props })}
              >
                <Image fontSize="large" style={{ color: iconColor }} />
              </SideBarButton>
            )}
          </ModalConsumer>
        )}
    </div>
  );
};

export default PlannerSidebar;
