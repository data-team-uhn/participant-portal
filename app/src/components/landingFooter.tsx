import React from 'react'
import { NavLink } from 'react-router-dom'
import moment from 'moment'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'

import cheo_logo from 'PORTAL/images/cheo_logo.png'
import cihr_logo from 'PORTAL/images/cihr_logo.png'
import data_logo from 'PORTAL/images/data_logo.png'
import innovation_logo from 'PORTAL/images/innovation_logo.png'
import uhn_logo from 'PORTAL/images/uhn_new_logo.png'
import sinai_logo from 'PORTAL/images/sinai_logo.png'

import Typography from 'PORTAL/components/basicComponents/typography'
import Logo from 'PORTAL/components/logo'
import { isMobile } from 'PORTAL/utils'
import map from 'lodash/map'

const LandingFooter = () => {
  const isOnMobile = isMobile()

  const partners = [
    {
      alt: 'Children\'s Hospital of Eastern Ontario Logo',
      logo: cheo_logo,
      href: 'https://www.cheo.on.ca/en/index.aspx'
    },
    {
      alt: 'Sinai Health Logo',
      logo: sinai_logo,
      href: 'https://www.sinaihealth.ca/'
    },
    {
      alt: 'University Health Network Logo',
      logo: uhn_logo,
      href: 'https://www.uhn.ca/'
    },
    {
      alt: 'Data Team Logo',
      logo: data_logo,
      href: 'https://uhndata.io/'
    }
  ]

  const funders = [
    {
      alt: 'Canadian Institutes of Health Research Logo',
      logo: cihr_logo,
      href: 'https://cihr-irsc.gc.ca/e/193.html'
    },
    {
      alt: 'Canada Foundation for Innovation Logo',
      logo: innovation_logo,
      href: 'https://www.innovation.ca/'
    }
  ]

  const links = [
    {
      titleId: 'footer.partners',
      titleDefault: 'Partners:',
      items: partners
    },
    {
      titleId: 'footer.funders',
      titleDefault: 'Funders:',
      items: funders
    }
  ]

  return (
    <Box
      component='footer'
      sx={{ bgcolor: 'common.grey' }}
    >
      <Box
        sx={{
          maxWidth: '90rem',
          minWidth: '20rem',
          margin: 'auto',
          px: { xs: 5, md: 6 },
          pt: { xs: 3, md: 6 }
        }}
      >
        {/* This is a placeholder until we get the actual logo */}
        <Logo color='black' size={isOnMobile ? 'small' : 'large'} sx={{ mb: { xs: 0, md: 4 } }} />
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 2, md: 4 },
            my: { xs: 2, md: 1.5 }
          }}
        >
          <Typography
            variant='landingLink'
            component={NavLink}
            to={'/terms'}
            messageId='terms.title'
            target='_blank'
            rel='noopener noreferrer'
            defaultMessage='Terms of Use'
            color='black'
            sx={{ p: { xs: 0, mr: 1 } }}
          />
          <Typography
            variant='landingLink'
            sx={{ p: { xs: 0, mr: 1 } }}
            component={NavLink}
            to={'/privacy'}
            color='black'
            messageId='privacy.title'
            target='_blank'
            rel='noopener noreferrer'
            defaultMessage='Privacy Policy'
          />
          {/* TODO: add language selector here once multiple languages are supported*/}
        </Box>
        <Divider aria-hidden='true' />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row-reverse',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            gap: 6,
            width: '100%',
            pt: { xs: 5, md: 6 },
            pb: 6
          }}
        >
          <Box>
            {map(links, (link, index) => (
              <Box
                key={link.titleId}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'flex-start',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  mb: { xs: index < links.length - 1 ? 4 : 0, md: index < links.length - 1 ? 2 : 0 }
                }}
              >
                <Typography
                  id={`${link.titleId}-header`}
                  variant='button'
                  messageId={link.titleId}
                  defaultMessage={link.titleDefault}
                  sx={{ textTransform: 'uppercase', mr: 4, mb: { xs: 2, md: 0 }, width: { xs: '100%', md: 'unset' } }}
                />
                <List
                  disablePadding
                  aria-labelledby={`${link.titleId}-header`}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 2,
                    pl: 2
                  }}
                >
                  {map(link.items, ({ alt, href, logo }) => (
                    <ListItem disablePadding sx={{ width: 'unset' }} key={alt}>
                      <ListItemButton
                        component='a'
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        disableGutters
                        sx={{ '&:hover': { backgroundColor: 'transparent' } }}
                      >
                        <Box
                          component='img'
                          src={logo}
                          sx={{ height: '1.375rem', filter: 'grayscale(100%)' }}
                          alt={alt}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
          <Typography
            variant='landingCopyright'
            messageId='footer.message'
            defaultMessage='© {year} PCGL Data Access Compliance Office. All rights reserved.'
            values={{ year: moment().year() }}
            sx={{ mr: 'auto' }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default LandingFooter
