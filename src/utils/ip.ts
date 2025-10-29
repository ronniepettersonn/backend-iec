import type { Request } from "express"

export function getClientIp(req: Request): string | undefined {
  const xf = (req.headers["x-forwarded-for"] as string) || ""
  const ip = xf.split(",").map(s => s.trim()).find(Boolean) || req.socket?.remoteAddress || req.ip
  return ip || undefined
}
