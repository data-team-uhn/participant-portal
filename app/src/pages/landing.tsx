import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import Progress from 'PORTAL/components/basicComponents/progress'
import ContactDialog from 'PORTAL/components/contactDialog'
import LandingNav from 'PORTAL/components/landingNav'
import LandingFooter from 'PORTAL/components/landingFooter'
import SuccessSnackbar from 'PORTAL/components/successSnackbar'
import { NAV_MIN_HEIGHT } from 'PORTAL/constants/index'
import { useInviteValidator } from 'PORTAL/contexts/useInviteValidator'

import dna_image from 'PORTAL/images/dna_image.png'
import typing_hands from 'PORTAL/images/typing_hands.jpg'


export default function Landing() {
  const { fetchingToken, tokenIsValid } = useInviteValidator()
  const navigate = useNavigate()

  const [showContactDialog, setShowContactDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const invitationParams = window.location.search

  if (fetchingToken) {
    return <Progress />
  }

  return (
    <>
      <LandingNav />
      <SuccessSnackbar open={!!successMessage} message={successMessage} onClose={() => setSuccessMessage('')} />
      <ContactDialog open={showContactDialog} onClose={() => setShowContactDialog(false)} setSuccessMessage={setSuccessMessage} />
      <Box
        sx={{
          backgroundColor: 'primary.main',
          minHeight: 'fit-content',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${dna_image})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            opacity: 0.12,
            zIndex: 0
          }
        }}
        component='section'
        aria-labelledby='hero'
      >
        <Box
          sx={{
            margin: 'auto',
            px: { xs: 3, md: 8 },
            pt: { xs: `calc(${NAV_MIN_HEIGHT}px + 2.5rem)`, md: 25 },
            pb: { xs: 10, md: 29 },
            maxWidth: '70rem',
            minWidth: '20rem',
            position: 'relative',
            zIndex: 1
          }}
        >
          {
            tokenIsValid
              ? <Typography
                variant='h1'
                id='hero'
                color='white'
                sx={{ mb: { xs: 5, md: 6 } }}
                messageId='landing.joinConnect'
                defaultMessage='Join the Connect Registry'
              />
              : <Typography
                variant='h1'
                id='hero'
                color='white'
                sx={{ mb: { xs: 5, md: 6 } }}
                messageId='landing.welcomeToConnect'
                defaultMessage='Welcome to the Connect Registry'
              />
          }
          <Typography
            color='white'
            sx={{ mb: { xs: 10, md: 6 }, maxWidth: '40rem' }}
            variant='largeBody'
            messageId='landing.connectDescription'
          >
            Connect is a <strong>national registry</strong> for people who have had genetic testing to
            support and engage with health research.
          </Typography>
          {
            tokenIsValid &&
            <Button
              labelId='landing.joinNow'
              defaultLabel='Join now'
              variant='contained'
              color='secondary'
              sx={{ mr: 2 }}
              onClick={() => navigate(`/register${invitationParams}`)}
            />
          }
          <Button
            labelId='login.logIn'
            defaultLabel='Log in'
            variant='outlined'
            color='secondary'
            onClick={() => navigate(`/login${invitationParams}`)}
          />
        </Box>
      </Box>
      <Box id='about' component='section' aria-labelledby='about-heading' sx={{ backgroundColor: 'white', minHeight: 'fit-content' }}>
        <Box sx={{ margin: 'auto', px: { xs: 3, md: 8 }, pt: 10, pb: 6, maxWidth: '70rem', minWidth: '20rem' }}>
          <Typography // this seems like a one-off style so not using a default typography variant
            component='h2'
            variant='colourHeading'
            id='about-heading'
            sx={{
              mb: { xs: 5, md: 4 },
              textAlign: 'center'
            }}
            messageId='landing.about'
            defaultMessage='About'
          />
          <Typography
            variant='h1'
            component='h3'
            sx={{ mb: { xs: 5, md: 6 }, textAlign: 'center' }}
            messageId='landing.theRegistry'
            defaultMessage='The Registry & Connect'
          />
          <Typography // this seems like a one-off style so not using a default typography variant
            variant='largeCallout'
            sx={{
              mb: 5,
              textAlign: 'center'
            }}
            messageId='landing.haveYou'
            defaultMessage='Have you had genetic testing, either through clinical care or a research study?'
          />
          {
            tokenIsValid
              ? <Typography
                variant='largeBody'
                messageId='landing.ifSoWithToken'
                sx={{ mb: 5 }}
              >
                If so, you are invited to join <strong>Connect — a national contact registry</strong> and <strong>participant
                portal</strong> that helps families like yours engage with health research.
              </Typography>
              : <Typography
                variant='largeBody'
                messageId='landing.ifSoWithoutToken'
                sx={{ mb: 5 }}
              >
                If so, you may be eligible to join <strong>Connect — a national contact registry</strong> and <strong>participant
                portal</strong> that helps families like yours engage with health research.
              </Typography>
          }
          <Box sx={{ columnGap: { xs: 0, md: 5 }, columnCount: { xs: 1, md: 2 } }}>
            <Typography
              sx={{ mb: 5 }}
              variant='largeBody'
              messageId='landing.whenYou'
              defaultMessage='When you sign up, you’ll have the option to contribute your (or your child’s) genomic and health data to a secure, trusted repository. This information can then be shared — carefully and responsibly — with approved researchers who are working to improve care and accelerate precision medicine.'
            />
            <Typography
              sx={{ mb: 5 }}
              variant='largeBody'
              messageId='landing.inControl'
              defaultMessage='You’re always in control. Through the Connect portal, you decide whether you want to hear about new research opportunities, like natural history studies, gene discovery projects, or clinical trials. You can also choose to get updates about research that’s being made possible by Connect participants.'
            />
          </Box>
          <Typography
            variant='largeCallout'
            sx={{
              fontWeight: 400,
              color: '#323A45', // not sure if this is a new theme colour
              letterSpacing: '0',
              textAlign: 'center'
            }}
            messageId='landing.helpShape'
            defaultMessage='Help shape the future of healthcare — on your terms.'
          />
        </Box>
      </Box>
      <Divider
        aria-hidden='true'
        sx={{
          maxWidth: '70rem', minWidth: '20rem', color: '#004254', opacity: '50%', borderWidth: '1px', margin: 'auto'
        }}
      />
      <Box
        id='contact'
        component='section'
        aria-labelledby='contact-us'
        sx={{
          margin: 'auto',
          minWidth: '18.75rem',
          background: 'linear-gradient(white 50%, rgb(246, 246, 246) 50%)'
        }}>
        <Box
          sx={{
            maxWidth: '70rem',
            minWidth: '20rem',
            margin: 'auto',
            px: { xs: 3, md: 8 },
            pt: { xs: 6, md: 10 },
            pb: { xs: 5, md: 12 }
          }}
        >
          <Box
            sx={{
              boxShadow: '2px 10px 28px #979797',
              borderRadius: '0.625rem',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              backgroundColor: 'white'
            }}>
            <Box sx={{ minWidth: { xs: '100%', md: '50%' }, padding: 5, margin: 'auto' }}>
              <Typography
                component='h2'
                variant='h1'
                id='contact-us'
                sx={{ mb: 3 }}
                messageId='landing.contactUs'
                defaultMessage='Contact Us'
              />
              {
                tokenIsValid
                  ? <Typography
                    sx={{ mb: { xs: 6, md: 8 } }}
                    variant='largeBody'
                    messageId='landing.haveQuestion'
                    defaultMessage='Have a question about the Connect Registry? Contact our team to learn more about getting started.'
                  />
                  : <Typography
                    sx={{ mb: { xs: 6, md: 8 } }}
                    variant='largeBody'
                    messageId='landing.interestedInJoining'
                    defaultMessage='Interested in joining the Connect Registry? Contact our team to learn more about getting started.'
                  />
              }
              <Button
                variant='contained'
                onClick={() => setShowContactDialog(true)}
                labelId='landing.contact'
                defaultLabel='Contact'
              />
            </Box>
            <Box
              component="img"
              src={typing_hands}
              //this image is purely decorative, so having empty alt text will have a screen reader skip over it
              alt=""
              sx={{
                borderRadius: '0rem 0.625rem 0.625rem 0rem',
                maxWidth: '50%',
                display: { xs: 'none', md: 'block' }
              }}
            />
          </Box>
        </Box>
      </Box>
      <LandingFooter />
    </>
  )
}
