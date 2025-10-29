import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

export function renderTemplate(templateName: string, variables: Record<string, any>): string {
  // Em produção (código compilado), __dirname aponta para dist/.../ (pasta do arquivo atual)
  const prodPath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  // Em dev (ts-node), o arquivo fica em src/templates
  const devPath  = path.join(process.cwd(), 'src', 'templates', `${templateName}.html`);

  const candidatePaths = [
    process.env.TEMPLATE_DIR
      ? path.join(process.env.TEMPLATE_DIR, `${templateName}.html`)
      : null,
    prodPath,
    devPath,
  ].filter(Boolean) as string[];

  let source: string | null = null;
  let usedPath = '';

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      usedPath = p;
      source = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  if (!source) {
    throw new Error(
      `[renderTemplate] Template "${templateName}" não encontrado. Procurado em:\n` +
      candidatePaths.map(p => ` - ${p}`).join('\n')
    );
  }

  const template = handlebars.compile(source);
  return template(variables);
}
