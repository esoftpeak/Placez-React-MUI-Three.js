import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { styled, useTheme } from '@mui/material/styles';
import ResetModal from '../components/Modals/DemoResetModal';


/** @jsxImportSource @emotion/react */
import {
    Box,
    Button,
    IconButton,
    Toolbar,
    Tooltip,
    Menu,
    MenuItem,
} from '@mui/material';
import { getOrgTheme } from '../api/placez/models/UserSetting';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../reducers';
import { useLocation, useNavigate } from 'react-router';
import { mainRoutes, placeRoutes, sceneRoutes } from '../routes';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { SelectScene } from '../reducers/scenes';
import {
    AccountCircle,
    AddAlert,
    AddAlertOutlined,
    ExitToApp,
    HelpOutline,
    KeyboardArrowDown,
    Restore,
    SettingsOutlined,
} from '@mui/icons-material';
import { ModalConsumer } from '../components/Modals/ModalContext';
import UniversalPromiseModal from '../components/Modals/UniversalPromiseModal';
import {
    userIsInRole,
    guestRole,
    ableToResetDatabase,
} from '../sharing/utils/userHelpers';
import { useEffect, useState } from 'react';
import { placezApi } from '../api';
import userManager from '../auth/userManager';
import SearchBar from '../components/TopBar/SearchBar';
import scenes from '../routes/scenes';
import assets from '../routes/assets';
import clients from '../routes/clients';
import payments from '../routes/payments';
import { layoutConstants } from '../Constants/layout';
import PlacezActionButton from '../components/PlacezUIComponents/PlacezActionButton';
import SceneModal from '../components/Modals/SceneModal';
import calendar from '../routes/calendar';
import SettingsModal from '../components/Modals/SettingsModal';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import { DefaultLogoIcon } from '../assets/icons';


const searchableLocations = [
    scenes.main.path,
    clients.main.path,
    placeRoutes.main.path,
    assets.main.path,
    calendar.main.path,
    payments.main.path,
];
const nonSearchableLocations = ['/planner', '/floorplan'];


const logoSize = 38;


const styles = makeStyles<Theme>((theme: Theme) =>
    createStyles({
        root: {
            padding: 0,
            flex: 1,
        },
        logoContainer: {
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            padding: 0,
            borderBottom: `2px solid ${theme.palette.secondary.main}`,
            width: '64px',
            justifyContent: 'center',
        },
        logo: {
            width: logoSize,
            height: logoSize,
            color: theme.palette.primary.main,
        },
        logoText: {
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
            padding: 0,
        },
        profileInitials: {
            width: 32,
            height: 32,
            borderRadius: 32 / 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 14,
            color: theme.palette.common.white,
            background: theme.palette.primary.main,
        },
        helpIcon: {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.primary.main
                    : theme.palette.common.white,
        },
        sectionDesktop: {
            display: 'none',
            [theme.breakpoints.up('md')]: {
                display: 'flex',
                alignItems: 'center',
            },
        },
        inactiveIcon: {
            color: '#AAAAAA',
        },
    })
);


interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}


