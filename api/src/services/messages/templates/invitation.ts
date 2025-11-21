import mjml2html from 'mjml'
import { head, header, themeColor } from './constants'

export default function (token: string, invitationUrl: string, qrCode : string) {
  const subject = 'Connect Participant Portal Invitation'

  const html = mjml2html(`
  <mjml>
    ${head}
    <mj-body background-color='#ffffff'>
      <mj-section padding='40px 0px'>
        ${header}
        <mj-column border='1px solid #E5E5E5' padding='0px 0px 15px'>
          <mj-text mj-class='small'>
            Hello,
          </mj-text>
          <mj-text mj-class='small'>
            You are invited to join the Connect Participant Portal Platform.
          </mj-text>
          <mj-text mj-class='small'>
            To accept the invitation and set up an account, click the button below, or scan the QR code:
          </mj-text>
          <mj-button href='${invitationUrl}' target='_blank' align='left' background-color='${themeColor}' color='white' font-weight='600' border-radius='18px' text-transform="uppercase">
            <mj-text>Register for Connect</mj-text>
          </mj-button>
          <mj-text>
            ${qrCode}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `).html
  const text = `
    Hello!

    You are invited to join the Connect Participant Portal Platform.
    
    To accept the invitation and set up an account, click the following: ${invitationUrl}

    Regards,
    PCGL team
    `
  return {
    html, text, subject
  }
}
