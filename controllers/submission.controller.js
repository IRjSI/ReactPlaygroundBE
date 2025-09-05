import { enqueueSolution } from "../utils/queue.js";

const checkSolution = async (req, res) => {
  const { iframeDoc } = req.body;
  const solutionId = `solution:${Date.now()}`;

  await enqueueSolution(solutionId, iframeDoc);

  return res.json({ solutionId });
};

export { checkSolution };
