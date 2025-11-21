import mjml2html from 'mjml'
import { head, header, themeColor } from './constants'

const APP_BASE_URL = process.env.APP_BASE_URL

export default function(token: string, url: string) {
  const subject = 'Connect Account Verification'
  const html = mjml2html(`
  <mjml>
    ${head}
    <mj-body background-color="#ffffff">
      <mj-section padding="40px 0px">
        ${header}
        <mj-column border="1px solid #E5E5E5" padding="0px 0px 15px">
          <mj-text mj-class="small">
            Hello,
          </mj-text>
          <mj-text mj-class="small">
            Welcome to Connect! We're happy to have you on board.
          </mj-text>
          <mj-text mj-class="small">
            You’re almost ready to start using Connect. To help us secure your account, we need to verify your email address.
          </mj-text>
          <mj-text mj-class="small">
            Please click the button below to confirm your email and activate your account. 
          </mj-text>
          <mj-text mj-class="small" font-style="italic">
            Please note that this link is valid for 24 hours.
          </mj-text>
          <mj-text mj-class="small">
            Thanks for getting started with us! 
          </mj-text>
          <mj-button href="${url}" target="_blank" align="left" background-color="${themeColor}" color="white" font-weight="600" border-radius="18px" text-transform="uppercase">
            <mj-text>Verify Email</mj-text>
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `).html
  const text = `
    Hello,

    Welcome to Connect! We're happy to have you on board.

    You’re almost ready to start using Connect. To help us secure your account, we need to verify your email address.
    
    Please click the link to confirm your email and activate your account: ${url}

    Please note that this link is valid for 24 hours.
    
    Thanks for getting started with us! 

    Unsubscribe to all Connect emails by clicking on the following: ${APP_BASE_URL}/unsubscribe?token=${token}
    `
  return {
    html, text, subject
  }
}
