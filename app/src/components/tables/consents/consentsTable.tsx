import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'

import get from 'lodash/get'
import moment from 'moment'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import RowDetailDialog from 'PORTAL/components/tables/rowDetailDialog'
import Table from 'PORTAL/components/tables/table'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

type ConsentsTableProps = {
  study_id?: string
}

type ConsentsColumn = {
  first_name: string
  last_name: string
  email: string
  submitted_at: string,
  consent_form: any,
  version: number,
  title: string,
  consent_response: any
}

const ConsentsTable: React.FC<ConsentsTableProps> = (props: ConsentsTableProps) => {
  const { study_id } = props

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ConsentsColumn[]>([])
  const [selectedRow, setSelectedRow] = useState<ConsentsColumn>(null)
  const [displayDialog, setDisplayDialog] = useState(false)

  const loadDataset = useCallback(() => {
    setIsLoading(true)
    return app.service('raw-query').find({ query: { service: 'study-responses' } })
      .then((consents: ConsentsColumn[]) => {
        const formatResults = consents.map((data: ConsentsColumn) => {
          data.submitted_at = moment(data.submitted_at).format('YYYY-MM-DD HH:mm')
          data.consent_response.birthdate = moment(data.consent_response.birthdate).format('YYYY-MM-DD')
          return data
        })
        setData(formatResults)
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
      accessorKey: 'submitted_at',
      header: translateString('table.submittedAt', 'Submitted At'),
      size: 150
    },
    {
      accessorKey: 'form.version',
      header: translateString('table.version', 'Version'),
      size: 150
    },
    {
      accessorKey: 'form.title',
      header: translateString('study.title', 'Title'),
      size: 150
    },
    {
      accessorKey: 'consent_response.birthdate',
      header: translateString('register.dateOfBirth', 'Date of Birth'),
      size: 150
    },
    {
      accessorKey: 'consent_response.sex',
      header: translateString('user.participant.sex', 'Sex'),
      size: 150
    }
  ]

  const columns = useMemo<MRT_ColumnDef<ConsentsColumn>[]>(
    () => columnInfo,
    []
  )

  const handleRowDoubleClick = (row: ConsentsColumn) => {
    setSelectedRow(row)
    setDisplayDialog(true)
  }

  const handleDisplayDialogClose = () => {
    setDisplayDialog(false)
  }

  return (
    <>
      {/* TODO: amend the dialog content or add an action button to view full consent form */}
      <RowDetailDialog<ConsentsColumn>
        open={displayDialog}
        onClose={handleDisplayDialogClose}
        columns={columns}
        selectedRow={selectedRow}
        title={<FormattedMessage id='table.consent' defaultMessage='Consent' />}
      />
      <Table<ConsentsColumn>
        isLoading={isLoading}
        data={data}
        columns={columns}
        csvFilename='PCGL Consents Table Export'
        onRowDoubleClick={handleRowDoubleClick}
      />
    </>
  )
}

export default ConsentsTable
