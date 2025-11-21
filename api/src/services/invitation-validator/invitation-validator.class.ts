import type { Paginated } from '@feathersjs/feathers'
import type { Application } from '../../declarations'

interface InvitationData {
  type: string
  recipient: string
  token: string
}

interface Response {
  is_valid: boolean
}

export class InvitationValidatorService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Check that a token, recipient, type combination is a valid token.
   *
   * Return {is_valid: true} if the token exists, has been sent, and has not been revoked or consumed.
   * @param {InvitationData} data
   * @returns {Promise<Response>}
   */
  async create(data: InvitationData): Promise<Response> {
    const { token, recipient, type } = data

    if (!token || !recipient || !type) {
      return { is_valid: false }
    }

    try {
      const invitation = await this.app.service('invitations').find({
        query: {
          recipient,
          type,
          token,
          revoked_by: { $eq: null },
          consumed_by: { $eq: null }
        }
      }) as Paginated<InvitationData>

      if (invitation.total === 1) {
        return { is_valid: true }
      }

      return { is_valid: false }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message)
      } else {
        console.log(e)
      }

      return { is_valid: false }
    }
  }
}
