import { AssetModifiers } from "../items/asset";
import { ChairParams, SeatInstance } from "./ChairMod";
import { ModifierBase } from "./ModifierBase";

export default class AssetModifierHelper {
  static clearModifierFields<T extends ModifierBase>(modifier: T): T {
    const clearedModifier = {
      ...modifier,
      id: 0,
      placedAssetId: null,
      mediaAssetId: null,
      organizationId: null,
    };

    if ((clearedModifier as any).seatPositions) {
      (clearedModifier as ChairParams).seatPositions = AssetModifierHelper.clearSeatInstances(
        (clearedModifier as ChairParams).seatPositions
      );
    }

    return clearedModifier;
  }

  static clearSeatInstances(seatInstances: SeatInstance[]): SeatInstance[] {
    return seatInstances.map(seat => ({
      ...seat,
      id: 0,
      chairModifierId: 0
    }));
  }

  static clearAllModifierFields(modifiers?: AssetModifiers): AssetModifiers {
    if (!modifiers) {
      return {};
    }

    return {
      chairMod: modifiers.chairMod ? AssetModifierHelper.clearModifierFields(modifiers.chairMod) : null,
      centerpieceMod: modifiers.centerpieceMod ? AssetModifierHelper.clearModifierFields(modifiers.centerpieceMod) : null,
      placeSettingMod: modifiers.placeSettingMod ? AssetModifierHelper.clearModifierFields(modifiers.placeSettingMod) : null,
      linenMod: modifiers.linenMod ? AssetModifierHelper.clearModifierFields(modifiers.linenMod) : null,
      architectureMod: modifiers.architectureMod ? AssetModifierHelper.clearModifierFields(modifiers.architectureMod) : null,
      uplightMod: modifiers.uplightMod ? AssetModifierHelper.clearModifierFields(modifiers.uplightMod) : null,
    };
  }
}
