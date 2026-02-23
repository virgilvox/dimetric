/** Supported property value types (matching Tiled conventions). */
export type DmPropertyType = 'string' | 'int' | 'float' | 'bool' | 'color' | 'file' | 'object';

/** A single named property with a typed value. */
export interface DmProperty {
  name: string;
  type: DmPropertyType;
  value: string | number | boolean;
}

/** A bag of custom properties, keyed by name. */
export type DmPropertyBag = Record<string, DmProperty>;
