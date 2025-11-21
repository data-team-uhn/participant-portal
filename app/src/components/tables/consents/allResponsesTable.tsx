import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'

import get from 'lodash/get'
import moment from 'moment'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import RowDetailDialog from 'PORTAL/components/tables/rowDetailDialog'
import Table from 'PORTAL/components/tables/table'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

type ResponsesColumn = {
  first_name: string
  last_name: string
  email: string
  birthdate: string,
  data_source: string,
  consent_submitted_at: string,
  consent_data_sharing: boolean,
  consent_version: number,
  communication_submitted_at: string,
  communication_version: number,
  preferred_contact: string,
  contact_future_studies: string,
  sex: string
}

const AllResponsesTable: React.FC = () => {

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ResponsesColumn[]>([])
  const [selectedRow, setSelectedRow] = useState<ResponsesColumn>(null)
  const [displayDialog, setDisplayDialog] = useState(false)

  const loadDataset = useCallback(() => {
    setIsLoading(true)
    return app.service('coordinators-raw-query').find({ query: { service: 'all-responses' } })
      .then((consents) => {
        const formatResults = consents.map((data: any) => {
          data.consent_submitted_at = !!data.consent_submitted_at ? moment(data.consent_submitted_at).format('YYYY-MM-DD HH:mm') : null
          data.birthdate = !!data.consent_response ? moment(data.consent_response.birthdate).format('YYYY-MM-DD') : null
          data.consent_data_sharing = data.consent_response ? (get(data, 'consent_response.data-sharing') ? 'Yes' : 'No') : null
          data.communication_submitted_at = !!data.communication_submitted_at ? moment(data.communication_submitted_at).format('YYYY-MM-DD HH:mm') : null
          data.preferred_contact = get(data, 'communication_response.preferred-contact')
          data.contact_future_studies= get(data, 'communication_response.contacted-future-studies')
          data.sex = get(data, 'consent_response.sex')
          return data
        })
        setData(formatResults)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    loadDataset()
  }, [])

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
      accessorKey: 'data_source',
      header: translateString('invitations.dataSource', 'Data Source'),
      size: 150
    },
    {
      accessorKey: 'consent_submitted_at',
      header: translateString('table.consentSubmittedAt', 'Consent Submitted At'),
      size: 180
    },
    {
      accessorKey: 'consent_version',
      header: translateString('table.consentVersion', 'Consent Version'),
      size: 150
    },
    {
      accessorKey: 'communication_submitted_at',
      header: translateString('table.communicationSubmittedAt', 'Communication Submitted At'),
      size: 190
    },
    {
      accessorKey: 'communication_version',
      header: translateString('table.communicationVersion', 'Communication Version'),
      size: 170
    },
    {
      accessorKey: 'birthdate',
      header: translateString('register.dateOfBirth', 'Date of Birth'),
      size: 150
    },
    {
      accessorKey: 'sex',
      header: translateString('user.participant.sex', 'Sex'),
      size: 120
    },
    {
      accessorKey: 'consent_data_sharing',
      header: "Data Sharing", //keeping this untranslated for now because it's mostly a placeholder
      size: 150
    },
    {
      accessorKey: 'preferred_contact',
      header: "Preferred Contact Method", //keeping this untranslated for now because it's mostly a placeholder
      size: 180
    },
    {
      accessorKey: 'contact_future_studies',
      header: "Contact for Future Studies", //keeping this untranslated for now because it's mostly a placeholder
      size: 180
    }
  ]

  const columns = useMemo<MRT_ColumnDef<ResponsesColumn>[]>(
    () => columnInfo,
    []
  )

  const handleRowDoubleClick = (row: ResponsesColumn) => {
    setSelectedRow(row)
    setDisplayDialog(true)
  }

  const handleDisplayDialogClose = () => {
    setDisplayDialog(false)
  }

  return (
    <>
      <RowDetailDialog<ResponsesColumn>
        open={displayDialog}
        onClose={handleDisplayDialogClose}
        columns={columns}
        selectedRow={selectedRow}
        title={<FormattedMessage id='table.consent' defaultMessage='Consent' />}
      />
      <Table<ResponsesColumn>
        isLoading={isLoading}
        data={data}
        columns={columns}
        csvFilename='Connect Responses Table Export'
        onRowDoubleClick={handleRowDoubleClick}
        initialState={{ 
          columnVisibility: {
            consent_version: false,
            communication_version: false,
            communication_submitted_at: false,
            preferred_contact: false
          }
        }}
      />
    </>
  )
}

export default AllResponsesTable
