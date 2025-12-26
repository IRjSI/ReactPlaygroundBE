export default async function validateChallenge7(page) {
  try {
    const input = await page.waitForSelector("input", { timeout: 2000 });

    const testValue = "reactlen"; // length = 8
    await input.click();
    await input.type(testValue);

    // Wait until UI shows correct character count
    const success = await page.waitForFunction(
      (len) => {
        const text = document.body.innerText.toLowerCase();
        return text.includes("characters") && text.includes(String(len));
      },
      { timeout: 2000 },
      testValue.length
    );

    return !!success;
  } catch (err) {
    console.error("Validation error (Challenge 7):", err.message);
    return false;
  }
}
