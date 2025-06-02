import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const uploadFileToSupabase = async (file: Express.Multer.File, folder: string) => {
  const fileExt = file.originalname.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype
    })

  if (error) {
    throw new Error(`Erro ao enviar arquivo para o Supabase: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName)

  return {
    publicUrl: publicUrlData.publicUrl,
    path: fileName
  }
}
