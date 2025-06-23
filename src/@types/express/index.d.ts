//import { JwtPayload } from 'jsonwebtoken';

// src/@types/express/index.d.ts

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        churchId: string;
        role: string;
      };
      churchId?: string
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {}; // 👈 ESSENCIAL