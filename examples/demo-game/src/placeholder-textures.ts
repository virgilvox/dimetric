import { Graphics, Texture, type Renderer } from 'pixi.js';

/**
 * Create procedural isometric diamond textures for the demo.
 * GID 1 = green grass tile, GID 2 = dark gray wall tile
 */
export function createPlaceholderTextures(
  pixiRenderer: Renderer,
  tileWidth: number,
  tileHeight: number,
): Map<number, Texture> {
  const textures = new Map<number, Texture>();

  // Grass tile (GID 1)
  textures.set(1, createDiamondTexture(pixiRenderer, tileWidth, tileHeight, 0x4a7c59, 0x3d6b4a));
  // Wall tile (GID 2)
  textures.set(2, createDiamondTexture(pixiRenderer, tileWidth, tileHeight, 0x5a5a6e, 0x4a4a5e));

  return textures;
}

function createDiamondTexture(
  pixiRenderer: Renderer,
  w: number,
  h: number,
  fillColor: number,
  strokeColor: number,
): Texture {
  const g = new Graphics();

  // Draw isometric diamond
  g.poly([
    w / 2, 0,     // top
    w, h / 2,     // right
    w / 2, h,     // bottom
    0, h / 2,     // left
  ]);
  g.fill(fillColor);
  g.stroke({ color: strokeColor, width: 1 });

  const texture = pixiRenderer.generateTexture(g);
  g.destroy();
  return texture;
}

/**
 * Create a simple colored circle texture for the player character.
 */
export function createCharacterTexture(
  pixiRenderer: Renderer,
  size: number,
  color: number,
): Texture {
  const g = new Graphics();
  g.circle(size / 2, size / 2, size / 2 - 2);
  g.fill(color);
  g.stroke({ color: 0xffffff, width: 2 });

  const texture = pixiRenderer.generateTexture(g);
  g.destroy();
  return texture;
}
