-- Reconciliar colunas antigas *_new -> finais, sem quebrar em shadow DB

DO $$ BEGIN
  -- frequency: se existir a antiga e não existir a nova, renomeia;
  -- se as duas existirem, remove a antiga; senão, não faz nada.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Recurrence' AND column_name = 'frequency_new'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Recurrence' AND column_name = 'frequency'
    ) THEN
      ALTER TABLE "Recurrence" RENAME COLUMN "frequency_new" TO "frequency";
    ELSE
      ALTER TABLE "Recurrence" DROP COLUMN "frequency_new";
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  -- status: mesma lógica
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Recurrence' AND column_name = 'status_new'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Recurrence' AND column_name = 'status'
    ) THEN
      ALTER TABLE "Recurrence" RENAME COLUMN "status_new" TO "status";
    ELSE
      ALTER TABLE "Recurrence" DROP COLUMN "status_new";
    END IF;
  END IF;
END $$;

-- Índice em status (só cria se faltar)
CREATE INDEX IF NOT EXISTS "Recurrence_status_idx" ON "Recurrence"("status");
