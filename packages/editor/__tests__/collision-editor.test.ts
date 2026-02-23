import { describe, it, expect, vi } from 'vitest';

// Mock vue's onUnmounted for composable testing
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return { ...actual as any, onUnmounted: vi.fn() };
});

import { useCollisionEditor } from '../src/composables/use-collision-editor';

describe('useCollisionEditor', () => {
  it('creates rect shape from drag', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.drawMode.value = 'rect';
    editor.onPointerDown(10, 10);
    editor.onPointerMove(50, 30);
    editor.onPointerUp(50, 30);

    expect(editor.shapes.value).toHaveLength(1);
    expect(editor.shapes.value[0].type).toBe('rect');
    expect(editor.shapes.value[0].data).toEqual([10, 10, 40, 20]);
    expect(onChange).toHaveBeenCalledWith(editor.shapes.value);
  });

  it('creates ellipse shape from drag', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.drawMode.value = 'ellipse';
    editor.onPointerDown(5, 5);
    editor.onPointerMove(25, 15);
    editor.onPointerUp(25, 15);

    expect(editor.shapes.value).toHaveLength(1);
    expect(editor.shapes.value[0].type).toBe('ellipse');
    expect(editor.shapes.value[0].data).toEqual([5, 5, 20, 10]);
  });

  it('creates polygon shape from clicks', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.drawMode.value = 'polygon';
    editor.onPointerDown(10, 10);
    editor.onPointerDown(30, 10);
    editor.onPointerDown(20, 30);
    editor.finishPolygon();

    expect(editor.shapes.value).toHaveLength(1);
    expect(editor.shapes.value[0].type).toBe('polygon');
    expect(editor.shapes.value[0].data).toEqual([10, 10, 30, 10, 20, 30]);
    expect(onChange).toHaveBeenCalled();
  });

  it('ignores tiny rect drags', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.drawMode.value = 'rect';
    editor.onPointerDown(10, 10);
    editor.onPointerUp(11, 11);

    expect(editor.shapes.value).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('requires at least 3 polygon points', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.drawMode.value = 'polygon';
    editor.onPointerDown(10, 10);
    editor.onPointerDown(30, 10);
    editor.finishPolygon(); // Only 2 points = 4 values, need 6

    expect(editor.shapes.value).toHaveLength(0);
  });

  it('removes a shape by index', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.drawMode.value = 'rect';
    editor.onPointerDown(0, 0);
    editor.onPointerUp(20, 20);
    editor.onPointerDown(30, 30);
    editor.onPointerUp(60, 60);

    expect(editor.shapes.value).toHaveLength(2);
    editor.removeShape(0);
    expect(editor.shapes.value).toHaveLength(1);
  });

  it('setShapes loads existing shapes', () => {
    const onChange = vi.fn();
    const editor = useCollisionEditor(onChange);

    editor.setShapes([
      { type: 'rect', data: [0, 0, 10, 10] },
      { type: 'ellipse', data: [5, 5, 20, 20] },
    ]);

    expect(editor.shapes.value).toHaveLength(2);
  });
});
