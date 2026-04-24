import SolutionModel from "../models/solution.model.js";
import UserModel from "../models/user.model.js";
import ActivityModel from "../models/activity.model.js";
import { enqueueSolution } from "../utils/queue.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date = new Date()) => {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
};


/* Response
{
  solutionId: string,
}
*/
const checkSolution = async (req, res) => {
  const { iframeDoc, challengeId } = req.body;

  const userId = req.user?._id;

  const solution = await SolutionModel.findOneAndUpdate(
    { user: userId, challenge: challengeId },
    {
      $set: {
        status: "pending",
      },
      $setOnInsert: {
        solution: "null",
      },
    },
    { new: true, upsert: true }
  );

  await enqueueSolution(solution._id.toString(), iframeDoc, challengeId, userId);

  return res.json({ solutionId: solution._id });
};

const updateUserStreak = async (userId, solvedAt = new Date()) => {
  const today = startOfUtcDay(solvedAt);
  const user = await UserModel.findById(userId).select("streak");

  if (!user) return null;

  const lastSolvedDay = user.streak?.lastSolvedDate
    ? startOfUtcDay(user.streak.lastSolvedDate)
    : null;

  if (lastSolvedDay?.getTime() === today.getTime()) {
    return user.streak;
  }

  const daysSinceLastSolve = lastSolvedDay
    ? Math.floor((today - lastSolvedDay) / MS_PER_DAY)
    : null;

  const current = daysSinceLastSolve === 1
    ? (user.streak?.current || 0) + 1
    : 1;

  user.streak = {
    current,
    longest: Math.max(user.streak?.longest || 0, current),
    lastSolvedDate: today
  };

  await user.save();
  return user.streak;
};

const formatDateToString = (date) => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const updateUserActivity = async (userId, solvedAt = new Date()) => {
  try {
    const today = startOfUtcDay(solvedAt);
    const dateString = formatDateToString(today);

    const activity = await ActivityModel.findOneAndUpdate(
      { userId, date: dateString },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    return activity;
  } catch (error) {
    console.error("Error updating user activity:", error);
    return null;
  }
};

export { checkSolution, updateUserStreak, updateUserActivity };
