import moment from 'moment-timezone'

const REGISTRY_EXTERNAL_ID = process.env.REGISTRY_EXTERNAL_ID || 'connect'

const TIME_ZONE = 'America/New_York'
const DATE_FORMAT = 'YYYY-MM-DD'

/**
 * Return the current date and time.
 *
 * - time is a moment object
 * - date is a strong formatted as 'YYYY-MM-DD'
 *
 * @returns {{date: (string), time: (moment.Moment)}}
 */
const GET_TIME = (): { date: (string); time: (moment.Moment) } => {
  // NOW and TODAY allow developers to set a specific date for testing purposes
  // In production, the time should always be the local time
  const NOW = moment().tz(TIME_ZONE)
  const TODAY = NOW.format(DATE_FORMAT)
  return {
    time: process.env.ENVIRONMENT === 'production'
      ? moment().tz(TIME_ZONE)
      : NOW,
    date: process.env.ENVIRONMENT === 'production'
      ? moment().tz(TIME_ZONE).format(DATE_FORMAT)
      : TODAY
  }
}

export default {
  TIME_ZONE,
  DATE_FORMAT,
  GET_TIME,
  REGISTRY_EXTERNAL_ID,
  USER_SENSITIVE_FIELDS: ['password', 'participant.mrn', 'verifyToken', 'resetToken'],
  ENCRYPTED_FIELDS: ['mrn'],
  ENVIRONMENT: process.env.ENVIRONMENT,
  MFA_SHORT_TOKEN_LENGTH: 6,
  MFA_MAX_RESENDS: 5,
  MFA_RESEND_PERIOD: 1000 * 60 * 5,
  MFA_TIME_VALID: 1000 * 60 * 10,
  INACTIVITY_THRESHOLD_DAYS: 180,
}
