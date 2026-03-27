import { useEffect, useState } from 'react';
import { AssetModifierKeys, AssetModifiers } from '../../blue/items/asset';

type ModifierKeys = AssetModifierKeys; // Replace with your actual type
type Modifiers = AssetModifiers; // Replace with your actual type

interface UseModifierEnabledProps {
  initialParams: any;
  assetModifiers: Modifiers;
  modifierKey: ModifierKeys;
  setModifier: (key: ModifierKeys, value: any) => void;
  disabled?: boolean;
}

export function useModifierEnabled({
  initialParams,
  assetModifiers,
  modifierKey,
  setModifier,
  disabled,
}: UseModifierEnabledProps) {
  const [modEnabled, setModEnabled] = useState<boolean>(
    assetModifiers?.[modifierKey] !== undefined
  );

  useEffect(() => {
    if (disabled) return;
    if (modEnabled) {
      let newParams = { ...assetModifiers?.[modifierKey] };

      // If params are undefined or empty, set default params
      if (!newParams || Object.keys(newParams).length === 0) {
        newParams = initialParams;
      }

      setModifier(modifierKey, newParams);
    } else {
      setModifier(modifierKey, undefined);
    }
  }, [modEnabled]);

  return [modEnabled, setModEnabled] as const;
}
