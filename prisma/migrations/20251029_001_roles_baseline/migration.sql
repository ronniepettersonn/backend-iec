-- Baseline para registrar o que já existe no banco
-- (não será executada no DB de produção; será apenas "marcada como aplicada")
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "roles" "Role"[] NOT NULL DEFAULT ARRAY['MEMBER']::"Role"[];

CREATE INDEX IF NOT EXISTS "user_roles_gin_idx"
  ON "User" USING GIN ("roles");
