import React from 'react'

import Typography from '@mui/material/Typography'

// TODO: Actually generate the Privacy content and include translations
const PrivacyPolicy: React.FC = () => (
  <>
    <Typography variant='h4' component='h1' sx={{ mb: 4 }}>
      PCGL Privacy Policy [Placeholder]
    </Typography>
    <Typography sx={{ mb: 2 }}>
      <b>Your privacy is important to us.</b>
    </Typography>
    <Typography sx={{ mb: 2 }}>
      This Privacy Policy explains how the PanCanadian Genome Library (PCGL) collects, uses, discloses, and protects
      your personal information when you use the PCGL Participant Portal.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      1. Information We Collect
    </Typography>
    <Typography sx={{ mb: 2 }}>
      We may collect personal information such as your name, contact details, responses to surveys, and other
      information you provide through the portal.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      2. How We Use Your Information
    </Typography>
    <Typography sx={{ mb: 2 }}>
      Your information is used to support your healthcare, improve our services, and for research purposes, in
      accordance with applicable laws and regulations.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      3. Information Sharing
    </Typography>
    <Typography sx={{ mb: 2 }}>
      We do not sell your personal information. We may share your information with your healthcare team and authorized
      researchers, as required to provide services or as required by law.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      4. Data Security
    </Typography>
    <Typography sx={{ mb: 2 }}>
      We implement appropriate security measures to protect your personal information from unauthorized access,
      disclosure, or misuse.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      5. Your Rights
    </Typography>
    <Typography sx={{ mb: 2 }}>
      You have the right to access, correct, or request deletion of your personal information. Please contact us if you
      wish to exercise these rights.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      6. Changes to This Policy
    </Typography>
    <Typography sx={{ mb: 2 }}>
      We may update this Privacy Policy from time to time. Changes will be posted on this page and are effective upon
      posting.
    </Typography>
    <Typography variant='h6' component='h2' sx={{ lineHeight: 2, mb: 2 }}>
      7. Contact Us
    </Typography>
    <Typography sx={{ mb: 2 }}>
      If you have any questions about this Privacy Policy or how your information is handled, please contact us.
    </Typography>
  </>
)

export default PrivacyPolicy
