import React, { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Reaptcha from 'reaptcha'

import { GOOGLE_CAPTCHA_ENABLED, REAPTCHA_PROPS, RoleEnum } from 'PORTAL/constants'
import app from 'PORTAL/feathers-client'
import { executeCaptcha } from 'PORTAL/utils'

interface Props {
  children: React.ReactNode
}

interface InviteValidatorContext {
  fetchingToken: boolean
  inviteToken: string | null
  inviteRole: 'participant' | 'coordinator' | null
  inviteRecipient: string | null
  tokenIsValid: boolean
}

const defaultContext = {
  fetchingToken: false,
  inviteToken: null,
  inviteRole: null,
  inviteRecipient: null,
  tokenIsValid: false
}

const InviteValidatorContext: React.Context<InviteValidatorContext> = createContext(defaultContext)

function InviteValidatorProvider({ children }: Props) {
  const captchaRef = useRef(null)

  const [searchParams] = useSearchParams()
  const inviteRole = searchParams.get('type')
  const inviteToken = searchParams.get('token')
  const inviteRecipient = searchParams.get('email')

  const [captchaReady, setCaptchaReady] = useState(false)
  const [loading, setIsLoading] = useState<boolean>(GOOGLE_CAPTCHA_ENABLED && !!inviteToken && !!inviteRole && !!inviteRecipient)
  const [tokenIsValid, setTokenIsValid] = useState(false)

  const handleCaptcha = async () => {
    try {
      await executeCaptcha(captchaRef)
    } catch (error) {
      setTokenIsValid(false)
      setIsLoading(false)
    }
  }

  const onCaptchaLoad = () => {
    setCaptchaReady(true)
  }

  const validateToken = useCallback(
    async (captcha_response: string) => {
      setIsLoading(true)

      if (!captcha_response && captchaRef.current) {
        captchaRef.current.reset()
      }

      try {
        if (!inviteToken || !inviteRole || (inviteRole !== RoleEnum.PARTICIPANT && inviteRole !== RoleEnum.COORDINATOR)) {
          setTokenIsValid(false)
          return
        }

        const { is_valid } = await app.service('invitation-validator').create({
          token: inviteToken,
          type: inviteRole,
          recipient: inviteRecipient,
          captcha_response
        })
        setTokenIsValid(is_valid)
      } catch (error) {
        setTokenIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }, [inviteRole, inviteToken]
  )

  useEffect(() => {
    if (!captchaReady) return

    handleCaptcha()
  }, [captchaReady])

  const value = {
    fetchingToken: loading,
    inviteRole: inviteRole as 'participant' | 'coordinator' | null,
    inviteToken,
    inviteRecipient,
    tokenIsValid
  }

  return (
    <InviteValidatorContext.Provider value={value}>
      {
        GOOGLE_CAPTCHA_ENABLED && inviteToken && inviteRole && inviteRecipient && (
          <Reaptcha
            ref={captchaRef}
            onVerify={(captcha_response: string) => validateToken(captcha_response)}
            onLoad={onCaptchaLoad}
            {...REAPTCHA_PROPS}
          />
        )
      }
      {children}
    </InviteValidatorContext.Provider>
  )
}

/**
 * Custom hook to use the SurveyContext.
 */
function useInviteValidator() {
  const context = React.useContext(InviteValidatorContext)
  if (context === undefined) {
    throw new Error('useInviteValidator must be used within a InviteValidatorProvider')
  }
  return context
}

export { InviteValidatorProvider, useInviteValidator }
