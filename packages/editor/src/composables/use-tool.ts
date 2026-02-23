import { watch, type Ref } from 'vue';
import type { Tool } from '../tools/tool';
import type { ToolType } from '../stores/editor';
import { BrushTool } from '../tools/brush-tool';
import { EraserTool } from '../tools/eraser-tool';
import { PanTool } from '../tools/pan-tool';
import { EyedropperTool } from '../tools/eyedropper-tool';
import { FillTool } from '../tools/fill-tool';

const toolInstances: Record<ToolType, Tool> = {
  brush: new BrushTool(),
  eraser: new EraserTool(),
  fill: new FillTool(),
  pan: new PanTool(),
  eyedropper: new EyedropperTool(),
};

export function useTool(activeToolRef: Ref<ToolType>) {
  let currentTool: Tool = toolInstances[activeToolRef.value];

  watch(activeToolRef, (newTool, oldTool) => {
    if (oldTool) toolInstances[oldTool].onDeactivate?.();
    currentTool = toolInstances[newTool];
    currentTool.onActivate?.();
  });

  return {
    get current(): Tool {
      return currentTool;
    },
    getToolInstance(type: ToolType): Tool {
      return toolInstances[type];
    },
  };
}
