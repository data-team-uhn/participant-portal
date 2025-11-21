import React, { useState, useContext, useEffect } from 'react'
import { map } from 'lodash'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'

import Progress from 'PORTAL/components/basicComponents/progress'
import EditableStudyLink from 'PORTAL/components/editableStudyLink'
import Header from 'PORTAL/components/header'
import NoStudyFound from 'PORTAL/components/noStudyFound'
import ConsentsTable from 'PORTAL/components/tables/consents/consentsTable'
import InvitationsTable from 'PORTAL/components/tables/invitations/invitationsTable'
import ParticipantsTable from 'PORTAL/components/tables/participants/participantsTable'
import CoordinatorsTable from 'PORTAL/components/tables/coordinators/coordinatorsTable'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import { StudyType } from 'PORTAL/declarations'
import { RoleEnum } from 'PORTAL/constants'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'


const ManageStudy = (props: { study_id: string }) => {

  const { study_id } = props

  const { user } = useContext(AuthContext) as AuthContextType

  const [selectedTab, setSelectedTab] = useState('about')
  const [study, setStudy] = useState<StudyType>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studyLink, setStudyLink] = useState('')
  const [studyLinkError, setStudyLinkError] = useState('')

  const loadStudy = async() => {
    setIsLoading(true)
    try {
      const studyResult = await app.service('studies').get(study_id) as StudyType
      setStudy(studyResult)
      const urlEncodedStudyLabel = encodeURIComponent(studyResult.linkId)
      setStudyLink(urlEncodedStudyLabel)
    } catch (error) {
      //we want to supress this error to display the 'no study found' page instead of an error
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadStudy()
  }, [])

  const genericTabs = [
    { value: 'about', label: translateString('study.about', 'About') },
    { value: 'participants', label: translateString('nav.participants', 'Participants') },
    { value: 'consents', label: translateString('study.consents', 'Consents')},
    { value: 'invitations', label: translateString('nav.invitations', 'Invitations') }
  ]

  const tabs = user.role === RoleEnum.ADMIN ? 
    [...genericTabs, { value: 'coordinators', label: translateString('nav.coordinators', 'Coordinators') }] : 
    [...genericTabs]

  const studyIdLabel = translateString('table.studyId', 'Study ID')
  const emptyStudyLink = translateString('study.errors.linkError', 'Please enter a valid study link.')
  const duplicateStudyLink = translateString('study.errors.duplicateLinkError', 'This study link is already in use. Please choose a different one.')
  const genericStudyLinkError = translateString('study.errors.genericError', 'There was an error saving the study link. Please try again later.')

  const handleTabChange = (event: React.SyntheticEvent, role: string) => {
    setSelectedTab(role)
  }

  const renderTables = (tab : string) => {
    switch (tab) {
      case 'invitations':
        return (<InvitationsTable study_id={study_id}/>)
      case 'participants':
        return (<ParticipantsTable study_id={study_id}/>)
      case 'coordinators':
        return (<CoordinatorsTable study_id={study_id}/>)
      case 'consents':
        return (<ConsentsTable study_id={study_id}/>)
      case 'about':
        return (<Typography>{study.description}</Typography>)
      default:
        return (<p>placeholder</p>)
    }
  }

  const renderStudyInfo = () => (
    <Box
      component='section'
      sx={{
        mx: 'auto',
        p: { xs: 1, md: 2 },
        maxWidth: {
          xs: '100%', md: '90rem'
        }
      }}>
      <Box
        sx={{
          m: { xs: 0, md: 2 },
          px: { xs: 2, md: 4 },
          py: 4,
          borderRadius: 4,
          backgroundColor: 'white'
        }}
      >
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleTabChange}
              aria-label='tab options to select a category to view'
            >
              {
                map(tabs, (tab, index) => (
                  <Tab label={tab.label} key={`${tab.label}-tab-${index}`} value={tab.value}/>
                ))
              }
            </TabList>
          </Box>
          {
            map(tabs, (tab, index) => (
              <TabPanel key={`${tab.value}-tab-panel-${index}`} value={tab.value}>
                {renderTables(tab.value)}
              </TabPanel>
            ))
          }
        </TabContext>
      </Box>
    </Box>
  )

  const handleLinkSave = async() => {
    setStudyLinkError('')
    const trimmedLink = studyLink.trim()
    const encodedLinkId = encodeURIComponent(trimmedLink)

    if (!trimmedLink) {
      setStudyLinkError(emptyStudyLink)
      throw new Error(emptyStudyLink)
    }

    return await app.service('studies').patch(study.id, { linkId: trimmedLink })
      .then(() => {
        setStudy(prevState => ({ ...prevState, linkId: trimmedLink }))
        // update link to the encoded value after save so that it can be correctly copied
        setStudyLink(encodedLinkId)
      })
      .catch((error) => {
        if (error.message === 'Validation error') {
          setStudyLinkError(duplicateStudyLink)
        } else {
          setStudyLinkError(genericStudyLinkError)
        }
        // Propagate the error to the child component
        throw error
      })
  }

  if (isLoading) {
    return <Progress />
  }

  if (!study) {
    return <NoStudyFound />
  }

  return (
    <>
      <Header breadcrumbsTitle={study.title} pageTitle={study.title}>
        <Typography component='h2' sx={{ color: 'secondary.main', mt: 1 }}>
          {`${studyIdLabel}: ${study.external_study_id}`}
        </Typography>
        <EditableStudyLink
          link={studyLink}
          onEdit={(linkId: string) => setStudyLink(linkId)}
          onSubmit={handleLinkSave}
          error={studyLinkError}
        />
      </Header>
      {renderStudyInfo()}
    </>
 )
}

export default ManageStudy
