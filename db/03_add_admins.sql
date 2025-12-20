-- Add Admin Emails
-- Replace the email addresses below with your actual admin emails
-- IMPORTANT: The email must match EXACTLY (case-sensitive) with your Supabase Auth account email

INSERT INTO admins (email) VALUES
('docorsense@gmail.com'),  -- Add the exact email from your Supabase Auth account
('decorsense@gmail.com')   -- If you have both variations, add both
ON CONFLICT (email) DO NOTHING;

-- To add multiple admins, add more lines:
-- INSERT INTO admins (email) VALUES
-- ('admin1@example.com'),
-- ('admin2@example.com'),
-- ('admin3@example.com')
-- ON CONFLICT (email) DO NOTHING;