const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: layoutConstants.drawerOpenWidth,
        width: `calc(100% - ${layoutConstants.drawerOpenWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));


const betaFeature = 'New Features';
const resetDemoDatabaseLabel = 'Reset Demo Database';


interface Props {
    open: boolean;
}


const PlacezTopBar = (props: Props) => {
    const { open } = props;
    const user = useSelector((state: ReduxState) => state.oidc.user);
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const classes = styles();
    const isGuestUser = userIsInRole(user, guestRole);
    const location = useLocation();


    const newScene = () => {
        (window as any).gtag('event', 'new_scene');
        dispatch(SelectScene(null));
        navigate(sceneRoutes.new.path);
    };


    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);


    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);


    const handleProfileMenuOpen = (scene: any) => {
        setAnchorEl(scene.currentTarget);
    };


    const resetDatabase = () => {
        return placezApi.resetDemoDatabase();
    };


    const handleProfileRedirect = () => {
        window.location.href = `${import.meta.env.VITE_APP_PORTAL}/Account/Manage/ProfileInformation`;
        return null;
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };


    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };


    const logout = (scene: any) => {
        scene.preventDefault();


        (window as any).gtag('event', 'logout');


        localStorage.removeItem('placez-layoutId');
        userManager.signoutRedirect({ id_token_hint: user.id_token });
        userManager.removeUser();
    };


    const [isSearchableLocation, setIsSearchableLocation] = useState(false);

    const [openResetModal, setOpenResetModal] = useState(false);


    const handleOpenResetModal = () => setOpenResetModal(true);
    const handleCloseResetModal = () => setOpenResetModal(false);

     const handleConfirmReset = () => {
    // Handle the reset logic here (e.g., API call to reset the data)
    console.log('Resetting data...');
  };

    useEffect(() => {
        setIsSearchableLocation(
            location &&
            searchableLocations.some((searchLocation) =>
                location.pathname.includes(searchLocation)
            ) &&
            !nonSearchableLocations.some((searchLocation) =>
                location.pathname.includes(searchLocation)
            )
        );
    }, [location]);


    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            {!isGuestUser && (
                <MenuItem onClick={handleProfileRedirect}>
                    <IconButton>
                        <AccountCircle />
                    </IconButton>
                    Profile
                </MenuItem>
            )}
            <MenuItem onClick={(scene) => logout(scene)}>
                <IconButton>
                    <ExitToApp />
                </IconButton>
                Logout
            </MenuItem>
        </Menu>
    );


    if (isGuestUser)
        return (
            <AppBar elevation={0} position="fixed" open={open} color="inherit">
                <Toolbar
                    sx={{
                        padding: `0px !important`,
                        justifyContent: 'flex-end',
                    }}
                >
                    <MenuItem>
                        <IconButton color="inherit">
                            <AccountCircle />
                        </IconButton>
                        {user.profile.name}
                    </MenuItem>
                    <MenuItem onClick={(scene) => logout(scene)}>
                        <IconButton>
                            <ExitToApp />
                        </IconButton>
                        Logout
                    </MenuItem>
                </Toolbar>
            </AppBar>
        );


    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMenuClose}
        >
            <Tooltip title={betaFeature}>
                <span>
                    <MenuItem disabled onClick={handleMobileMenuClose}>
                        <IconButton color="inherit">
                            <AddAlert className={classes.inactiveIcon} />
                        </IconButton>
                        <p>Messages</p>
                    </MenuItem>
                </span>
            </Tooltip>
            <Tooltip title="Help">
                <span>
                    <MenuItem
                        onClick={() => {
                            (window as any).gtag('event', 'topBar', 'clicked_support');
                            handleMobileMenuClose();
                        }}
                        style={{ color: theme.palette.text.primary }}
                    >
                        <a
                            href="http://support.getplacez.com/helpmenu/content/home.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconButton>
                                <HelpOutline
                                    style={{ color: theme.palette.text.primary }}
                                    className={classes.helpIcon}
                                />
                            </IconButton>
                            Support
                        </a>
                    </MenuItem>
                </span>
            </Tooltip>
            <Tooltip title={betaFeature}>
                <span>
                    <MenuItem disabled onClick={handleMobileMenuClose}>
                        <IconButton color="inherit">
                            <NotificationsIcon className={classes.inactiveIcon} />
                        </IconButton>
                        <p>Notifications</p>
                    </MenuItem>
                </span>
            </Tooltip>
            <Tooltip title="">
                <span>
                    <MenuItem onClick={handleMobileMenuClose}>
                        <IconButton color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <p>Profile</p>
                    </MenuItem>
                </span>
            </Tooltip>
            <MenuItem onClick={(scene) => logout(scene)}>
                <IconButton color="inherit">
                    <ExitToApp />
                </IconButton>
                <p>Logout</p>
            </MenuItem>
        </Menu>
    );


    return (
        <AppBar elevation={0} position="fixed" open={open} color="inherit">
            <Toolbar
                sx={{
                    padding: `0px !important`,
                }}
            >
                {!open && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'stretch',
                            justifyContent: 'center',
                            width: '80px',
                            height: '64px',
                        }}
                    >
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => navigate(mainRoutes[0].path)}
                            edge="start"
                            style={{ marginLeft: '4px', width: '64px' }}
                        >
                            {getOrgTheme(user.profile.organization_id).logo ? (
                                <img
                                    className={classes.logo}
                                    alt="logo"
                                    src={getOrgTheme(user.profile.organization_id).logo}
                                />
                            ) : (
                                <DefaultLogoIcon color="primary" />
                            )}
                        </IconButton>
                    </div>
                )}
                <div style={{ minWidth: '80px' }}></div>


                {isSearchableLocation && <SearchBar />}
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <div className={classes.sectionDesktop}>
                        <Tooltip title="Demo Reset">
                            <PlacezActionButton color="primary" style={{ marginRight: '10px' }} onClick={handleOpenResetModal}>
                                Demo Reset
                            </PlacezActionButton>
                        </Tooltip>
                        <ModalConsumer>
                            {({ showModal, props }) => (
                                <Tooltip title="Add Event">
                                    <PlacezActionButton
                                        color="primary"
                                        style={{ marginRight: '10px' }}
                                        onClick={() => {
                                            showModal(SceneModal, { ...props });
                                        }}
                                    >
                                        Create Event
                                    </PlacezActionButton>
                                </Tooltip>
                            )}
                        </ModalConsumer>
                        <Tooltip title="Support">
                            <span>
                                <a
                                    href="http://support.getplacez.com/helpmenu/content/home.htm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconButton>
                                        <HelpOutline
                                            style={{ color: theme.palette.text.disabled }}
                                            className={classes.helpIcon}
                                        />
                                    </IconButton>
                                </a>
                            </span>
                        </Tooltip>
                        <Tooltip title={betaFeature}>
                            <span>
                                <a
                                    href="https://www.getplacez.com/new-in-version/#1583940439542-78932663-f848"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconButton
                                        color="inherit"
                                        onClick={() =>
                                            (window as any).gtag(
                                                'event',
                                                'topBar',
                                                'new_features_clicked'
                                            )
                                        }
                                    >
                                        <AddAlertOutlined
                                            style={{ color: theme.palette.text.disabled }}
                                            className={classes.helpIcon}
                                        />
                                    </IconButton>
                                </a>
                            </span>
                        </Tooltip>
                        {ableToResetDatabase(user) ? (
                            <Tooltip title={resetDemoDatabaseLabel}>
                                <span>
                                    <ModalConsumer>
                                        {({ showModal, props }) => (
                                            <Tooltip title="Reset Demo Database">
                                                <IconButton
                                                    onClick={() =>
                                                        showModal(UniversalPromiseModal, {
                                                            ...props,
                                                            onContinue: () => resetDatabase(),
                                                            okButtonLabel: 'Reset',
                                                            modalHeader:
                                                                'Are you sure you want to reset current database?',
                                                        })
                                                    }
                                                >
                                                    <Restore className={classes.helpIcon} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </ModalConsumer>
                                </span>
                            </Tooltip>
                        ) : (
                            <></>
                        )}
                        <div>
                            <Button
                                sx={{
                                    borderRadius: '19px',
                                    color: theme.palette.text.disabled,
                                }}
                                id="demo-customized-button"
                                aria-controls={open ? 'demo-customized-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                disableElevation
                                onClick={handleProfileMenuOpen}
                                endIcon={<KeyboardArrowDown />}
                            >
                                {user.profile.name}
                            </Button>
                        </div>
                    </div>
                    <div
                        style={{
                            borderLeft: '1px solid #D8DFE5',
                            width: '80px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <ModalConsumer>
                            {({ showModal, props }) => (
                                <Tooltip title="Settings">
                                    <IconButton
                                        size="large"
                                        onClick={() => {
                                            showModal(SettingsModal, { ...props });
                                        }}
                                    >
                                        <SettingsOutlined
                                            style={{ color: theme.palette.text.disabled }}
                                            fontSize="inherit"
                                        />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </ModalConsumer>
                    </div>
                </Box>
            </Toolbar>
            {renderMenu}
            {renderMobileMenu}
            {openResetModal &&
                <ResetModal
                    open={openResetModal}
                    onClose={handleCloseResetModal}
                    onConfirm={handleConfirmReset}
                />}
        </AppBar>
    );
};


export default PlacezTopBar;

