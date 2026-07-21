/*
# Disable email confirmation for immediate login

1. Auth changes
- Confirms all existing unconfirmed users so they can log in immediately.
- Email confirmation requires an SMTP email service, which this project
  does not have configured. Without it, new users stay unconfirmed forever
  and can never sign in, producing "Invalid login credentials" errors.
2. Notes
- Does NOT modify table structure or delete any data.
- Only backfills email_confirmed_at for existing unconfirmed users.
- Future signups will still need confirmation disabled at the Supabase
  Dashboard level (Authentication > Providers > Email > Confirm email).
*/

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
