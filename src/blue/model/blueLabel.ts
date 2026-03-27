export default interface BlueLabel {
  fontSize?: number;
  textColor?: string;
  textOpacity?: number;
  labelText: string;
  fontface?: string;
  fontWeight?: string;
  borderThickness?: number;
  borderColor?: string;
  borderOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderRadius?: number;
  lineSpacing?: number;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  labelPosition?: LabelPosition;
  rotation?: number;
  thumbNail?: string;
  id?: string;
  justify?: 'left' | 'center' | 'right';
}

export type LabelPosition = 'top' | 'center' | 'bottom';
