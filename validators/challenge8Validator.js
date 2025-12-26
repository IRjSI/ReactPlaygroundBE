export default async function validateChallenge8(page) {
  try {
    const button = await page.waitForSelector("button", { timeout: 2000 });

    const getBg = async () =>
      await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor
      );

    const before = await getBg();

    await button.click();

    const changed = await page.waitForFunction(
      (prev) => {
        const bg = getComputedStyle(document.body).backgroundColor;
        return bg !== prev;
      },
      { timeout: 2000 },
      before
    );

    return !!changed;
  } catch (err) {
    console.error("Validation error (Challenge 8):", err.message);
    return false;
  }
}
