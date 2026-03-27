/**
 * Extends MUI's Theme types to include custom properties
 */

import { GrazeOrderStatus } from '@app-types';

declare module '@mui/material/styles' {
  interface Theme {
    PlacezBorderStyles?: {
      border?: string;
      borderRadius?: number;
      borderBottomLeftRadius?: number;
      borderBottomRightRadius?: number;
      borderTopLeftRadius?: number;
      borderTopRightRadius?: number;
    };
    PlacezLightBorderStyles?: {
      border?: string;
      borderRadius?: number;
      borderBottomLeftRadius?: number;
      borderBottomRightRadius?: number;
      borderTopLeftRadius?: number;
      borderTopRightRadius?: number;
    };
    PlacezLeftSelectedIndicator?: {
      content: string;
      position: string;
      left: number;
      top: string; // Adjust this value to position the partial border
      bottom: string; // Adjust this value for the length of the partial border
      width: number; // Width of the partial border
      backgroundColor: string; // Color of the partial border
    };
  }

  interface ThemeOptions {
    PlacezBorderStyles?: {
      border?: string;
      borderRadius?: number;
      borderBottomLeftRadius?: number;
      borderBottomRightRadius?: number;
      borderTopLeftRadius?: number;
      borderTopRightRadius?: number;
    };
    PlacezLightBorderStyles?: {
      border?: string;
      borderRadius?: number;
      borderBottomLeftRadius?: number;
      borderBottomRightRadius?: number;
      borderTopLeftRadius?: number;
      borderTopRightRadius?: number;
    };
    PlacezLeftSelectedIndicator?: {
      content: string;
      position: string;
      left: number;
      top: string; // Adjust this value to position the partial border
      bottom: string; // Adjust this value for the length of the partial border
      width: number; // Width of the partial border
      backgroundColor: string; // Color of the partial border
    };
  }

  interface Palette {
    tertiary: Palette['primary'];
    status: Record<GrazeOrderStatus, string>;
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    status?: Record<GrazeOrderStatus, string>;
  }

  interface TypeBackground {
    shadow: string;
  }

  interface TypographyVariants {
    bodyXL: React.CSSProperties;
    bodyLarge: React.CSSProperties;
    bodyMedium: React.CSSProperties;
    bodySmall: React.CSSProperties;
    bodyXS: React.CSSProperties;
    navLink: React.CSSProperties;
    titleXL: React.CSSProperties;
    titleLarge: React.CSSProperties;
    titleMedium: React.CSSProperties;
    titleSmall: React.CSSProperties;
    titleXS: React.CSSProperties;
    buttonSmall?: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    bodyXL?: React.CSSProperties;
    bodyLarge?: React.CSSProperties;
    bodyMedium?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
    bodyXS?: React.CSSProperties;
    navLink?: React.CSSProperties;
    titleXL?: React.CSSProperties;
    titleLarge?: React.CSSProperties;
    titleMedium?: React.CSSProperties;
    titleSmall?: React.CSSProperties;
    titleXS?: React.CSSProperties;
    buttonSmall?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    bodyXL: true;
    bodyLarge: true;
    bodyMedium: true;
    bodySmall: true;
    bodyXS: true;
    navLink: true;
    titleXL: true;
    titleLarge: true;
    titleMedium: true;
    titleSmall: true;
    titleXS: true;
    buttonSmall: true;

    body1: true;
    body2: true;
    caption: true;
    h1: true;
    h2: true;
    h3: true;
    h4: true;
    h5: true;
    h6: true;
    overline: true;
    subtitle1: true;
    subtitle2: true;
  }
}
