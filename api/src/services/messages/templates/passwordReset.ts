import mjml2html from 'mjml'
import { head, header, themeColor } from './constants'

const APP_BASE_URL = process.env.APP_BASE_URL

export default function(token: string, url: string) {
  const subject = 'Connect Password Reset'
  const html = mjml2html(`
  <mjml>
    ${head}
    <mj-body background-color="#ffffff">
      <mj-section padding='40px 0px'>
        ${header}
        <mj-column border="1px solid #E5E5E5" padding="0px 0px 15px">
          <mj-text mj-class="small">
            Hello!
          </mj-text>
          <mj-text mj-class="small">
           We’ve received a password reset request from your Connect account. If you did not submit this request, you can safely ignore this email and your account will not be affected.
          </mj-text>
          <mj-text mj-class="small">
            <strong>
              To reset your password, click the button below:
            </strong>
          </mj-text>
          <mj-button href="${url}" target="_blank" align="left" background-color="${themeColor}" color="white" font-weight="600" border-radius="18px" text-transform="uppercase">
            <mj-text>Reset Your Password</mj-text>
          </mj-button>
          <mj-text mj-class="small">
            Please note, this button will only be active for one hour.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `).html
  const text = `
    Hello!

    We’ve received a password reset request from your PCGL account. If you did not submit this request, you can safely ignore this email and your account will not be affected. 
    
    To reset your password, click the following: ${url}

    Please note, this button will only be active for one hour.

    Regards,
    PCGL team

    Unsubscribe to all PCGL emails by clicking on the following: ${APP_BASE_URL}/unsubscribe?token=${token}
    `
  return {
    html, text, subject
  }
}
