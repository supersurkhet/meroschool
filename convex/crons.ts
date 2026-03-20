import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "send-assignment-reminders",
  { hourUTC: 0, minuteUTC: 15 },
  internal.notifications.sendAssignmentDueReminder
);

crons.weekly(
  "cleanup-old-notifications",
  { hourUTC: 2, dayOfWeek: "sunday" },
  internal.notifications.deleteOldNotifications
);

export default crons;
