-- Ejecutar una vez en Neon (SQL Editor) antes del primer deploy.

CREATE TABLE IF NOT EXISTS codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fabric_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  aspect_ratio TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS styles_code_id_idx ON styles(code_id);
