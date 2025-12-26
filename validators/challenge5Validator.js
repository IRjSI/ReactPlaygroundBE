export default async function validateChallenge5(page) {
  try {
    const button = await page.waitForSelector("button", { timeout: 2000 });

    const getPageText = async () =>
      await page.evaluate(() => document.body.innerText.trim());

    const firstState = await getPageText();
    if (!firstState) return false;

    // 1️⃣ Click → wait until text becomes different
    await button.click();
    const secondState = await page.waitForFunction(
      prev => document.body.innerText.trim() !== prev,
      { timeout: 2000 },
      firstState
    );

    if (!secondState) return false;

    const afterFirstClick = await getPageText();

    // 2️⃣ Click → wait until text equals original again
    await button.click();
    const restored = await page.waitForFunction(
      (prev) => document.body.innerText.trim() === prev,
      { timeout: 2000 },
      firstState
    );

    return !!restored;
  } catch (err) {
    console.error("Validation error (Challenge 5):", err.message);
    return false;
  }
}
