import get from 'lodash/get'
import React, { createContext, useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import app from 'PORTAL/feathers-client'
import { supportedLanguages } from 'PORTAL/translations/supported-languages'

import type { UserType } from 'PORTAL/declarations'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
AuthContext.displayName = 'AuthContext' // Show context name in React Dev Tools

export type authData = { strategy: string, email: string, password: string, studyLinkId: string }

export type AuthContextType = {
  isAuthed: boolean,
  isAuthLoading: boolean,
  authenticate: (options: authData) => Promise<void>,
  user: UserType,
  logout: () => void,
  verifySignup: ({ token }: { token: any; }) => any,
  sendResetPassword: (email: string, captcha_response?: any) => any,
  resetPassword: (token: string, password: string) => any,
  timedOut: boolean,
  setTimedOut: (v: boolean) => void
  reloadUser: () => Promise<void>
  resendVerifySignup: ({ email }: { email: any; }) => any
  registryConsentPopupOpen: boolean
  setRegistryConsentPopupOpen: (newValue: boolean) => void
}

const AuthContextProvider = ({ children }) => {
  const [isAuthed, _setIsAuthed] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [timedOut, setTimedOut] = useState(false)
  const [registryConsentPopupOpen, setRegistryConsentPopupOpen] = useState(false)

  const { i18n } = useTranslation()

  const supportedLanguageCodes : string[]= supportedLanguages.map(language => language.code)

  const isAuthedRef = useRef(isAuthed)
  const setIsAuthed = (isAuthed : boolean) => {
    if (isAuthed !== isAuthedRef.current) {
      isAuthedRef.current= isAuthed
      _setIsAuthed(isAuthed)
    }
  }

  const authenticate = (options : authData) => {
    return app
      .authenticate(options)
      .then((auth : any) => loadUserData(auth.user))
      .catch((error : Error) => {
        setIsAuthed(false)

        // Propagate error forward so we can handle it in the login component
        throw error
      })
  }

  const setAuthState = (authed : boolean) => {
    setIsAuthed(authed)
    setIsAuthLoading(false)
    setIsLoginLoading(false)
  }

  const logout = ( ) => {
    app.logout().then(() => {
      setIsAuthed(false)
      setUser(null)
    })
  }

  const loadUserData = (user: UserType) => {
    setUser(user)
    setAuthState(true)
    if (supportedLanguageCodes.includes(user.locale)) return i18n.changeLanguage(user.locale)
  }

  const login = () => {
    Promise.all([
      app.authentication.getAccessToken(),
      app.authentication.getFromLocation(window.location)
    ])
      .then(([storageToken, windowToken]) => {
        if (storageToken) {
          return app.authentication.setAccessToken(storageToken)
        }
      })
      .then(() => app.reAuthenticate())
      .then((auth) => {
        loadUserData(auth.user)
      })
      .catch(() => {
        setAuthState(false)
      })
  }

  useEffect(() => {
    if (!isAuthed  && !isLoginLoading) {
      setIsLoginLoading(true)
       login()
     }
   }, [isAuthed])

  const verifySignup = ({ token }) => {
    return app.service('authManagement').create({
      action: 'verifySignupLong',
      value: token,
      notifierOptions: { skipEmail: true } // Skip sending email on successful verification
    })
  }

  const resendVerifySignup = ({ email }) => {
    return app.service('authManagement').create({
      action: 'resendVerifySignup',
      value: { email }
    })
  }

  const reloadUser = async() => {
    if (!user) return

    try {
      const userResponse = await app.service('users').get(user.id)
      const updatedUser = get(userResponse, 'data[0]', userResponse)

      if (!updatedUser) return

      setUser(updatedUser)
    } catch (e) {
      // fail silently and continue to use the existing user data
      return
    }
  }

  const sendResetPassword = (email: string, captcha_response?: string) => {
    return app.service('authManagement').create({
      action: 'sendResetPwd',
      value: { email },
      captcha_response
    })
  }

  const resetPassword = (token: string, password: string) => {
    return app.service('authManagement').create({
      action: 'resetPwdLong',
      value: {
        token,
        password
      }
    })
  }

  const defaultContext : AuthContextType = {
    isAuthed,
    isAuthLoading,
    authenticate,
    user,
    logout,
    verifySignup,
    timedOut,
    setTimedOut,
    sendResetPassword,
    resetPassword,
    reloadUser,
    resendVerifySignup,
    registryConsentPopupOpen,
    setRegistryConsentPopupOpen
  }

  return (
    <AuthContext.Provider value={defaultContext}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
