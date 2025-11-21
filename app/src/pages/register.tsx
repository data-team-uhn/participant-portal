import React, { useState, useReducer } from 'react'
import { useSearchParams, useNavigate, Navigate, NavLink } from 'react-router-dom'

import Box from '@mui/material/Box'

import Button from 'PORTAL/components/basicComponents/button'
import Progress from 'PORTAL/components/basicComponents/progress'
import Typography from 'PORTAL/components/basicComponents/typography'
import RegistrationForm, { type RegistrationData } from 'PORTAL/components/registration/registrationForm'
import TermsSummary from 'PORTAL/components/registration/termsSummary'
import VerificationSent from 'PORTAL/components/registration/verificationSent'
import WelcomeMessage from 'PORTAL/components/registration/welcomeMessage'

import { useAdminControls } from 'PORTAL/contexts/useAdminControls'
import { useInviteValidator } from 'PORTAL/contexts/useInviteValidator'

const FORM_ID = 'registration-form'

const Register = () => {
  const { fetchingToken, tokenIsValid } = useInviteValidator()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoginRestricted } = useAdminControls()

  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)
  const [page, setPage] = useState(0)
  const [data, updateData] = useReducer((prevState: RegistrationData, data: Partial<RegistrationData>) => {
    return { ...prevState, ...data }
  }, { email: '', password: '', confirmPassword: '' })

  const incrementPage = () => setPage(prevState => prevState + 1)
  const decrementPage = () => setPage(prevState => prevState - 1)

  const buttonConfig = {
    0: {
      left: {
        labelId: 'actions.back',
        defaultLabel: 'Back',
        onClick: () => navigate({ pathname: '/login', search: searchParams.toString() })
      },
      right: {
        labelId: 'actions.next',
        defaultLabel: 'Next',
        type: 'button',
        onClick: incrementPage,
        form: undefined,
        disabled: isLoginRestricted
      }
    },
    1: {
      left: {
        labelId: 'actions.back',
        defaultLabel: 'Back',
        onClick: decrementPage
      },
      right: {
        labelId: 'actions.accept',
        defaultLabel: 'Accept',
        type: 'button',
        onClick: incrementPage,
        form: undefined,
        disabled: isLoginRestricted
      }
    },
    2: {
      left: { labelId: 'actions.back', defaultLabel: 'Back', onClick: decrementPage },
      right: {
        labelId: 'actions.create',
        defaultLabel: 'Create',
        type: 'submit',
        form: FORM_ID,
        disabled: isSubmitButtonDisabled
      }
    }
  }

  if (fetchingToken) {
    return <Progress />
  }

  if (!tokenIsValid) {
    return <Navigate to='/' replace />
  }

  return (
    <>
      {page === 0 && <WelcomeMessage/>}
      {page === 1 && <TermsSummary />}
      {page === 2 &&
        <RegistrationForm
          data={data}
          updateData={updateData}
          formId={FORM_ID}
          setIsSubmitButtonDisabled={setIsSubmitButtonDisabled}
          onSubmit={incrementPage}
        />
      }
      {page === 3 && <VerificationSent data={data} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: { xs: 'auto', md: 0 } }}>
        {page < 3 &&
          <>
            <Button
              sx={{ my: 4 }}
              key={`left-${page}`}
              variant='outlinedGreyscale'
              size='large'
              {...buttonConfig[page].left}
            />
            <Button
              sx={{ my: 4 }}
              key={`right-${page}`}
              variant='contained'
              size='large'
              {...buttonConfig[page].right}
            />
          </>
        }
        {page === 3 &&
          <Button
            labelId='actions.returnToLogin'
            defaultLabel='Return to login'
            variant='outlinedGreyscale'
            size='large'
            onClick={() => navigate({ pathname: '/login', search: searchParams.toString() })}
            sx={{ m: 'auto' }}
          />
        }
      </Box>
      {page === 2 &&
        <Box sx={{ textAlign: 'center', mt: 1, mb: 3 }}>
          <Typography
            messageId='register.existingAccount'
            defaultMessage='Have an account?'
            sx={{ display: 'inline', fontWeight: 700 }}
          />
          <Typography
            messageId='register.backToLogin'
            defaultMessage='Return to log in'
            component={NavLink}
            sx={{ display: 'inline', ml: 1, color: 'secondary.main', fontWeight: 700 }}
            to={{ pathname: '/login', search: searchParams.toString() }}
          />
        </Box>
      }
    </>
  )
}

export default Register
