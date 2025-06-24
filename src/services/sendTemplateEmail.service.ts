import { sendEmail } from './email.service'
import { renderTemplate } from '../utils/renderTemplate'

interface TemplatedEmailProps {
  to: string
  subject: string
  templateName: string
  variables: Record<string, any>
}

export const sendTemplatedEmail = async ({
  to,
  subject,
  templateName,
  variables
}: TemplatedEmailProps) => {
  const html = renderTemplate(templateName, variables)
  return sendEmail({ to, subject, html })
}
