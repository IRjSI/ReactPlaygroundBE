import cron from "node-cron";
import UserModel from "../models/user.model";
import { sendNotification } from "./notification";

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Streak Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;color:#ffffff;padding:20px;text-align:center;">
              <h1 style="margin:0;font-size:22px;">React Playground</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h2 style="margin-top:0;color:#111827;">Your streak is in danger ⚠️</h2>

              <p style="font-size:16px;color:#374151;line-height:1.6;">
                You haven’t completed a question today. Your current streak is at risk.
              </p>

              <p style="font-size:16px;color:#374151;line-height:1.6;">
                Complete at least one problem now to keep your progress going.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                <tr>
                  <td align="center" style="border-radius:6px;background:#2563eb;">
                    <a href="https://reactpg.xyz" 
                       style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">
                      Continue Your Streak
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#6b7280;">
                Stay consistent. Small steps daily build long-term progress.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#9ca3af;">
              <p style="margin:0;">This is an automated email. Please do not reply.</p>
              <p style="margin:5px 0 0;">
                © ${new Date().getFullYear()} React Playground
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

// every day at 10:00 pm
cron.schedule("0 22 * * *", async () => {
    console.log('running a task every day at midnight');

    // email about streak, IF they missed today
    try {
        const users = await UserModel.find({
            "streak.current": { $gt: 0 }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const user of users) {
            const lastSolved = user.streak.lastSolved ? new Date(user.streak.lastSolved) : null;

            if (!lastSolved || lastSolved < today) {
                await sendNotification(
                    user.email,
                    `Hey ${user.name}, your streak is in danger!`,
                    "Hurry! Complete at least one question today to keep your streak alive.",
                    html
                );
            }
        }
    } catch (error) {
        console.error("Error in cron job:", error);
    }
}, {
    timezone: "Asia/Kolkata"
});