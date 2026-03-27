import { Quaternion, Vector3 } from 'three';
import BlueLabel from '../model/blueLabel';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { eventBus } from './EventBus';
import { CameraType } from '../../components/Blue/models';

function hexToRGBA(hex: string, opacity: number): string {
  let cleanedHex = hex.trim();

  // Remove any leading '#' or '0x'
  if (cleanedHex.startsWith('#')) {
    cleanedHex = cleanedHex.slice(1);
  } else if (cleanedHex.toLowerCase().startsWith('0x')) {
    cleanedHex = cleanedHex.slice(2);
  }

  // Handle Shorthand Notation
  if (cleanedHex.length === 3 || cleanedHex.length === 4) {
    cleanedHex = cleanedHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  let alpha = opacity; // Default opacity

  if (cleanedHex.length === 6) {
    // 6-digit hex code (no alpha)
    const r = parseInt(cleanedHex.slice(0, 2), 16);
    const g = parseInt(cleanedHex.slice(2, 4), 16);
    const b = parseInt(cleanedHex.slice(4, 6), 16);

    return `rgba(${r},${g},${b},${alpha})`;
  } else if (cleanedHex.length === 8) {
    // 8-digit hex code (includes alpha)
    const r = parseInt(cleanedHex.slice(0, 2), 16);
    const g = parseInt(cleanedHex.slice(2, 4), 16);
    const b = parseInt(cleanedHex.slice(4, 6), 16);
    const a = parseInt(cleanedHex.slice(6, 8), 16);
    alpha = a / 255; // Normalize alpha to range [0, 1]

    return `rgba(${r},${g},${b},${alpha})`;
  } else {
    throw new Error('Invalid HEX color.');
  }
}

export class CSS3DLabelMaker {
  public parameters: BlueLabel;
  public cleanParameters: BlueLabel;
  public defaultParameters: BlueLabel = {
    fontSize: 32,
    textColor: '#000000',
    textOpacity: 1,
    labelText: '',
    fontface: 'Arial',
    borderThickness: 0,
    borderColor: '#000000',
    borderOpacity: 1,
    backgroundOpacity: 1,
    borderRadius: 0,
    lineSpacing: 0,
    margin: 0,
    labelPosition: 'center',
    rotation: 0,
    justify: 'center',
    fontWeight: 'normal',
  };

  private object3D: CSS3DObject;
  private layers: any;
  private userData: any;
  public shape: any;
  private updateLabelCallback?: (label: BlueLabel) => void;
  private labelDiv: HTMLDivElement;
  private onClick?: (id) => void;

  constructor(
    inputParameters?: BlueLabel,
    layers?: any, // Replace 'any' with the actual type of CameraLayers
    onClick?: (id) => void,
    updateLabel?: (label: BlueLabel) => void
  ) {
    // Merge default and input parameters
    this.parameters = { ...this.defaultParameters, ...inputParameters };
    this.layers = layers;
    this.updateLabelCallback = updateLabel;
    this.onClick = onClick;

    // Create the label
    this.createLabel();
  }

  private createLabel() {
    if (this.object3D) {
      // Update existing div
      this.labelDiv = this.object3D.element as HTMLDivElement;
    } else {
      // Create a new div
      this.labelDiv = document.createElement('div');

      this.labelDiv.style.pointerEvents = 'auto';
      this.labelDiv.style.cursor = 'pointer';
      this.labelDiv.addEventListener('click', () => {
        if (this.parameters.id && this.onClick) this.onClick(this.parameters.id);
        if (this.userData && this.onClick) this.onClick(this.userData);
      });
    }

    // Set text content
    this.labelDiv.innerHTML = this.parameters.labelText.replace(/\n/g, '<br>');

    const rawSize = (this.parameters as any).labelWidth as number | undefined;
    const hasDynamicSize =
      typeof rawSize === 'number' && !Number.isNaN(rawSize);

    const clampedSize = hasDynamicSize
      ? Math.max(0, Math.min(100, rawSize as number))
      : undefined;

    const baseFontSize =
      this.parameters.fontSize ?? this.defaultParameters.fontSize ?? 32;
    const baseWidthPx = 200; 

    let effectiveFontSize = baseFontSize;
    let effectiveWidthPx: number | null = null;
    let shouldHide = false;

    if (hasDynamicSize) {
      if (clampedSize === 0) {
        shouldHide = true;
        effectiveFontSize = 0;
        effectiveWidthPx = 0;
      } else {
        const t = clampedSize! / 100; // 0–1
        effectiveFontSize = baseFontSize * t;
        effectiveWidthPx = baseWidthPx * t;
      }
    }

    this.labelDiv.style.fontFamily = this.parameters.fontface;
    this.labelDiv.style.fontWeight = this.parameters.fontWeight;
    this.labelDiv.style.color = hexToRGBA(
      this.parameters.textColor!,
      this.parameters.textOpacity!
    );

    if (this.parameters.backgroundColor) {
      this.labelDiv.style.backgroundColor = hexToRGBA(
        this.parameters.backgroundColor!,
        this.parameters.backgroundOpacity!
      );
    } else {
      this.labelDiv.style.backgroundColor = 'transparent';
    }

    // Border
    if (this.parameters.borderThickness! > 0) {
      const borderColor =
        this.parameters.borderColor || this.parameters.textColor;
      this.labelDiv.style.border = `${this.parameters.borderThickness}px solid ${hexToRGBA(
        borderColor!,
        this.parameters.borderOpacity!
      )}`;
    } else {
      this.labelDiv.style.border = 'none';
    }

    this.labelDiv.style.borderRadius = `${this.parameters.borderRadius}px`;
    this.labelDiv.style.padding = `${this.parameters.margin}px`;
    this.labelDiv.style.boxSizing = 'border-box';
    this.labelDiv.style.textAlign = this.parameters.justify;
    this.labelDiv.style.alignItems = 'center';

    if (shouldHide) {
      this.labelDiv.style.display = 'none';
      this.labelDiv.style.fontSize = '0px';
      this.labelDiv.style.lineHeight = '0px';
    } else {
      this.labelDiv.style.display = 'flex';
      this.labelDiv.style.fontSize = `${effectiveFontSize}px`;
      this.labelDiv.style.lineHeight = `${effectiveFontSize + (this.parameters.lineSpacing ?? 0)
        }px`;
    }

    if (hasDynamicSize) {
      if (effectiveWidthPx && effectiveWidthPx > 0 && !shouldHide) {
        this.labelDiv.style.width = `${effectiveWidthPx}px`;
      } else {
        this.labelDiv.style.width = '0px';
      }
    } else {
      this.labelDiv.style.width = 'auto';
    }

    if (!this.object3D) {
      this.object3D = new CSS3DObject(this.labelDiv);
      this.object3D.rotation.set(
        -Math.PI / 2,
        0,
        this.parameters.rotation ?? 0
      );

      eventBus.addEventListener('controlsChange', (e: CustomEvent) => {
        // Get the camera properties
        const cameraPosition: Vector3 = e.detail?.cameraPosition;
        const cameraRotation: Quaternion = e.detail?.cameraRotation;
        const cameraStatus: number = e.detail?.cameraStatus;

        // In 2D view, rotate icons to match the view angle when the user rotates
        if (cameraStatus === CameraType.Orthographic) {
          this.object3D.rotation.set(-Math.PI / 2, 0, cameraRotation.z);
        }
        // In 3D view, make the icons face the camera
        else if (cameraPosition) {
          this.object3D?.lookAt(cameraPosition);
        }
      });

      // Set layers
      if (this.layers) {
        this.object3D.layers.set(this.layers);
      }
    }
    
    if (hasDynamicSize && typeof clampedSize === 'number') {
      this.object3D.visible = !shouldHide;
    } else {
      this.object3D.visible = true;
    }
  }

  private handleCameraData() {
    // Process the camera data here if needed
    console.log('Received camera data:');
  }

  public getObject(): CSS3DObject {
    return this.object3D;
  }

  public getLabelDiv(): HTMLDivElement {
    return this.labelDiv;
  }

  public updateParameters(newParameters: BlueLabel) {
    this.parameters = { ...this.parameters, ...newParameters };

    this.createLabel();

    // Update rotation
    this.object3D.rotation.set(-Math.PI / 2, 0, this.parameters.rotation ?? 0);

    // Call the update callback if provided
    if (this.updateLabelCallback) {
      this.updateLabelCallback(this.parameters);
    }
  }
}
