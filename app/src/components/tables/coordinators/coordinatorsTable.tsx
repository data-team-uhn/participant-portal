import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type MRT_ColumnDef, type MRT_Row } from 'material-react-table'

import join from 'lodash/join'
import map from 'lodash/map'
import moment from 'moment'

import Button from '@mui/material/Button'
import ChecklistIcon from '@mui/icons-material/Checklist'
import Typography from '@mui/material/Typography'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import RowDetailDialog from 'PORTAL/components/tables/rowDetailDialog'
import Table from 'PORTAL/components/tables/table'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

type CoordinatorsTableProps = {
  study_id?: string
}

type CoordinatorsColumn = {
  first_name: string
  last_name: string
  email: string
  institution: string
  position: string
  approved: string
  registered: string
  name_prefix: string
  id: string
  external_study_id?: string
  data_sources: Array<string>
}

const CoordinatorsTable: React.FC<CoordinatorsTableProps> = (props: CoordinatorsTableProps) => {
  const { study_id = null } = props

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<CoordinatorsColumn[]>([])
  const [selectedRow, setSelectedRow] = useState<CoordinatorsColumn>(null)
  const [displayDialog, setDisplayDialog] = useState(false)

  const loadDataset = useCallback(() => {
    setIsLoading(true)

    const query = study_id ? 'study-coordinators' : 'coordinators'
    return app.service('raw-query').find({ query: { service: query, study_id } })
      .then((coordinators: CoordinatorsColumn[]) => {
        const formatResults = coordinators.map((data: CoordinatorsColumn) => {
          data.approved = data.approved ? 'Yes' : 'No'
          data.registered = data.registered && moment(data.registered).format('YYYY-MM-DD HH:mm')
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
      accessorKey: 'name_prefix',
      header: translateString('user.coordinator.prefix', 'Prefix'),
      size: 50
    },
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
    ...!study_id && [{
      accessorFn: (row) => join(row.external_study_id, ', '),
      header: translateString('study.externalStudyId', 'External Study Id'),
      size: 75
    }] || [],
    {
      accessorKey: 'institution',
      header: translateString('register.institution', 'Institution'),
      size: 100
    },
    {
      accessorKey: 'position',
      header: translateString('register.position', 'Position'),
      size: 150
    },
    {
      accessorKey: 'approved',
      header: translateString('user.coordinator.approved', 'Approved'),
      size: 50
    },
    {
      accessorKey: 'registered',
      header: translateString('user.registered', 'Registered'),
      size: 150
    },
    {
      accessorKey: 'data_sources',
      accessorFn: (row) => join(row.data_sources, ', '),
      header: translateString('invitations.dataSource', 'Data Source(s)'),
      size: 150
    }
  ]

  const columns = useMemo<MRT_ColumnDef<CoordinatorsColumn>[]>(
    () => columnInfo,
    [study_id]
  )

  const handleRowDoubleClick = (row: CoordinatorsColumn) => {
    setSelectedRow(row)
    setDisplayDialog(true)
  }

  const handleDisplayDialogClose = () => {
    setDisplayDialog(false)
  }

  const approveSelectedCoordinators = (rows: MRT_Row<CoordinatorsColumn>[]) => {
    const rowData = rows.map((row) => row.original)
    return Promise.all(map(rowData, row => sendCoordinatorApproval(row.id)))
  }

  const sendCoordinatorApproval = (id) => {
    return app.service('coordinators').patch(id, { approved: true })
      .then(() => {
        loadDataset()
        if (selectedRow) {
          setSelectedRow({ ...selectedRow, approved: 'Yes' })
        }
      })
  }

  const renderAdditionalToolbarActions = (table) => (
    <Button
      disabled={
        !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
      }
      onClick={() => approveSelectedCoordinators(table.getSelectedRowModel().rows)}
      startIcon={<ChecklistIcon />}
    >
      <FormattedMessage id='table.approveSelectedCoordinators' defaultMessage='Approve Selected Coordinators' />
    </Button>
  )

  const renderDialogActions = () => {
    return (
      <>
        <Button variant='outlined' onClick={handleDisplayDialogClose}>
          <Typography>
            <FormattedMessage id='actions.close' defaultMessage='Close' />
          </Typography>
        </Button>
        <Button
          variant='contained' onClick={() => sendCoordinatorApproval(selectedRow?.id)}
          disabled={selectedRow?.approved === 'Yes'}>
          <Typography>
            <FormattedMessage id='table.approveCoordinator' defaultMessage='Approve Coordinator' />
          </Typography>
        </Button>
      </>
    )
  }

  return (
    <>
      <RowDetailDialog<CoordinatorsColumn>
        open={displayDialog}
        onClose={handleDisplayDialogClose}
        columns={columns}
        selectedRow={selectedRow}
        renderActions={renderDialogActions}
        title={<FormattedMessage id='table.coordinator' defaultMessage='Coordinator' />}
      />
      <Table<CoordinatorsColumn>
        isLoading={isLoading}
        data={data}
        columns={columns}
        csvFilename='PCGL Coordinators Table Export'
        onRowDoubleClick={handleRowDoubleClick}
        renderAdditionalToolbarActions={renderAdditionalToolbarActions}
      />
    </>
  )
}

export default CoordinatorsTable
