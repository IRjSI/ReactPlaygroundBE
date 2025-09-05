import { createClient } from "redis";
import jsdom from "jsdom";

const { JSDOM } = jsdom;

const redis = createClient();
await redis.connect();

await redis.subscribe("solution_channel", async (message) => {
  const { solutionId } = JSON.parse(message);
  const solutionData = await redis.lPop("solutions_queue");

  if (!solutionData) return;

  const { iframeDoc } = JSON.parse(solutionData);//solutionData={"solutionId": "...", iframeDoc: "<html>...</html>"}

  // process/validate solution here
  const dom = new JSDOM(iframeDoc);
  const document = dom.window.document;

  const element = document.querySelector("button");
  if (!element) return false

  const beforeText = element.textContent?.toLowerCase().trim();
  // Fire click event
  element.dispatchEvent(new Event("click", { bubbles: true }));

  const afterText = element.textContent?.toLowerCase().trim();

  return beforeText !== afterText && afterText === "click";

});
