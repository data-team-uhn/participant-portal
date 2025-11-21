import { ConfidentialClientApplication } from '@azure/msal-node'

import type { MailerData } from '../../declarations'

const ADMIN_CONTACT = process.env.ADMIN_CONTACT || 'test@test.com'
const MS_CLIENT_ID = process.env.MS_CLIENT_ID || ''
const MS_AUTHORITY = process.env.MS_AUTHORITY || ''
const MS_CERTIFICATE_PRIVATE_KEY = process.env.MS_CERTIFICATE_PRIVATE_KEY || ''
const MS_CERTIFICATE_THUMBPRINT = process.env.MS_CERTIFICATE_THUMBPRINT || ''

const MS_TEST_MODE = process.env.MS_TEST_MODE === 'true'
const MS_TEST_MODE_EMAIL = process.env.MS_TEST_MODE_EMAIL || 'test@test.com'

/**
 * Send emails from MS Graph
 *
 * Handles authentication to Microsoft and token storage.
 */
export class MSGraphMailer {
  private client: ConfidentialClientApplication
  private graphUrl = `https://graph.microsoft.com/v1.0/users/${ADMIN_CONTACT}/sendMail`
  private scopes = ['https://graph.microsoft.com/.default']
  private cachedToken: string | null = null
  private tokenExpiresOn: Date | null = null

  constructor() {
    if (
      !ADMIN_CONTACT ||
      !MS_CERTIFICATE_PRIVATE_KEY ||
      !MS_CERTIFICATE_THUMBPRINT ||
      !MS_CLIENT_ID ||
      !MS_AUTHORITY
    ) {
      throw new Error('ADMIN_CONTACT, MS_CERTIFICATE_PRIVATE_KEY, MS_CERTIFICATE_THUMBPRINT, MS_CLIENT_ID, and MS_AUTHORITY must be set for MSAL authentication')
    }

    this.client = new ConfidentialClientApplication({
      auth: {
        clientId: MS_CLIENT_ID,
        authority: MS_AUTHORITY,
        clientCertificate: {
          thumbprint: MS_CERTIFICATE_THUMBPRINT,
          privateKey: MS_CERTIFICATE_PRIVATE_KEY,
        }
      }
    })
  }

  /**
   * Check if cached token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.cachedToken || !this.tokenExpiresOn) {
      return false
    }

    // Add 1 minute buffer before expiration
    const bufferTime = 60 * 1000
    return Date.now() < (this.tokenExpiresOn.getTime() - bufferTime)
  }

  /**
   * Fetch access token from Microsoft (uses cached token if still valid)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.isTokenValid()) {
      return this.cachedToken as string
    }

    try {
      const tokenResponse = await this.client.acquireTokenByClientCredential({ scopes: this.scopes })

      if (!tokenResponse) {
        throw new Error('Failed to acquire access token')
      }

      const { accessToken, expiresOn } = tokenResponse

      // Cache the token and expiration time
      this.cachedToken = accessToken
      this.tokenExpiresOn = expiresOn

      return accessToken
    } catch (error) {
      console.error('Error acquiring Microsoft access token:', error)
      throw error
    }
  }


  /**
   * Send email from MSGraph
   */
  async sendMail(data: MailerData): Promise<void> {
    try {
      const accessToken = await this.getAccessToken()

      // If in test mode, always send to the test email
      const recipient = MS_TEST_MODE ? MS_TEST_MODE_EMAIL : data.to

      const emailMessage = {
        message: {
          subject: data.subject,
          body: {
            contentType: 'HTML',
            content: data.html
          },
          from: {
            emailAddress: {
              name: data.fromName || data.from,
              address: data.from
            }
          },
          toRecipients: [
            {
              emailAddress: {
                address: recipient
              }
            }
          ]
        },
        saveToSentItems: false
      }

      const response = await fetch(this.graphUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailMessage)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send email: ${response.status} ${response.statusText} - ${errorText}`)
      }
    } catch (error) {
      throw new Error(`Error sending email via MS Graph: ${error}`)
    }
  }
}
