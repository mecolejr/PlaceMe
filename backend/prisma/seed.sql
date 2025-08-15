INSERT INTO "Location" (name, state, crimeRate, hateCrimeIndex, diversityIndex)
VALUES
  ('Texas', 'TX', 0.6, 0.3, 0.7),
  ('California', 'CA', 0.5, 0.2, 0.85),
  ('New York', 'NY', 0.55, 0.25, 0.8)
ON CONFLICT DO NOTHING;

