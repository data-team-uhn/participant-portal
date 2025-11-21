import { TypographyPropsVariantOverrides, TypographyVariant } from '@mui/material'
import { RoleEnum } from 'PORTAL/constants'

export type UserType = {
  id: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role: RoleEnum
  locale: string
  subscribed: boolean
  isVerified: boolean
  verifyToken?: string
  verifyExpires?: Date
  resetToken?: string
  resetExpires?: Date
  created_at: Date
  updated_at:  Date
  participant?: ParticipantType
  coordinator?: CoordinatorType
}

export type Form = {
  id: string
  name: string
  study_id: string
  version: number
  form: SurveyType
  created_at: Date
  updated_at: Date
  form_response?: FormResponse
}

export type FormResponse = {
  id: string
  form_id: string
  participant_id: string
  responses: object
  is_complete: boolean
  furthest_page: number
  last_updated_at: Date
  created_at: Date
  updated_at: Date
}

export type StudyType = {
  id: string
  external_study_id: string
  title: string
  description: string
  stage: 'recruiting' | 'active' | 'invitation' | 'withdrawn' | 'completed' | 'hold'
  phase: string
  type: string
  linkId: string
  created_at: Date
  updated_at: Date
}

export type ParticipantType = {
  id: string
  user_id: string
  external_participant_id: string,
  birthdate: Date
  mrn: string
  registered: Date
  viewed_registry_consent: Date
  contact_permission_confirmed: Date
}

export type StudyParticipantType = {
  id: string
  study_id: string
  member_id: string
  external_id: string
  id_is_validated: boolean
  created_at: Date
  updated_at: Date
  study?: Partial<StudyType>
  participant?: Partial<ParticipantType>
}

export type CoordinatorType = {
  id: string,
  user_id: string,
  name_prefix: string,
  position: string,
  institution: string,
  approved: boolean,
  registered: Date
}

export type InvitationType = {
  id: string
  type: string
  token: string
  study_id: string
  recipient: string
  created_by: string
  last_sent_by?: string
  sent_at?: Date
  total_messages_sent: number
  sent_messages: Array<{triggered_by: string, sent_at: string}>
  revoked_by?: string
  revoked_at?: Date
  consumed_at?: Date
  consumed_by?: string
  created_at: Date
  updated_at: Date
  data_source?: string
}

interface SurveyComponentType {
  type: string
  text?: string
  isRequired?: boolean
  disabled?: boolean
  id?: string
  inputType?: string
  max?: string
  min?: string
  enableWhen?: {
    hasAnswer?: boolean
    question: string
    answer: string | boolean
  }[]
  props?: object
  component?: any
  variant?: TypographyVariant & TypographyPropsVariantOverrides
  choices?: {
    text?: string
    value: string
  }[]
  errorMessage?: string
  // Added by the SurveyProvider
  isQuestion?: boolean
  isVisible?: boolean
}

interface SurveyPageType {
  title: string
  nextAction?: string
  components: SurveyComponentType[]
  enableWhen?: {
    hasAnswer?: boolean
    question: string
    answer: string | boolean
  }[]
  // Added by the SurveyProvider
  number?: number
  isVisible?: boolean
}

interface SurveyType {
  title: string
  secondaryTitle?: string
  descriptor?: string
  showWithdrawIfComplete?: boolean
  pages: SurveyPageType[]
}

interface ModulesType extends Form {
  form_responses?: Partial<FormResponse>
}

interface ModuleResponsesType extends FormResponse {
  form: Partial<Form>
}

interface SettingType {
  id: string
  value: string
  updated_at?: Date
  editor_name?: UserType
}

interface DataSourceType {
  id: string
  name: string
  updated_at?: Date
  created_at?: Date
}

export type CardContentType = {
  typeId: string
  typeMessage: string
  title: {
    messageId: string
    defaultMessage: string
  }
  subtitle: {
    messageId: string
    defaultMessage: string
  }
  image: string
}

export type SurveyComponentProps = {
  component: SurveyComponentType,
  responses: any,
  onResponse: (choice: any, value: any) => void,
  disabled?: boolean
  isPrinting?: boolean
}
