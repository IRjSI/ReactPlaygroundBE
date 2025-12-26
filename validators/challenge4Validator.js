export default async function validateChallenge4(page) {
  try {
    const button = await page.waitForSelector("button", { timeout: 2000 });

    const getNumber = async () => {
      return await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/-?\d+/);
        return match ? parseInt(match[0], 10) : null;
      });
    };

    const before = await getNumber();
    if (before === null) return false;

    await button.click();

    // Wait until number updates
    const after = await page.waitForFunction(
      (prev) => {
        const text = document.body.innerText;
        const match = text.match(/-?\d+/);
        if (!match) return false;
        return parseInt(match[0], 10) === prev + 1;
      },
      { timeout: 2000 },
      before
    );

    return !!after;
  } catch (err) {
    console.error("Validation error (Challenge 4):", err.message);
    return false;
  }
}
