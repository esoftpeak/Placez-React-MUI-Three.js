import { useMemo } from 'react';
import { calcTotal } from '../utils/InvoiceUtils';
import { getLayoutDurationInHours } from '../utils/LayoutUtils';

const useIndividualInvoiceTotal = ({ selectedLayout, floorplans }) => {
  return useMemo(() => {
    if (selectedLayout) {
      const currentFloorPlan = floorplans.find(
        (floorPlan) => floorPlan.id === selectedLayout.floorPlanId
      );
      let total = 0;
      const TAX_RATE = 0;
      total = calcTotal(
        currentFloorPlan,
        getLayoutDurationInHours(selectedLayout),
        TAX_RATE
      );

      return total;
    }

    return null;
  }, [selectedLayout, floorplans]);
};

export default useIndividualInvoiceTotal;
