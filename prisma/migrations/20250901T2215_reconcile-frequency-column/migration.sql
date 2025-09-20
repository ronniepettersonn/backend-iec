-- Reconciliação: garantir que a coluna final seja "frequency".
-- Em bancos que ainda tiverem "frequency_new", renomeia;
-- no seu banco atual (que já tem "frequency"), isso não fará nada.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Recurrence' AND column_name = 'frequency_new'
  ) THEN
    ALTER TABLE "Recurrence" RENAME COLUMN "frequency_new" TO "frequency";
  END IF;
END $$;
