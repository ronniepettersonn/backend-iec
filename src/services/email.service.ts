import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async ({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) => {
  try {
    const response = await resend.emails.send({
      from: 'IEC - Igreja do Evangelho de Cristo <noreply@igrejaiec.com.br>', // ou domínio de testes
      to,
      subject,
      html
    })

    return response
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    throw new Error('Erro ao enviar e-mail')
  }
}