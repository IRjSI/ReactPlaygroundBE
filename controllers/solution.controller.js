import SolutionModel from "../models/solution.model.js"
import { getSignedS3Url } from "../utils/s3.js"

/* Response
{
  data: [
    {
      challenge: string,
      solution: string
    }
  ],
  success: boolean
}
*/
const getSolutions = async (req, res) => {
    // to get the solutions of the user to display on the editor(frontend)
    try {
      const solutions = await SolutionModel.find({
        user: req.user?._id,
        result: "valid"
      }).select("challenge solution");

      const updatedSolutions = await Promise.all(
        solutions.map(async (sol) => {
          let signedUrl = null;
          if (sol.solution && sol.solution !== "null") {
            try {
              signedUrl = await getSignedS3Url(sol.solution);
              console.log(signedUrl)
            } catch (err) {
              console.error("Error fetching S3 URL for key:", sol.solution);
              console.error("Error fetching S3 URL Error:", err.message);
            }
          }

          return {
            challenge: sol.challenge,
            solution: signedUrl,
          }
        })
      )

      return res.status(200).json({
        data: updatedSolutions,
        message: "Solutions",
        success: true
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
        success: false
      });
    }
}

/* Response
{
  data: [
    {
      challenge: string,
      solution: string
    }
  ],
  success: boolean
}
*/
const getSolutionByChallengeId = async (req, res) => {
    const { challengeId } = req.params;
    try {
      const solution = await SolutionModel.find({
        user: req.user?._id,
        challenge: challengeId
      }).select("challenge solution");

      const updatedSolution = async () => {
        let signedUrl = null;
        if (solution[0].solution && solution[0].solution !== "null") {
          try {
            signedUrl = await getSignedS3Url(solution[0].solution);
            console.log(signedUrl)
          } catch (err) {
            console.error("Error fetching S3 URL for key:", sol.solution);
            console.error("Error fetching S3 URL Error:", err.message);
          }
        }

        return {
          challenge: solution[0].challenge,
          solution: signedUrl,
        }
      }
      const result = await updatedSolution();

      return res.status(200).json({
        data: result,
        message: "Solution",
        success: true
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
        success: false
      });
    }
}
export {
  getSolutions,
  getSolutionByChallengeId
}