import { renderTemplate } from '../../utils/renderTemplate';
import { sendEmail } from '../email.service';
 // implemente conforme seu provedor

export async function sendDefinePasswordEmail(to: string, link: string) {
  const html = renderTemplate('define-password', { link });
  await sendEmail({
    to,
    subject: 'Defina sua senha',
    html,
  });
}
