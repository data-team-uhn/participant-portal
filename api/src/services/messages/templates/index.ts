import invitation from './invitation'
import verification from './verification'
import passwordReset from './passwordReset'
import contactForm from './contactForm'

type template = (...args: any[]) => {
  subject: string
  text: string
  html: string
}

const templates: Record<string, template> = {
  'invitation': invitation,
  'verification': verification,
  'passwordReset': passwordReset,
  'contactForm': contactForm
}

export default templates
