import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'

export function renderTemplate(templateName: string, variables: Record<string, any>): string {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`)
  const source = fs.readFileSync(templatePath, 'utf8')
  const template = handlebars.compile(source)
  return template(variables)
}
