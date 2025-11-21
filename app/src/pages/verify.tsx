import React, { useState, useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Navigate } from 'react-router-dom'

import Progress from 'PORTAL/components/basicComponents/progress'
import VerificationFailed from 'PORTAL/components/verification/verificationFailed'
import VerificationSuccess from 'PORTAL/components/verification/verificationSuccess'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'

const Verify = () => {
  const [verified, setVerified] = useState(false)
  const [expired, setExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [verificationAttempted, setVerificationAttempted] = useState(false)

  const [params] = useSearchParams()

  const { verifySignup } = useContext(AuthContext) as AuthContextType
  const token = params.get('token')

  useEffect(() => {
    async function verifyUser() {
      if (!token) {
        setIsLoading(false)
        setVerificationAttempted(true)
        return
      }

      try {
        const result = await verifySignup({ token })

        if (result && result.status === 200) {
          setVerified(true)
        }
      } catch (err) {
        if (err.message === 'Verification token has expired.') {
          setExpired(true)
        }
        setVerified(false)
      } finally {
        setIsLoading(false)
        setVerificationAttempted(true)
      }
    }

    verifyUser()

  }, [params])

  if (isLoading || !verificationAttempted) {
    return <Progress />
  }

  if (verified) {
    return <VerificationSuccess />
  }

  if (expired) {
    return <VerificationFailed />
  }

  return <Navigate to='/login' replace />
}

export default Verify
