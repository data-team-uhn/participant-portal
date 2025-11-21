import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'

import compact from 'lodash/compact'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import join from 'lodash/join'
import map from 'lodash/map'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import RowDetailDialog from 'PORTAL/components/tables/rowDetailDialog'
import Table from 'PORTAL/components/tables/table'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

import type { StudyParticipantType } from 'PORTAL/declarations'
import moment from 'moment'


type ParticipantsTableProps = {
  study_id?: string
}

type ParticipantsColumn = {
  first_name: string
  last_name: string
  email: string
  registered: string,
  birthdate: string,
  data_source: string,
  contact_permission_confirmed: string
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = (props: ParticipantsTableProps) => {
  const { study_id = undefined } = props

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ParticipantsColumn[]>([])
  const [selectedRow, setSelectedRow] = useState<ParticipantsColumn>(null)
  const [displayDialog, setDisplayDialog] = useState(false)

  const loadDataset = useCallback(() => {
    setIsLoading(true)
    return app.service('raw-query').find({ query: { service: 'participants' } })
      .then((participants) => {
        setData(map(participants, participant => {
          return {
            ...participant,
            registered: participant.registered && moment(participant.registered).format('YYYY-MM-DD HH:mm'),
            birthdate: participant.birthdate && moment(participant.birthdate).format('YYYY-MM-DD HH:mm'),
            contact_permission_confirmed: participant.contact_permission_confirmed && moment(participant.contact_permission_confirmed).format('YYYY-MM-DD HH:mm')
          }
        }))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [study_id])

  useEffect(() => {
    loadDataset()
  }, [study_id])

  const columnInfo = [
    {
      accessorKey: 'first_name',
      header: translateString('user.firstName', 'First Name'),
      size: 150
    },
    {
      accessorKey: 'last_name',
      header: translateString('user.lastName', 'Last Name'),
      size: 150
    },
    {
      accessorKey: 'email',
      header: translateString('login.email', 'Email'),
      size: 150
    },
    {
      accessorKey: 'birthdate',
      header: translateString('register.dateOfBirth', 'Date of Birth'),
      size: 150
    },
    {
      accessorKey: 'data_source',
      header: translateString('invitations.dataSource', 'Data Source'),
      size: 150
    },
    /* comment this out for now, until we connect with PCGL and get external IDs
    ...!study_id && [{
      accessorKey: 'participant.external_participant_id',
      header: translateString('study.externalStudyId', 'External Study Id'),
      size: 75
    }] || [],
    {
      accessorKey: 'external_id',
      header: translateString('user.participant.externalParticipantId', 'External Participant ID'),
      size: 150
    },*/
    {
      accessorKey: 'registered',
      header: translateString('user.registered', 'Registered'),
      size: 150
    },
    {
      accessorKey: 'contact_permission_confirmed',
      header: translateString('user.participant.contactPermissionConfirmed', 'Contact Permission Confirmed'),
      size: 150
    }
  ]

  const columns = useMemo<MRT_ColumnDef<ParticipantsColumn>[]>(
    () => columnInfo,
    [study_id]
  )

  const handleRowDoubleClick = (row: ParticipantsColumn) => {
    setSelectedRow(row)
    setDisplayDialog(true)
  }

  const handleDisplayDialogClose = () => {
    setDisplayDialog(false)
  }

  return (
    <>
      <RowDetailDialog<ParticipantsColumn>
        open={displayDialog}
        onClose={handleDisplayDialogClose}
        columns={columns}
        selectedRow={selectedRow}
        title={<FormattedMessage id='table.participant' defaultMessage='Participant' />}
      />
      <Table<ParticipantsColumn>
        isLoading={isLoading}
        data={data}
        columns={columns}
        initialState={{
          columnVisibility: {
            consumed_at: false,
            consumed_by: false,
            revoked_at: false,
            revoked_by: false
          }
        }}
        csvFilename='PCGL Participants Table Export'
        onRowDoubleClick={handleRowDoubleClick}
      />
    </>
  )
}

export default ParticipantsTable
