export default async function validateChallenge6(page) {
  try {
    const button = await page.waitForSelector("button", { timeout: 2000 });

    const getPageText = async () =>
      await page.evaluate(() => document.body.innerText.trim());

    const initialText = await getPageText();

    // 1️⃣ First click — wait for text to expand / change
    await button.click();

    const afterFirstClick = await page.waitForFunction(
      (prev) => {
        const text = document.body.innerText.trim();
        return text !== prev && text.length > prev.length;
      },
      { timeout: 2000 },
      initialText
    );

    if (!afterFirstClick) return false;

    // 2️⃣ Second click — wait for text to return to original
    await button.click();

    const afterSecondClick = await page.waitForFunction(
      (prev) => document.body.innerText.trim() === prev,
      { timeout: 2000 },
      initialText
    );

    return !!afterSecondClick;
  } catch (err) {
    console.error("Validation error (Challenge 6):", err.message);
    return false;
  }
}
