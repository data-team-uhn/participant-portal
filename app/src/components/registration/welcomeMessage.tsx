import React from 'react'
import { useSearchParams } from 'react-router-dom'

import Link from '@mui/material/Link'

import Typography from 'PORTAL/components/basicComponents/typography'

/**
 * Temporary translation-less text for now while we wait for the actual test
 */

const WelcomeMessage = () => {

  const [searchParams] = useSearchParams()

  return (
    <>
      <Typography
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      >
        Welcome to Connect!
      </Typography>
      <Typography
        sx={{ mb: 2, lineHeight: '150%' }}
      >
        Here is where we can add some text with instructions on account creation, or perhaps
        just how to get support with the account creation process. We could link the Connect
        email for example!
      </Typography>
      <Typography
        sx={{ mb: 3, textAlign: 'left', width: '100%' }}
      >
        {`To learn more about Connect, `}
        <Typography
          component={Link}
          href={`/?${searchParams.toString()}#about`}
          target='_blank'
          rel='noopener noreferrer'
          sx={{ fontWeight: '700' }}
        >
          click here.
        </Typography>
      </Typography>
    </>
  )
}

export default WelcomeMessage
