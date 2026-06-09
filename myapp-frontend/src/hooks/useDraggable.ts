import { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  startMouse: Position;
  startPos: Position;
}

export function useDraggable(open: boolean) {
  const [position, setPosition] = useState<Position | null>(null);
  const dragState = useRef<DragState | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) setPosition(null);
  }, [open]);

  const onHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    dragState.current = {
      startMouse: { x: e.clientX, y: e.clientY },
      startPos: { x: rect.left, y: rect.top },
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const { startMouse, startPos } = dragState.current;
      setPosition({
        x: startPos.x + (e.clientX - startMouse.x),
        y: startPos.y + (e.clientY - startMouse.y),
      });
    };
    const onMouseUp = () => { dragState.current = null; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return { position, dialogRef, onHeaderMouseDown };
}
