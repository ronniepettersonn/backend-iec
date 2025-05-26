import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: JwtPayload
      file?: Express.Multer.File;
    files?: Express.Multer.File[];
    }
  }
}