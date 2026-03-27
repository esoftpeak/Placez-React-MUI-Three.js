import React, { ReactElement } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

interface PlacezTooltipProps {
  title: string;
  children: ReactElement;
  placement?: TooltipProps['placement'];
  arrow?: boolean;
  tooltipProps?: Partial<TooltipProps>;
}

const PlacezTooltip: React.FC<PlacezTooltipProps> = ({
  title,
  children,
  placement = 'top',
  arrow = true,
  tooltipProps = {},
}) => {
  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};

export default PlacezTooltip;
