import mjml2html from 'mjml'
import { head, header } from './constants'

export default function(name: string, email: string, subject: string, message: string) {
  const html = mjml2html(`
  <mjml>
    ${head}
    <mj-body background-color="#ffffff">
      <mj-section padding="40px 0px">
        ${header}
        <mj-column border="1px solid #E5E5E5" padding="0px 0px 15px">
          <mj-text mj-class="small">
            Hello!
          </mj-text>
          <mj-text mj-class="small">
            A message has been sent from the 'Contact Us' form on the website.
          </mj-text>
          <mj-text mj-class="small">
          <strong>From:</strong> ${name}
          <br />
          <strong>Email:</strong> ${email}
          <br />
          <strong>Subject:</strong> ${subject}
          <br />
          <strong>Message:</strong> ${message}
          <br />
        </mj-text>
          <mj-text mj-class="small">
            Regards,
            <br />
            Participant Portal team
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `).html
  const text = `
    Hello!

    A message has been sent from the 'Contact Us' form on the website. 
    
    From: ${name}

    Email: ${email}

    Subject: ${subject} 

    Message: ${message}
    
    Regards,
    Participant Portal team
    `
  return {
    html, text, subject: `[Contact form] - ${subject}`
  }
}
