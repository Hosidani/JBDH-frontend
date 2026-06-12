import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraggable } from './useDraggable';

describe('useDraggable', () => {
  it('börjar utan position (centrerat)', () => {
    const { result } = renderHook(() => useDraggable(true));
    expect(result.current.position).toBeNull();
  });

  it('återställer position när open går till false', () => {
    const { result, rerender } = renderHook(({ open }) => useDraggable(open), {
      initialProps: { open: true },
    });

    // Sätt en position manuellt via drag-simulering
    act(() => {
      // Simulera att dragState har ett värde via mousedown + mousemove
      const dialog = document.createElement('div');
      dialog.getBoundingClientRect = () => ({
        left: 100, top: 100, right: 500, bottom: 400,
        width: 400, height: 300, x: 100, y: 100, toJSON: () => ({}),
      });
      Object.defineProperty(result.current, 'dialogRef', { value: { current: dialog } });
    });

    rerender({ open: false });
    expect(result.current.position).toBeNull();
  });

  it('returnerar dialogRef och onHeaderMouseDown', () => {
    const { result } = renderHook(() => useDraggable(true));
    expect(result.current.dialogRef).toBeDefined();
    expect(typeof result.current.onHeaderMouseDown).toBe('function');
  });

  it('registrerar och avregistrerar globala event listeners', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useDraggable(true));
    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('uppdaterar position vid mousemove efter mousedown', () => {
    const { result } = renderHook(() => useDraggable(true));

    const dialog = document.createElement('div');
    dialog.getBoundingClientRect = () => ({
      left: 200, top: 150, right: 600, bottom: 450,
      width: 400, height: 300, x: 200, y: 150, toJSON: () => ({}),
    });
    // Koppla ref manuellt
    (result.current.dialogRef as React.MutableRefObject<HTMLDivElement>).current = dialog;

    act(() => {
      result.current.onHeaderMouseDown({
        clientX: 250, clientY: 170, preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLElement>);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 280, clientY: 190, bubbles: true }));
    });

    expect(result.current.position).toEqual({ x: 230, y: 170 }); // 200+(280-250), 150+(190-170)
  });

  it('slutar uppdatera position efter mouseup', () => {
    const { result } = renderHook(() => useDraggable(true));

    const dialog = document.createElement('div');
    dialog.getBoundingClientRect = () => ({
      left: 100, top: 100, right: 500, bottom: 400,
      width: 400, height: 300, x: 100, y: 100, toJSON: () => ({}),
    });
    (result.current.dialogRef as React.MutableRefObject<HTMLDivElement>).current = dialog;

    act(() => {
      result.current.onHeaderMouseDown({
        clientX: 150, clientY: 120, preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLElement>);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    const positionAfterUp = result.current.position;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 300, bubbles: true }));
    });

    expect(result.current.position).toEqual(positionAfterUp);
  });
});
