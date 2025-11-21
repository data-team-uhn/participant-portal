const errors = require('@feathersjs/errors')
const fetch = require('node-fetch')
import { get } from 'lodash'

import type { HookContext } from '../declarations'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CAPTCHA_ENABLED = process.env.GOOGLE_CAPTCHA_ENABLED
const GOOGLE_CAPTCHA_SITE_KEY = process.env.GOOGLE_CAPTCHA_SITE_KEY
const GOOGLE_CAPTCHA_URL = process.env.GOOGLE_CAPTCHA_URL


const validateCaptcha = () => (context: HookContext) => {
  // We don't need to validate captchas for authenticated users
  if (context.params.user) {
    return context
  }

  const captcha_response = get(context.data, 'captcha_response')
  delete context.data.captcha_response

  const body = {
    event: {
      siteKey: GOOGLE_CAPTCHA_SITE_KEY,
      token: captcha_response
    }
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
  }

  if(GOOGLE_CAPTCHA_ENABLED === 'true') {
    return fetch(`${GOOGLE_CAPTCHA_URL}?key=${GOOGLE_API_KEY}`, options)
      .then((res : any) => res.json())
      .then((json : any) => {
        const score = get(json, 'riskAnalysis.score')
        //the free version of reCaptcha only offers scores of 0.1, 0.3, 0.7, and 0.9
        if(score >= 0.7) {
          return context
        }

        throw new errors.BadRequest('Captcha check failed')
      })
  }

  return context
}

export default validateCaptcha
