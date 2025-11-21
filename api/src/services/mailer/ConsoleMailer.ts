import type { MailerData } from '../../declarations'

/**
 * Print all sent emails to the console.
 */
export class ConsoleMailer {

  /**
   * Print email to console
   */
  async sendMail(data: MailerData): Promise<void> {
    if (process.env.ENVIRONMENT !== 'test') {
      console.log('Sending email to console.log:', JSON.stringify(data, null, 2))
    }

    return Promise.resolve()
  }
}
