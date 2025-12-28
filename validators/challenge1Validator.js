export default async function validateChallenge1(page) {
  try {
    // Wait for ANY button to appear
    const button = await page.waitForSelector("button", { timeout: 2000 });

    // Ensure it actually has visible text
    const text = await page.evaluate(el => el.textContent?.trim().toLowerCase(), button);

    // button exists + has some non-empty label
    return !!text;
  } catch (err) {
    console.error("Validation error (Challenge 1):", err.message);
    return false;
  }
}
