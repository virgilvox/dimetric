let counter = 0;

/** Generate a unique ID string. Uses a monotonic counter with a random prefix. */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const count = (counter++).toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${count}-${random}`;
}

/** Reset the ID counter (for testing). */
export function resetIdCounter(): void {
  counter = 0;
}
