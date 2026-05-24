# Database Export Samples

This folder contains JSON database export samples for the assignment submission.

The app uses MongoDB collections that correspond to the main business entities:

- `users.sample.json`: authenticated users, profile fields, roles, and auth provider metadata
- `beaches.sample.json`: beach records used by explore, map, ranking, and admin CRUD
- `plans.sample.json`: generated and saved beach plans
- `clusters.sample.json`: user-owned mood clusters and saved beach references
- `user_activities.sample.json`: audit/activity records shown in the admin dashboard

These files are intentionally sample/export data only. They do not contain real `.env` secrets, JWT secrets, OAuth secrets, MongoDB credentials, or Gemini keys.
