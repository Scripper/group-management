/** Simulate backend latency (random delay between min–max ms). */
export function delay(min = 250, max = 400): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
