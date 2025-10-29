export function fillTemplate(html: string, data: Record<string, any>) {
  return html.replace(/{{\s*([\w.]+)\s*}}/g, (_m, key) => {
    const v = key.split(".").reduce((o: { [x: string]: any }, k: string | number) => (o ? o[k] : undefined), data)
    return (v ?? "").toString()
  })
}
