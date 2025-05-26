import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // use a chave service role no backend

export const supabase = createClient(supabaseUrl, supabaseKey)