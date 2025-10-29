import { Router } from "express"
import { createOffering, updateOfferingMeta, upsertOfferingItems, getOffering, listOfferings, finalizeOffering, reopenOffering } from "../controllers/offerings.controller"
import { isAuthenticated } from "../middlewares/isAuthenticated"
import { loadOffering } from "../middlewares/offerings.guard"
import { hasRole } from "../middlewares/hasRole"
import { getOfferingIntegrity, getOfferingSignatures, postSignOffering } from "../controllers/offeringsSignature.controller"
import { getOfferingPdf } from "../controllers/offeringsPdf.controller"
// middlewares exemplo:
// import { withAuth } from "../middlewares/auth"
// import { withTenant } from "../middlewares/tenant"

const router = Router()

// r.use(withAuth, withTenant)
router.use(isAuthenticated)

router.post("/", createOffering)
router.put("/:id/meta", loadOffering, upsertGuard, updateOfferingMeta)
router.put("/:id/items", loadOffering,upsertGuard, upsertOfferingItems)
router.get("/:id", getOffering)
router.get("/", listOfferings)

router.post("/:id/finalize", loadOffering, finalizeOffering)
router.post("/:id/reopen", loadOffering, hasRole('ADMIN'), reopenOffering)

// Colocar um hasRole('diacon') nessa rota, mas precisa saber se existe diacon
router.post("/:id/sign", postSignOffering)
router.get("/:id/signatures", getOfferingSignatures)
router.get("/:id/integrity", getOfferingIntegrity)
router.get("/:id/pdf", getOfferingPdf)

export default router

// opcional: um guard mínimo para checar params e churchId
function upsertGuard(req: any, res: any, next: any) {
  if (!req.params.id) return res.status(400).json({ error: "id ausente" })
  if (!req.churchId)  return res.status(401).json({ error: "churchId ausente" })
  next()
}
