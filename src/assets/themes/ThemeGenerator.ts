import { Theme, createTheme } from '@mui/material';
import { ThemeType } from '../../components/Hooks/useLocalStorageState';

const appName = (appName?: string): string => (appName ? appName : 'Placez');

const drawerWidth: number = 240;
const minimizedDrawerWidth: number = 78;

const borderRadius = 6;
const borderThickness = 2;

const themeGenerator = (themeType: ThemeType, primary?, secondary?): Theme => {
  const primaryColor = primary ? primary : '#5C236F';
  const lightSecondaryColor = secondary ?? '#f0f0f0';
  const darkSecondaryColor = secondary ?? '#4B3D54';
  const secondaryColor = themeType === 'light' ? lightSecondaryColor : darkSecondaryColor;
  return createTheme({
    palette: {
      mode: themeType,
      primary: {
        main: primaryColor,
      },
      secondary: {
        // main: secondary ? secondary : '#afa0b3',
        main: secondaryColor,
      },
      background: {
        default: themeType === 'light' ? '#F8F9FA' : '#181818',
        paper: themeType === 'light' ? '#FFF' : '#1e1e1e',
        shadow: themeType === 'light' ? '#F3F2F2' : '#191919',
      },
    },
    typography: (palette) => ({
      fontFamily: ['Poppins'].join(','),
      allVariants: {
        fontFamily: ['Poppins'].join(','),
      },
      bodyXL: {
        fontSize: 20,
        lineHeight: 30 / 20,
      },
      bodyLarge: {
        fontSize: 16,
        lineHeight: 22 / 16,
      },
      bodyMedium: {
        fontSize: 14,
        lineHeight: 20 / 14,
      },
      bodySmall: {
        fontSize: 13,
        lineHeight: 1.3,
      },
      bodyXS: {
        fontSize: 12,
        lineHeight: 18 / 12,
      },
      navLink: {
        fontSize: 15,
        lineHeight: 22 / 15,
      },
      titleXL: {
        fontSize: 36,
        lineHeight: 50 / 36,
      },
      titleLarge: {
        fontSize: 27,
        lineHeight: 1.3,
      },
      titleMedium: {
        fontSize: 18,
        lineHeight: 28 / 18,
      },
      titleSmall: {
        fontSize: 13,
        lineHeight: 19 / 13,
      },
      titleXS: {
        fontSize: 12,
        lineHeight: 18 / 12,
        color: palette.text.disabled,
        textTransform: 'uppercase',
      },
      buttonSmall: {
        fontSize: 10,
      }
    }),
    PlacezBorderStyles: {
      border: `2px solid ${primaryColor}`,
      borderRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },
    PlacezLightBorderStyles: {
      border: `2px solid ${'#f0f0f0'}`,
      borderRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },
    PlacezLeftSelectedIndicator: {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '25%', // Adjust this value to position the partial border
      bottom: '25%', // Adjust this value for the length of the partial border
      width: borderThickness, // Width of the partial border
      backgroundColor: `${primaryColor} !important`, // Color of the partial border
    },
    shape: {
      borderRadius: borderRadius,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            '*::-webkit-scrollbar': {
              width: '14px',
              backgroundColor: 'transparent',
            },
            '*::-webkit-scrollbar-corner': {
              background: theme.palette.background.paper,
              backgroundColor: 'transparent',
            },
            '*::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.light,
              width: '20px',
              border: `4px solid ${theme.palette.background.paper}`,
              borderRadius: '20px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.primary.main,
              width: '6px',
            },
            scrollbarWidth: 'thin',
          },
        }),
      },
      MuiDrawer: {
        styleOverrides: {
          root: {
            width: drawerWidth,
            minimizedWidth: minimizedDrawerWidth,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            display: 'flex',
            flexAlign: 'center',
            justifyContent: 'center',
            backgroundColor: secondaryColor,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            zIndex: 999,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: '#00000030',
            backgroundOpacity: 0.1,
          },
        },
      }
    },
  });
};

export { themeGenerator, appName };
