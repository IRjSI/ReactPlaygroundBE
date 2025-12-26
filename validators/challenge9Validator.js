export default async function validateChallenge9(page) {
  try {
    const input = await page.waitForSelector("input", { timeout: 2000 });
    const button = await page.waitForSelector("button", { timeout: 2000 });

    const isDisabled = async () =>
      await page.evaluate(btn => btn.disabled, button);

    // must start disabled
    if (!(await isDisabled())) return false;

    // type text
    await input.click();
    await input.type("hello");

    // wait until enables
    const enabled = await page.waitForFunction(
      btn => !btn.disabled,
      { timeout: 2000 },
      button
    );

    if (!enabled) return false;

    // clear input and trigger change
    await page.evaluate(el => (el.value = ""), input);
    await input.type(" "); // trigger onChange
    await page.keyboard.press("Backspace");

    // wait until disabled again
    const disabledAgain = await page.waitForFunction(
      btn => btn.disabled,
      { timeout: 2000 },
      button
    );

    return !!disabledAgain;
  } catch (err) {
    console.error("Validation error (Challenge 9):", err.message);
    return false;
  }
}
