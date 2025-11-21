import React, { PropsWithChildren } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import StudyBreadcrumbs from 'PORTAL/components/studyBreadcrumbs'

type HeaderProps = {
  breadcrumbsTitle?: string
  pageTitle: string | React.JSX.Element
}

export default function Header(props : PropsWithChildren<HeaderProps>) {

  const { breadcrumbsTitle, children, pageTitle } = props

  return (
    <Box sx={{backgroundColor: 'white',  p: 4, display: 'flow-root'}}>
      <Box sx={{maxWidth: '90rem', margin: 'auto'}}>
        <StudyBreadcrumbs studyTitle={breadcrumbsTitle}/>
        <Typography  variant='h4' component='h1'>
          {pageTitle}
        </Typography>
        {children}
      </Box>
    </Box>
  )
}