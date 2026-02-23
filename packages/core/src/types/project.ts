import type { DmMap } from './map';
import type { DmTileset } from './tileset';

/** Top-level project containing maps and tilesets. */
export interface DmProject {
  /** Project format version for migration. */
  version: number;
  name: string;
  maps: DmMap[];
  tilesets: DmTileset[];
}
