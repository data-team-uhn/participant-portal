import type { Paginated } from '@feathersjs/feathers'
import React, { useCallback, useEffect, useState } from 'react'

import Box from '@mui/material/Box'

import compact from 'lodash/compact'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'

import DashboardCard from 'PORTAL/components/dashboardCard'
import EmptyCard from 'PORTAL/components/basicComponents/emptyCard'
import PortalMain from 'PORTAL/components/basicComponents/portalMain'
import Progress from 'PORTAL/components/basicComponents/progress'
import SimpleHeader from 'PORTAL/components/basicComponents/simpleHeader'
import { FORM_TYPE_ENUM } from 'PORTAL/constants'
import type { ModulesType } from 'PORTAL/declarations'
import app from 'PORTAL/feathers-client'
import completedConsent from 'PORTAL/images/completed_consent.png'

interface GroupedModulesType {
  [p: string]: ModulesType[]
}

const Modules = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<GroupedModulesType>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const fetchedResponses = await app.service('module-responses').find({ query: { type: FORM_TYPE_ENUM.MODULE } }) as Paginated<ModulesType>
    const groupedResponses = groupBy(fetchedResponses.data, 'name')
    setResponses(groupedResponses)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const hasContent = !isLoading && !isEmpty(responses)

  return (
    <PortalMain bgcolor={hasContent ? 'common.inputBackground' : 'common.white'}>
      <SimpleHeader id='responses' titleId='modules.title' title='My Responses' />
      <Box component='section' aria-labelledby='responses' sx={{ maxWidth: '45rem', margin: 'auto' }}>
        {
          isLoading
            ? <Progress />
            : isEmpty(responses)
              ? <EmptyCard
                img={completedConsent}
                headerId='modules.emptyTitle'
                headerMessage='Review your responses'
                bodyId='modules.empty'
                bodyMessage='This is where you can review any responses you have completed.'
              />
              : compact(map(responses, (studyModules, name) => (
                <DashboardCard key={name} studyModules={studyModules} />
              )))
        }
      </Box>
    </PortalMain>
  )
}

export default Modules
