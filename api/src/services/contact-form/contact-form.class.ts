import flatMap from 'lodash/flatMap'

import type { Application } from '../../declarations'

import templates from '../messages/templates'

const ADMIN_CONTACT = process.env.ADMIN_CONTACT || ''

export class ContactFormService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: any) {
    return this.app.service('mailer').create({
      to: ADMIN_CONTACT,
      from: ADMIN_CONTACT,
      ...templates['contactForm'](...flatMap(data))
    })
  }
}
