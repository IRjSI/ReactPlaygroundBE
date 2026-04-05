import { enqueueSolution } from "../utils/queue.js";

/* Response
{
  solutionId: string,
}
*/
const checkSolution = async (req, res) => {
  const { iframeDoc, challengeId } = req.body;
  console.log("checking", challengeId)
  const solutionId = Date.now().toString();

  await enqueueSolution(solutionId, iframeDoc, challengeId);
  return res.json({ solutionId });
};

export { checkSolution };
