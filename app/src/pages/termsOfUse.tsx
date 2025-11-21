import React from 'react'

import Typography from '@mui/material/Typography'

// TODO: Actually generate the Terms of Use content and include translations
const TermsOfUse: React.FC = () => (
  <>
    <Typography variant='h4' component='h1' sx={{ mb: 4 }}>
      PCGL Terms of Use [Placeholder]
    </Typography>
    <Typography sx={{ mb: 2 }}>
      <b>PLEASE READ ALL OF THESE TERMS AND CONDITIONS CAREFULLY.</b>
    </Typography>
    <Typography sx={{ mb: 2 }}>
      By using or accessing the PCGL Participant Portal, you agree to these Terms and Conditions (“Terms”). These Terms
      are a legal agreement between you and the PanCanadian Genome LIbrary (PCGL). By accepting the Terms, you
      consent to the
      collection, use, and disclosure of your responses to help your healthcare team in providing your care. You also
      accept and agree to be bound and comply with these Terms and our privacy policy.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      1. Acceptance of Terms
    </Typography>
    <Typography sx={{ mb: 2 }}>
      By using this site, you agree to comply with and be legally bound by the terms and conditions of these Terms of
      Service.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      2. Use of Service
    </Typography>
    <Typography sx={{ mb: 2 }}>
      You agree to use the service only for lawful purposes and in accordance with these terms.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      3. Changes to Terms
    </Typography>
    <Typography sx={{ mb: 2 }}>
      We reserve the right to modify these terms at any time. Changes will be effective upon posting.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      4. Contact Us
    </Typography>
    <Typography sx={{ mb: 2 }}>
      If you have any questions about these Terms, please contact us.
    </Typography>
  </>
)

export default TermsOfUse
