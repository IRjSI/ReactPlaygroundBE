import { enqueueSolution } from "../utils/queue.js";

const checkSolution = async (req, res) => {
  const { iframeDoc, challengeId } = req.body;
  console.log("chaking", challengeId)
  const solutionId = Date.now().toString();

  await enqueueSolution(solutionId, iframeDoc, challengeId);
  return res.json({ solutionId });
};

export { checkSolution };
