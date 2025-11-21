import { useContext, type RefObject } from 'react'
import type Reaptcha from 'reaptcha'
import { useTranslation } from 'react-i18next'
import get from 'lodash/get'
import merge from 'lodash/merge'

import { Breakpoint, Theme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { DASHBOARD_CARD_CONTENT_MAPPING, ENVIRONMENT, GOOGLE_CAPTCHA_ENABLED } from 'PORTAL/constants/'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { type CardContentType } from 'PORTAL/declarations'

type BreakpointOrNull = Breakpoint | null;

export function useWidth() {
	const theme: Theme = useTheme()
	const keys: readonly Breakpoint[] = [...theme.breakpoints.keys].reverse()
	return (
		keys.reduce((output: BreakpointOrNull, key: Breakpoint) => {
			const matches = useMediaQuery(theme.breakpoints.up(key));
			return !output && matches ? key : output;
		}, null) || 'xs'
	);
}

export function isMobile() {
	const width = useWidth();
	return width === 'xs' || width === 'sm';
}


export function translateString(id : string, defaultMessage : string) {
  
  const { t, i18n } = useTranslation()

  if (ENVIRONMENT === 'development') {
    if (!i18n.exists(id)) {
      return("**" + defaultMessage + "**")
    }
  }
  return t(id)

}

export function loadProtected() {
	const { isAuthed, isAuthLoading} = useContext(AuthContext) as AuthContextType
	if (!isAuthed && !isAuthLoading) return true
	else return false
}

export function isValidPassword(password) {
  const hasOneDigit = /\d/.test(password)
  const hasUpperAndLower = /(?=.*[a-z])(?=.*[A-Z])/.test(password)
  const hasEightChars = password.length >= 8
  const hasSpecialChar = /\W|_/.test(password)
  return hasOneDigit && hasUpperAndLower && hasEightChars && hasSpecialChar
}

export function isEmail(email) {
  //(no spaces)@(no spaces).(no spaces)(last character is not . or space)
  const email_regex = /^(\S+)@(\S+)[.](\S*)[^.\s]+$/g
  const isEmail = get(email.match(email_regex), '[0]')

  return isEmail
}

export async function executeCaptcha(captchaRef: RefObject<Reaptcha>, captchaReady = true) {
  if (!GOOGLE_CAPTCHA_ENABLED || !captchaRef.current || !captchaReady) {
    return
  }

  try {
    await captchaRef.current.renderExplicitly()
    await captchaRef.current.execute()
  } catch (e) {
    // Try again
    await captchaRef.current.execute()
  }
}

/**
 * Get the content of a dashboard card, taking into account the survey type and completion status
 */
export function getCardContent(name: keyof typeof DASHBOARD_CARD_CONTENT_MAPPING, isComplete: boolean): CardContentType {
  const content = merge(
    {},
    DASHBOARD_CARD_CONTENT_MAPPING[name],
    DASHBOARD_CARD_CONTENT_MAPPING[name][isComplete ? 'complete' : 'incomplete']
  )
  delete content.incomplete
  delete content.complete

  return content as CardContentType
}
