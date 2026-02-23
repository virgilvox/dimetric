<script setup lang="ts">
import { useEditorStore } from '../../stores/editor';
import { editorBus } from '../../events/bus';
import ToolButton from './ToolButton.vue';

const editor = useEditorStore();

function onPlay() {
  editorBus.emit('preview:start');
}

function onStop() {
  editorBus.emit('preview:stop');
}
</script>

<template>
  <ToolButton
    v-if="editor.mode === 'edit'"
    label="Play"
    shortcut="F5"
    icon="play"
    @click="onPlay"
  />
  <ToolButton
    v-else
    label="Stop"
    shortcut="Esc"
    icon="stop"
    :active="true"
    @click="onStop"
  />
</template>
