# Database Export

This folder contains MongoDB JSON exports generated from the configured BeachPlease database.

The app uses MongoDB collections that correspond to the main business entities:

- `users.export.json`: authenticated users, profile fields, roles, and auth provider metadata
- `beaches.export.json`: beach records used by explore, map, ranking, and admin CRUD
- `plans.export.json`: generated and saved beach plans
- `clusters.export.json`: user-owned mood clusters and saved beach references
- `user_activities.export.json`: audit/activity records shown in the admin dashboard

User emails, password hashes, OAuth subjects, and token-like fields are sanitized before export. These files do not contain real `.env` secrets, JWT secrets, OAuth secrets, MongoDB credentials, or Gemini keys.

To regenerate the exports from a configured local backend:

```bash
cd backend
python -m app.seed.export_database
```
