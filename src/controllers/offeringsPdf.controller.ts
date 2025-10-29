// src/controllers/offerings.pdf.controller.ts
import { Request, Response } from "express"
import fs from "fs/promises"
import path from "path"
import dayjs from "dayjs"
import QRCode from "qrcode"
import puppeteer from "puppeteer"
import { prisma } from '../prisma/client'
import { fillTemplate } from "../utils/template"
import { supabase } from "../services/supabaseClient.service"

export async function getOfferingPdf(req: Request, res: Response) {
  const { id } = req.params

  const off = await prisma.offeringCount.findFirst({
    where: { id, churchId: req.churchId },
    include: {
      items: true,
      signatures: { include: { user: { select: { name: true } } }, orderBy: { signedAt: "asc" } },
      church: { select: { name: true } },
      createdBy: { select: { name: true } },
    }
  })
  if (!off) return res.status(404).json({ error: "Registro não encontrado" })
  if (off.status !== "finalized") return res.status(400).json({ error: "Finalize antes de gerar PDF" })
  if (off.signatures.length < 2) return res.status(400).json({ error: "São necessárias 2 assinaturas para gerar o PDF" })

  // ——— LOGO (Data URL) ———
  const logoPath = path.join(process.cwd(), "assets", "logos", "verbodavida.png")
  const logoBuffer = await fs.readFile(logoPath)
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`

  // ——— Tabelas ———
  const money = (v: number) => "R$ " + v.toFixed(2).replace(".", ",")
  const notesDen = [2,5,10,20,50,100,200]
  const coinsDen = [0.05,0.10,0.25,0.50,1.00]

  const notesRows = notesDen.map(v => {
    const it = off.items.find(i => i.kind === "NOTE" && Number(i.value) === v)
    const qty = it?.quantity ?? 0
    const total = qty * v
    return `<tr><td>R$ ${v.toFixed(2).replace(".", ",")}</td><td class="center">${qty}</td><td class="right">${money(total)}</td></tr>`
  }).join("")

  const coinsRows = coinsDen.map(v => {
    const it = off.items.find(i => i.kind === "COIN" && Number(i.value) === v)
    const qty = it?.quantity ?? 0
    const total = qty * v
    return `<tr><td>R$ ${v.toFixed(2).replace(".", ",")}</td><td class="center">${qty}</td><td class="right">${money(total)}</td></tr>`
  }).join("")

  const totalNotes = notesDen.reduce((s, v) => s + (off.items.find(i => i.kind === "NOTE" && Number(i.value) === v)?.quantity ?? 0) * v, 0)
  const totalCoins = coinsDen.reduce((s, v) => s + (off.items.find(i => i.kind === "COIN" && Number(i.value) === v)?.quantity ?? 0) * v, 0)
  const grandTotal = +(totalNotes + totalCoins).toFixed(2)
  const titheShare15 = +(grandTotal * 0.15).toFixed(2)

  // ——— Assinaturas ———
  const s1 = off.signatures[0]
  const s2 = off.signatures[1]
  const sigBlock = (s?: typeof s1) => ({
    name: s?.user?.name ?? "—",
    when: s ? dayjs(s.signedAt).format("DD/MM/YYYY HH:mm") : "—",
    ip: s?.ipAddress ?? "—",
    hash: s?.hash ?? "—"
  })

  // ——— Checkboxes por serviceType ———
  // ServiceType: SUNDAY | THURSDAY | SATURDAY | OTHER
  const sunBox  = off.serviceType === "SUNDAY"   ? "filled" : ""
  const thuBox  = off.serviceType === "THURSDAY" ? "filled" : ""
  const satBox  = off.serviceType === "SATURDAY" ? "filled" : ""
  const otherBox= off.serviceType === "OTHER"    ? "filled" : ""
  const otherLabel = off.serviceType === "OTHER" ? (off.sealNumber ? "" : "") : ""  // use outro campo se tiver um “serviceLabel”

  // ——— QR ———
  const verifyUrl = `${process.env.APP_URL}/offering/${off.id}/integrity`
  const verificationQrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0 })

  // ——— Template ———
  const tpl = await fs.readFile(path.join(process.cwd(), "views", "offerings-pdf-verbo.html"), "utf8")
  const html = fillTemplate(tpl, {
    logoDataUrl,
    id: off.id,
    churchName: off.church?.name ?? "—",
    date: dayjs(off.serviceDate).format("DD/MM/YYYY"),
    time: dayjs(off.serviceDate).format("HH:mm"),
    sealNumber: off.sealNumber ?? "—",
    envelopes: off.envelopes ?? 0,
    totalNotes: money(totalNotes),
    totalCoins: money(totalCoins),
    grandTotal: money(grandTotal),
    titheShare15: money(titheShare15),
    notesRows,
    coinsRows,
    sig1: sigBlock(s1),
    sig2: sigBlock(s2),
    verificationQrDataUrl,
    verifyUrl,
    sunBox, thuBox, satBox, otherBox,
    otherLabel
  })

  // ——— PDF ———
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle0" })
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", left: "12mm", right: "12mm", bottom: "16mm" }
  })
  await browser.close()

  // ——— Upload NO upsert (para não bater no RLS) ———
  const version = Date.now()
  const filePath = [
    "documents",
    "offerings",
    off.churchId,
    dayjs(off.serviceDate).format("YYYY"),
    dayjs(off.serviceDate).format("MM"),
    `conferencia-${off.id}-${version}.pdf`,
  ].join("/")

  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(filePath, pdfBuffer, { contentType: "application/pdf" })

  if (uploadError) {
    console.error(uploadError)
    return res.status(500).json({ error: "Erro ao fazer upload do PDF para o Supabase" })
  }

  const { data: publicUrl } = supabase.storage.from("uploads").getPublicUrl(filePath)

  return res.status(201).json({
    message: "PDF gerado com layout Verbo da Vida",
    url: publicUrl.publicUrl,
    path: filePath,
    offeringId: off.id
  })
}
