import { useEffect, useState } from 'react';

export const CrosshairTooltip = ({ multiSelect, viewerRef, title }: { multiSelect: boolean, viewerRef: React.RefObject<HTMLDivElement>, title: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    if (!viewerRef?.current || !multiSelect) {
      setIsVisible(false);
      return () => {};
    }

    const viewerElement = viewerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = viewerElement.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseEnter = () => {
      if (multiSelect && !isMouseDown) {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => {
      setIsMouseDown(true);
      setIsVisible(false);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      if (multiSelect) {
        setIsVisible(true);
      }
    };

    viewerElement.addEventListener('mousemove', handleMouseMove);
    viewerElement.addEventListener('mouseenter', handleMouseEnter);
    viewerElement.addEventListener('mouseleave', handleMouseLeave);
    viewerElement.addEventListener('mousedown', handleMouseDown);
    viewerElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      viewerElement.removeEventListener('mousemove', handleMouseMove);
      viewerElement.removeEventListener('mouseenter', handleMouseEnter);
      viewerElement.removeEventListener('mouseleave', handleMouseLeave);
      viewerElement.removeEventListener('mousedown', handleMouseDown);
      viewerElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [multiSelect, viewerRef, isMouseDown]);

  if (!multiSelect || !isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: mousePosition.x + 90,
        top: mousePosition.y - 40,
        transform: 'translateX(-50%)',
        background: 'rgba(180, 200, 210, 0.95)',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {title}
    </div>
  );
};
