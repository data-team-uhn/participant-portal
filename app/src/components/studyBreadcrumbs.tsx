import React from 'react'
import { useNavigate } from 'react-router-dom'

import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import FormattedMessage from 'PORTAL/components/formattedMessage'

const StudyBreadcrumbs = (props: {studyTitle?: string}) => {

  const { studyTitle = null } = props

  const navigate = useNavigate()

  return(
    <Breadcrumbs aria-label="breadcrumb" sx={{py: 2}}>
      {studyTitle && <Link 
        underline="hover"
        color="inherit"
        aria-label='Link to list of studies'
        onClick={() => navigate('/studies')}
      >
        <FormattedMessage id='nav.studies' defaultMessage='Studies' />
      </Link>}
      <Typography sx={{textOverflow: 'ellipsis', maxWidth: '12rem', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 'bold'}}>
        {studyTitle ? studyTitle : <FormattedMessage id='nav.studies' defaultMessage='Studies' />}
      </Typography>
    </Breadcrumbs>
  )

}

export default StudyBreadcrumbs
