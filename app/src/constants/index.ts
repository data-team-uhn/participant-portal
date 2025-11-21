import ClinicalPhenotypesImage from 'PORTAL/images/card_clinical_phenotypes.png'
import CommunicationImage from 'PORTAL/images/card_communication.png'
import ConsentImage from 'PORTAL/images/card_consent.png'
import ConsentWelcomeImage from 'PORTAL/images/card_consent_welcome.png'
import DemographicsImage from 'PORTAL/images/card_demographics.png'
import GeneticInformationImage from 'PORTAL/images/card_genetic_information.png'

export const BASE_URL: string = process.env.API_BASE_URL
export const INTERNAL_BASE_URL: string | undefined =
	process.env.INTERNAL_API_BASE_URL
export const SPA_BASE_URL: string = process.env.SPA_BASE_URL
export const ENVIRONMENT : string | undefined = process.env.NODE_ENV

export const NAV_MIN_HEIGHT = 56
export const LANDING_NAV_MIN_HEIGHT = 64
export const DASHBOARD_MAX_WIDTH = '60em'

export const ADMIN_CONTACT: string = process.env.ADMIN_CONTACT

export const MAINTENANCE_BANNER_ID = 'maintenance-banner'
export const DEFAULT_BANNER_MESSAGE = 'The Connect Portal will undergo scheduled maintenance. We expect it to take 5 to 15 minutes. You will be automatically logged out and any progress will be saved. You cannot log in or update your account during this time.'

export const MAX_CONTACT_TIMES: number = Number(process.env.MAX_CONTACT_TIMES)

export enum SETTING {
  restrictLogin = 'restrict_login',
  loggedOutTime = 'loggedout_time',
  bannerMessage = 'banner_text',
  bannerOn = 'banner_on',
  totalAuthenticatedUsers = 'totalAuthenticatedUsers',
  totalUsersOnline = 'totalUsersOnline',
  newUserCount = 'newUserCount',
  patched = 'patched'
}

export const GOOGLE_CAPTCHA_ENABLED = process.env.GOOGLE_CAPTCHA_ENABLED === 'true'
export const GOOGLE_CAPTCHA_SITE_KEY = process.env.GOOGLE_CAPTCHA_SITE_KEY

export enum FORM_TYPE_ENUM {
  CONSENT = 'consent',
  MODULE = 'module',
}

export enum RoleEnum {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  PARTICIPANT = 'participant'
}

export const REAPTCHA_PROPS = {
  sitekey: GOOGLE_CAPTCHA_SITE_KEY,
  size: 'invisible' as const,
  explicit: true
}

export const DASHBOARD_CARD_CONTENT_MAPPING = {
  consent: {
    typeId: 'dashboard.cards.consentType',
    typeMessage: 'Consent',
    incomplete: {
      title: {
        messageId: 'dashboard.cards.incompleteConsentTitle',
        defaultMessage: 'Hello!',
      },
      subtitle: {
        messageId: 'dashboard.cards.incompleteConsentSubtitle',
        defaultMessage:
          'You have been invited to participate in the Connect Portal. Please review and complete the Informed consent Form for participation in the Connect Registry by clicking the button below.',
      },
      image: ConsentWelcomeImage,
    },
    complete: {
      title: {
        messageId: 'dashboard.cards.consentTitle',
        defaultMessage: 'All for One Connect Registry Consent',
      },
      subtitle: {
        messageId: 'dashboard.cards.consentSubtitle',
        defaultMessage:
          'Please review the Informed consent Form for participation in the Connect Registry by clicking the button below.',
      },
      image: ConsentImage,
    }
  },
  clinical_phenotypes: {
    typeId: 'dashboard.cards.moduleType',
    typeMessage: 'Module',
    title: {
      messageId: 'dashboard.cards.clinicalPhenotypesTitle',
      defaultMessage: 'Clinical Phenotypes',
    },
    incomplete: {
      subtitle: {
        messageId: 'dashboard.cards.incompleteClinicalPhenotypesSubtitle',
        defaultMessage: 'Please review and complete the consent form by clicking the button below.',
      },
    },
    complete: {
      subtitle: {
        messageId: 'dashboard.cards.clinicalPhenotypesSubtitle',
        defaultMessage: 'Please review the consent form by clicking the button below.',
      },
    },
    image: ClinicalPhenotypesImage,
  },
  genetic_information: {
    typeId: 'dashboard.cards.moduleType',
    typeMessage: 'Module',
    title: {
      messageId: 'dashboard.cards.geneticInformationTitle',
      defaultMessage: 'Genetic Information',
    },
    incomplete: {
      subtitle: {
        messageId: 'dashboard.cards.incompleteGeneticInformationSubtitle',
        defaultMessage:
          'Please review and complete the genetic information form by clicking the button below.',
      },
    },
    complete: {
      subtitle: {
        messageId: 'dashboard.cards.geneticInformationSubtitle',
        defaultMessage:
          'Please review the genetic information form by clicking the button below.',
      },
    },
    image: GeneticInformationImage,
  },
  communication: {
    typeId: 'dashboard.cards.moduleType',
    typeMessage: 'Module',
    title: {
      messageId: 'dashboard.cards.communicationTitle',
      defaultMessage: 'Communication Preferences',
    },
    incomplete: {
      subtitle: {
        messageId: 'dashboard.cards.incompleteCommunicationSubtitle',
        defaultMessage:
          'Please review and complete the communication preferences form by clicking the button below.',
      },
    },
    complete: {
      subtitle: {
        messageId: 'dashboard.cards.communicationSubtitle',
        defaultMessage:
          'Please review the communication preferences form by clicking the button below.',
      },
    },
    image: CommunicationImage,
  },
  demographics: {
    typeId: 'dashboard.cards.moduleType',
    typeMessage: 'Module',
    title: {
      messageId: 'dashboard.cards.demographicsTitle',
      defaultMessage: 'Demographics',
    },
    incomplete: {
      subtitle: {
        messageId: 'dashboard.cards.incompleteDemographicsSubtitle',
        defaultMessage:
          'Please review and complete the demographics form by clicking the button below.',
      },
    },
    complete: {
      subtitle: {
        messageId: 'dashboard.cards.demographicsSubtitle',
        defaultMessage:
          'Please review the demographics form by clicking the button below.',
      },
    },
    image: DemographicsImage,
  },
}
