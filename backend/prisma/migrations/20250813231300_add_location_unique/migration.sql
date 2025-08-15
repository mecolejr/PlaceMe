-- Add composite unique index for (name, state)
CREATE UNIQUE INDEX IF NOT EXISTS "name_state" ON "Location" ("name", "state");

