-- Garantir que a coluna roles exista (idempotente)
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "roles" "Role"[] NOT NULL DEFAULT ARRAY['MEMBER']::"Role"[];

-- Backfill: se "role" existir, copia para "roles" apenas onde estiver vazio/nulo
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'role'
  ) THEN
    UPDATE "User"
      SET "roles" = CASE
        WHEN "roles" IS NULL OR cardinality("roles") = 0
          THEN ARRAY["role"]::"Role"[]
        ELSE "roles"
      END;
  END IF;
END $$;

-- Agora é seguro remover a coluna antiga
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- (opcional) índice para acelerar buscas por papel
CREATE INDEX IF NOT EXISTS "user_roles_gin_idx"
  ON "User" USING GIN ("roles");
