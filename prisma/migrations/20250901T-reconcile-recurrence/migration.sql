-- 0) Renomes defensivos (se ainda existir *_new)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'Recurrence' AND column_name = 'frequency_new') THEN
    ALTER TABLE "Recurrence" RENAME COLUMN "frequency_new" TO "frequency";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'Recurrence' AND column_name = 'status_new') THEN
    ALTER TABLE "Recurrence" RENAME COLUMN "status_new" TO "status";
  END IF;
END $$;

-- 1) Garante os ENUMs (cria se não existirem)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RecurrenceFrequency') THEN
    CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY','WEEKLY','MONTHLY','BIMONTHLY','QUARTERLY','SEMIANNUAL','ANNUAL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RecurrenceStatus') THEN
    CREATE TYPE "RecurrenceStatus" AS ENUM ('active','finished','overdue','paused');
  END IF;
END $$;

-- 2) frequency: só converte se AINDA não for enum
DO $$ DECLARE v_udt text;
BEGIN
  SELECT udt_name INTO v_udt
  FROM information_schema.columns
  WHERE table_name = 'Recurrence' AND column_name = 'frequency';

  IF v_udt IS NOT NULL AND v_udt <> 'RecurrenceFrequency' THEN
    ALTER TABLE "Recurrence"
      ALTER COLUMN "frequency" TYPE "RecurrenceFrequency"
      USING UPPER(COALESCE("frequency"::text, 'MONTHLY'))::"RecurrenceFrequency";
  END IF;
END $$;

-- 3) status: só converte se AINDA não for enum; sempre garante NOT NULL + DEFAULT
DO $$ DECLARE v_udt text;
BEGIN
  SELECT udt_name INTO v_udt
  FROM information_schema.columns
  WHERE table_name = 'Recurrence' AND column_name = 'status';

  -- Se não for enum, converter com CAST para text antes do LOWER()
  IF v_udt IS NOT NULL AND v_udt <> 'RecurrenceStatus' THEN
    ALTER TABLE "Recurrence" ALTER COLUMN "status" DROP DEFAULT;

    ALTER TABLE "Recurrence"
      ALTER COLUMN "status" TYPE "RecurrenceStatus"
      USING CASE LOWER(COALESCE("status"::text,'active'))
             WHEN 'active'   THEN 'active'::"RecurrenceStatus"
             WHEN 'finished' THEN 'finished'::"RecurrenceStatus"
             WHEN 'overdue'  THEN 'overdue'::"RecurrenceStatus"
             WHEN 'paused'   THEN 'paused'::"RecurrenceStatus"
             ELSE 'active'::"RecurrenceStatus"
           END;
  END IF;

  -- Em qualquer caso, garante default e NOT NULL do jeito certo
  ALTER TABLE "Recurrence"
    ALTER COLUMN "status" SET DEFAULT 'active',
    ALTER COLUMN "status" SET NOT NULL;
END $$;

-- 4) Índice em status (cria se faltando)
CREATE INDEX IF NOT EXISTS "Recurrence_status_idx" ON "Recurrence"("status");
