import React, { useContext } from 'react'

import Box from '@mui/material/Box'

import Typography from 'PORTAL/components/basicComponents/typography'
import LanguageSelector from 'PORTAL/components/languageSelector'
import { RoleEnum } from 'PORTAL/constants'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'

const rightLinks = [
  {
    messageId: 'footer.terms',
    defaultMessage: 'Terms',
    href: '/terms'
  },
  {
    messageId: 'footer.privacy',
    defaultMessage: 'Privacy',
    href: '/privacy'
  }
]

interface Props {
  sx?: object
}

const Footer = ({ sx }: Props) => {
  const { user } = useContext(AuthContext) as AuthContextType

  return (
      <Box
        component='footer'
        sx={{
          width: '100%',
          py: 3,
          px: { xs: 3, md: 2 },
          ...sx
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            margin: 'auto',
            width: '100%',
            maxWidth: user && user.role === RoleEnum.PARTICIPANT ? '70rem' : '90rem'
          }}
        >
          {rightLinks.map((link) => (
            <Typography
              key={link.messageId}
              variant='footer'
              component="a"
              target='_blank'
              rel='noopener noreferrer'
              sx={{ color: 'black', opacity: 0.7 }}
              {...link}
            />
          ))}
          <LanguageSelector rootSx={{ ml: 'auto' }} />
        </Box>
      </Box>
  )
}

export default Footer
