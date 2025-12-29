export default async function validateChallenge3(page) {
  try {
    // wait React to render UI
    await page.waitForSelector("input", { timeout: 4000 });

    const testValue = "react-playground-test";

    // Set value + trigger React synthetic event
    await page.evaluate((value) => {
      const input = document.querySelector("input");
      input.focus();
      input.value = value;

      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
          cancelable: true
        })
      );
    }, testValue);

    // Now wait for p tag to update
    await page.waitForFunction(
      value =>
        Array.from(document.querySelectorAll("p"))
          .some(p => p.innerText.toLowerCase().includes(value.toLowerCase())),
      { timeout: 4000 },
      testValue
    );

    return true;
  } catch (err) {
    console.error("Validation error (Challenge 3):", err.message);
    return false;
  }
}
