export async function delay(ms = 300): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
