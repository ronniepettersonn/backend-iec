import multer from 'multer';

// Armazena o arquivo em memória (buffer), ideal para enviar ao Supabase
const storage = multer.memoryStorage();

export const upload = multer({ storage });