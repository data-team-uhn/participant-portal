import React, { useState, useContext, useEffect } from 'react'

import filter from 'lodash/filter'
import moment from 'moment'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import Progress from 'PORTAL/components/basicComponents/progress'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import Header from 'PORTAL/components/header'
import NewStudyDialog from 'PORTAL/components/newStudyDialog'
import StudyCard from 'PORTAL/components/studyCard'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { StudyType } from 'PORTAL/declarations'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'
import { RoleEnum } from 'PORTAL/constants'

import type { Paginated } from '@feathersjs/feathers'

export default function Studies() {

  const [isLoading, setIsLoading] = useState(true)
  const [allStudies, setAllStudies] = useState([])
  const [visibleStudies, setVisibleStudies] = useState([])
  const [newStudyDialogOpen, setNewStudyDialogOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const { user } = useContext(AuthContext) as AuthContextType

  const SEARCH_STRING = translateString('nav.search', 'Search')

  const loadDataset = () => {
    setIsLoading(true)
    return app.service('studies').find({ query: { $sort: { updated_at: -1 } } })
      .then((studies: Paginated<StudyType>) => {
        setLastUpdated(moment(studies.data[0].updated_at).format('MMMM DD, YYYY'))
        setAllStudies(studies.data)
        setVisibleStudies(studies.data)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadDataset()
  }, [])

  const displayStudyCards = (): React.ReactElement[] => {
    return (visibleStudies.map((study, index) => (
      <StudyCard
        key={`card_${index}`}
        // TODO: separate participation status in the API
        studyData={{ ...study, status: index % 2 ? 'Eligible' : 'Enrolled' }}
      />
    )))
  }

  const filterStudies = () => {
    const newStudies = filter(allStudies, function(study) {
      const title = study.title
      return title.toLowerCase().includes(searchString.toLowerCase())
    })
    setVisibleStudies(newStudies)
  }

  useEffect(() => {
    filterStudies()
  }, [searchString])

  const renderHeader = () => (
    <Header pageTitle={<FormattedMessage id='study.allStudies' defaultMessage='All Studies' />}>
      {/*TODO: update this when the translation components are combined */}
      <Grid container spacing={2} direction={{ xs: 'column', md: 'row' }}>
        <Grid size={{ xs: 12, md: 'grow' }}>
          <Typography variant='caption'>{`Last Updated: ${lastUpdated}`}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 'auto' }}>
          {user.role === RoleEnum.ADMIN &&
            <Button
              variant='outlined'
              size='large'
              onClick={() => setNewStudyDialogOpen(true)}>
              <AddCircleIcon sx={{ mr: 1 }} />
              <Typography>
                <FormattedMessage id='study.createStudy' defaultMessage='Create Study' />
              </Typography>
            </Button>
          }
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            placeholder={SEARCH_STRING}
            value={searchString}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '2rem',
                height: '2.5rem'
              }
            }}
            slotProps={{
              select: {
                native: true
              },
              inputLabel: {
                shrink: true
              },
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }
            }}
            onChange={(e => {
              setSearchString(e.target.value)
            })}
          />
        </Grid>
      </Grid>


    </Header>
  )

  if (isLoading) {
    return <Progress />
  }

  return (
    <>
      <NewStudyDialog
        open={newStudyDialogOpen}
        refreshStudies={loadDataset}
        onClose={() => setNewStudyDialogOpen(false)}
      />
      {renderHeader()}
      <Box sx={{ py: 2, px: { xs: 1, md: 4 }, maxWidth: '1440px', margin: 'auto' }}>
        {displayStudyCards()}
      </Box>
    </>
  )
}
