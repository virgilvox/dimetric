[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / depthSortContainer

# Function: depthSortContainer()

> **depthSortContainer**(`container`): `void`

Defined in: renderer/src/sorting/depth-sort.ts:36

Sort children of a PixiJS container by their `_depthKey` custom property.
Each child must have a `_depthKey` number assigned before calling this function.
Children are reordered in-place using `setChildIndex`.

## Parameters

### container

`Container`

The PixiJS container whose children should be sorted.

## Returns

`void`

## Example

```ts
for (const child of container.children) {
  (child as any)._depthKey = depthSortKey(col, row);
}
depthSortContainer(container);
```
