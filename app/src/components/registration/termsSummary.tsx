import React from 'react'

import Link from '@mui/material/Link'

import Typography from 'PORTAL/components/basicComponents/typography'

const TermsSummary = () => {
  return (
    <>
      <Typography
        messageId='register.termsSummary'
        defaultMessage='Terms of Use Summary'
        component='h1'
        variant='h5'
        sx={{ mb: 3 }}
      />
      <Typography
        messageId='register.termsPlaceholder1'
        defaultMessage='You agree to use PATH to help you report and track your cancer symptoms and provide you with education.'
        sx={{ mb: 2, lineHeight: '150%' }}
      />
      <Typography
        messageId='register.termsPlaceholder2'
        defaultMessage='UHN is not responsible for any consequences related to the misuse of this application. Information that you put in this application will be sent to UHN, and non-identifiable information will be sent to third-party analytics software such as Google Analytics. If you have questions or concerns please contact us using the information in the full Terms and Conditions.'
        sx={{ mb: 2, lineHeight: '150%' }}
      />
      <Typography
        messageId='register.termsSummaryLinks'
        defaultMessage='Read the full <1>Terms of Use</1> and <3>Privacy Policy</3>'
        sx={{ mb: 3, textAlign: 'left', width: '100%' }}
      >
        Read the full
        <Typography
          component={Link}
          href='/terms'
          target='_blank'
          rel='noopener noreferrer'
          messageId='register.termsLink'
          defaultMessage='Terms of Use'
          sx={{ fontWeight: '700' }}
        />
        and
        <Typography
          component={Link}
          href='/privacy'
          target='_blank'
          rel='noopener noreferrer'
          messageId='register.privacyLink'
          defaultMessage='Privacy Policy'
          sx={{ fontWeight: '700' }}
        />
      </Typography>
    </>
  )
}

export default TermsSummary
