import SolutionModel from "../models/solution.model.js";
import { enqueueSolution } from "../utils/queue.js";

/* Response
{
  solutionId: string,
}
*/
const checkSolution = async (req, res) => {
  const { iframeDoc, validatorKey, challengeId } = req.body;
  
  const user = req.user?._id;

  const solution = await SolutionModel.findOneAndUpdate(
    { user, challenge: challengeId },
    {
      $set: {
        status: "pending",
        solution: "null",
      }
    },
    { new: true, upsert: true }
  );

  await enqueueSolution(solution._id.toString(), iframeDoc, validatorKey, challengeId, user);
  return res.json({ solutionId: solution._id });
};

export { checkSolution };
