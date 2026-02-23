[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / depthSortKey

# Function: depthSortKey()

> **depthSortKey**(`col`, `row`, `z?`): `number`

Defined in: renderer/src/sorting/depth-sort.ts:17

Compute a depth sort key for an isometric grid position.
Higher keys render in front of lower ones.

## Parameters

### col

`number`

Grid column index.

### row

`number`

Grid row index.

### z?

`number` = `0`

Optional elevation offset. Defaults to `0`.

## Returns

`number`

A numeric sort key suitable for ordering isometric draw calls.

## Example

```ts
sprite._depthKey = depthSortKey(3, 5);
```
