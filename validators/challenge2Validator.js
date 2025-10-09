export default async function validateChallenge2(page) {
  try {
    // wait for the button to appear
    const button = await page.waitForSelector("button", { timeout: 2000 });

    // get initial text
    const beforeText = await page.evaluate(el => el.textContent?.toLowerCase().trim(), button);

    // click button
    await button.click();

    // wait a small delay to allow React to update state
    // await page.waitForTimeout(100);

    // get updated text
    const afterText = await page.evaluate(el => el.textContent?.toLowerCase().trim(), button);

    return beforeText !== afterText && afterText === "click";
  } catch (err) {
    console.error("Validation error:", err.message);
    return false;
  }
}