export default async function validateChallenge3(page) {
  try {
    // wait for an input box
    const input = await page.waitForSelector("input", { timeout: 2000 });

    // type something unique
    const testValue = "react-playground-test";
    await input.click();
    await input.type(testValue);

    // now wait for something in the page to reflect this text
    // NOTE: we exclude the input itself, we want displayed text
    const success = await page.waitForFunction(
      (value) => {
        const bodyText = document.body.innerText.toLowerCase();
        return bodyText.includes(value.toLowerCase());
      },
      { timeout: 2000 },
      testValue
    );

    return !!success;
  } catch (err) {
    console.error("Validation error (Challenge 3):", err.message);
    return false;
  }
}
