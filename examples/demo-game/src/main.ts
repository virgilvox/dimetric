import { DmRenderer } from '@dimetric/renderer';
import { GameWorld, Character, MovementSystem, CameraFollowSystem, Pointer, GridGraph } from '@dimetric/runtime';
import { gridToScreen } from '@dimetric/core';
import { demoMap } from './map-data';
import { createPlaceholderTextures, createCharacterTexture } from './placeholder-textures';
import { ClickToMoveSystem } from './click-to-move';
import { EntityRendererSystem } from './entity-renderer';

async function main() {
  const container = document.getElementById('game')!;

  // 1. Init renderer
  const renderer = new DmRenderer();
  await renderer.init({ container, backgroundColor: 0x1a1a2e });

  // 2. Create procedural textures
  const pixiApp = renderer.getApp();
  const tileTextures = createPlaceholderTextures(
    pixiApp.renderer,
    demoMap.tileSize.width,
    demoMap.tileSize.height,
  );

  // 3. Load map
  renderer.setTileTextures(tileTextures);
  renderer.setMap(demoMap);
  renderer.setGridVisible(false);

  // 4. Create game world
  const world = new GameWorld();
  world.loadMap(demoMap);
  world.attachRenderer(renderer);

  // 5. Create player character at a walkable tile
  const startCol = 3;
  const startRow = 3;
  const character = new Character({ id: 'player', gridX: startCol, gridY: startRow, speed: 4 });

  // Set initial pixel position
  const startPos = gridToScreen(startCol, startRow, demoMap.tileSize.width, demoMap.tileSize.height);
  character.pixelX = startPos.sx;
  character.pixelY = startPos.sy + demoMap.tileSize.height / 2;

  world.addEntity(character);

  // 6. Build walkability graph from walls layer
  const graph = GridGraph.fromMap(demoMap, 'walls');

  // 7. Setup pointer input
  const pointer = new Pointer();
  const canvas = container.querySelector('canvas')!;
  pointer.attach(canvas);

  // 8. Create entity sprite
  const charTexture = createCharacterTexture(pixiApp.renderer, 24, 0x3498db);
  const viewport = renderer.getViewport();
  const entityContainer = viewport.viewport;
  const entityRenderer = new EntityRendererSystem(entityContainer, charTexture);

  // 9. Add systems
  const cameraFollow = new CameraFollowSystem({ target: character, lerpSpeed: 5 });

  world.addSystem(new ClickToMoveSystem(pointer, graph, character));
  world.addSystem(new MovementSystem());
  world.addSystem(cameraFollow);
  world.addSystem(entityRenderer);
  world.addSystem({
    name: 'input-flush',
    update() { pointer.flush(); },
  });

  // 10. Start!
  world.start();

  // Center camera on character initially
  renderer.camera.panTo(character.pixelX, character.pixelY);
}

main().catch(console.error);
