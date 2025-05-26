import { supabase } from '../services/supabaseClient.service'
import { Request, Response } from 'express'
import { v4 as uuid } from 'uuid'

export const uploadFile = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileName = `${uuid()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype
    });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }

  const { data: publicUrl } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return res.status(201).json({
    message: 'Upload bem-sucedido!',
    url: publicUrl.publicUrl
  });
};