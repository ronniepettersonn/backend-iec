import { z } from "zod"

export const createOfferingSchema = z.object({
  serviceType: z.enum(["SUNDAY","THURSDAY","SATURDAY","OTHER"]),
  serviceDate: z.coerce.date()
})

export const updateMetaSchema = z.object({
  sealNumber: z.string().trim().max(50).optional(),
  envelopes: z.coerce.number().int().min(0).optional()
})

export const upsertItemsSchema = z.object({
  items: z.array(z.object({
    kind: z.enum(["NOTE","COIN"]),
    value: z.coerce.number().positive(),
    quantity: z.coerce.number().int().min(0)
  })).min(1)
})

export const listOfferingsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["draft","finalized"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
})
