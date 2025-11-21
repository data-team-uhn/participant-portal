import { createTransport, type Transporter } from 'nodemailer'

import type { MailerData } from '../../declarations'
import { MSGraphMailer } from './MSGraphMailer'
import { ConsoleMailer } from './ConsoleMailer'

const MAIL_SERVICE = process.env.MAIL_SERVICE || 'console.log'

export class MailerService {
  // Private class member
  mailer: MSGraphMailer | Transporter<any, any> | ConsoleMailer

  constructor() {
    switch (MAIL_SERVICE) {

      case 'msgraph':
        this.mailer = new MSGraphMailer()
        break

      case 'mailhog':
        this.mailer = createTransport(({ host: 'mailhog', port: 1025, secure: false }))
        break

      case 'console.log':
      default:
        this.mailer = new ConsoleMailer()
    }
  }

  /**
   * Sends an email via the configured mail service using the information provided in data
   * @param data
   * @returns Promise<boolean> true if send was successful
   * @throws {Error} when mail fails to send
   */
  async create(data: MailerData): Promise<boolean> {
    // Add some spacing to the end of the text to make room for the footer
    data.text = `${ data.text }\n\n`

    try {
      await this.mailer.sendMail(data)
      return true
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message)
      } else {
        console.log(error)
      }
      throw error
    }
  }
}
