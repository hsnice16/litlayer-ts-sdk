export function sleep(durationInMs: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("time to wake up"), durationInMs);
  });
}
