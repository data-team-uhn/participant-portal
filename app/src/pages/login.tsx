import React, { useContext, useState } from 'react'
import {
  useSearchParams,
  NavLink,
  useNavigate,
  useParams,
  Link as RouterLink
} from 'react-router-dom'

import Box from '@mui/material/Box'

import isEmpty from 'lodash/isEmpty'

import Button from 'PORTAL/components/basicComponents/button'
import Progress from 'PORTAL/components/basicComponents/progress'
import TextField from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import Warning from 'PORTAL/components/basicComponents/warning'
import PasswordField from 'PORTAL/components/formFields/passwordField'
import { AuthContext, AuthContextType, authData } from 'PORTAL/contexts/auth'
import { useAdminControls } from 'PORTAL/contexts/useAdminControls'
import { useInviteValidator } from 'PORTAL/contexts/useInviteValidator'
import { translateString } from 'PORTAL/utils'
import VerificationSent from 'PORTAL/components/registration/verificationSent'

interface FormErrors {
  email?: string
  password?: string
  verification?: string
}

export default function Login() {
  const { fetchingToken, tokenIsValid } = useInviteValidator()
  const [page, setPage] = useState(0)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [formErrors, setFormErrors] = useState<FormErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

  const { authenticate, setTimedOut, setRegistryConsentPopupOpen } = useContext(AuthContext) as AuthContextType
  const { isLoginRestricted } = useAdminControls()

  const navigate = useNavigate()
  const { studyLinkId = null } = useParams()
  const [searchParams] = useSearchParams()

  const EMPTY_FIELD_ERROR = translateString('common.errors.emptyField', 'Don\'t forget to fill this out')
  const INVALID_CREDENTIALS = translateString('login.errors.credentials', 'Invalid login credentials. Please try again.')

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const errors: FormErrors = {}

    if (!email) {
      errors.email = EMPTY_FIELD_ERROR
    }

    if (!password) {
      errors.password = EMPTY_FIELD_ERROR
    }

    if (!isEmpty(errors)) {
      setFormErrors(errors)
      setIsSubmitting(false)
      return
    } else {
      setFormErrors({})
    }

    const options : authData = { strategy: 'local', email, password, studyLinkId }
		return authenticate(options)
			.then(() => {
        setRegistryConsentPopupOpen(true)
        navigate('/home')
      })
			.catch((e: any) => {
        if (e.code === 401) {
          setFormErrors({ password: INVALID_CREDENTIALS })
        }
        if (e.message === 'User is not verified') {
          setPage(1)
        }
        if (e.message === 'operation has timed out') {
          setTimedOut(true)
        }
			})
      .finally(() => {setIsSubmitting(false)})
	}

  if (fetchingToken) {
    return <Progress />
  }

  // Valid auth, but user is unverified
  if (page === 1) {
    return <>
      <VerificationSent data={{ email, password }} />
      <Button
        labelId='actions.returnToLogin'
        defaultLabel='Return to login'
        variant='outlined'
        size='large'
        onClick={() => setPage(0)}
        sx={{ width: '80%', m: 'auto' }}
      />
    </>
  }

  return (
    <>
      {
        isLoginRestricted &&
        <Warning
          messageId='login.loginDisabled'
          defaultMessage='Login has been disabled. The site is currently undergoing maintenance.'
          sx={{ mb: 3 }}
        />
      }
      <Box
        component='form'
        onSubmit={handleLogin}
        noValidate
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        <Typography
          id='login-form'
          messageId='login.title'
          defaultMessage='Log In'
          component='h1'
          variant='h5'
          sx={{ mb: 4, fontWeight: 700, textAlign: 'left', width: '100%' }}
        />
        <TextField
          required
          id='email'
          labelId='login.email'
          defaultLabel='Email'
          variant='outlined'
          fullWidth
          value={email}
          autoComplete='username'
          onChange={e => setEmail(e.target.value)}
          error={!!formErrors.email}
          helperText={formErrors.email || ' '}
        />

        <PasswordField
          required
          fullWidth
          id='password'
          labelId='login.password'
          defaultLabel='Password'
          autoComplete='current-password'
          error={!!formErrors.password}
          helperText={formErrors.password || ' '}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <Typography
          variant='body2'
          component={RouterLink}
          to='/forgot-password'
          messageId='login.forgotPassword'
          defaultMessage='Forgot password?'
          sx={{ textAlign: 'left', mb: 8.5, color: 'primary.main', fontWeight: 700 }}
        />
        <Button
          labelId='login.logIn'
          defaultLabel='Log In'
          disabled={isSubmitting || isLoginRestricted}
          variant='contained'
          size='large'
          type='submit'
          sx={{ mt: { xs: 'auto', md: 0 } }}
        />
        {
          tokenIsValid && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant='body2'
                messageId='login.noAccount'
                defaultMessage={`New to Connect?`}
                sx={{ display: 'inline', fontWeight: 700 }}
              />
              <Typography
                variant='body2'
                messageId='login.createAccount'
                defaultMessage='Create an account'
                component={NavLink}
                sx={{ display: 'inline', ml: 1, color: 'primary.main', fontWeight: 700 }}
                to={{ pathname: '/register', search: searchParams.toString() }}
              />
            </Box>
          )
        }
      </Box>
    </>
  )
}
