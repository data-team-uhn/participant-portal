import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react'

import map from 'lodash/map'
import moment from 'moment'
import { type MRT_ColumnDef } from 'material-react-table'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import FormattedMessage from 'PORTAL/components/formattedMessage'
import NewInvitationDialog from 'PORTAL/components/tables/invitations/newInvitationDialog'
import ViewInvitationDialog from 'PORTAL/components/tables/invitations/viewInvitationDialog'
import Table from 'PORTAL/components/tables/table'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import app from 'PORTAL/feathers-client'
import { InvitationType, DataSourceType } from 'PORTAL/declarations'
import { translateString } from 'PORTAL/utils'
import { RoleEnum } from 'PORTAL/constants'
import SuccessSnackbar from 'PORTAL/components/successSnackbar'

type InvitationsTableProps = {
  study_id?: string
}

type InvitationsColumn = {
  type: string,
  recipient: string,
  created_by: string,
  last_sent_by: string,
  last_sent_at: string,
  total_messages_sent: number,
  revoked_by: string,
  revoked_at: string,
  consumed_at: string,
  consumed_by: string,
  created_at: string,
  data_source: string
}

const InvitationsTable: React.FC<InvitationsTableProps> = (props: InvitationsTableProps) => {
  const { study_id } = props

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<InvitationsColumn[]>([])
  const [selectedRow, setSelectedRow] = useState<InvitationsColumn>(null)
  const [displayDialog, setDisplayDialog] = useState(false)
  const [newInvitationsDialogOpen, setNewInvitationsDialogOpen] = useState(false)
  const [dataSources, setDataSources] = useState<Array<DataSourceType>>(null)
  const [successSnackbarMessage, setSuccessSnackbarMessage] = useState('')

  const { user } = useContext(AuthContext) as AuthContextType
  const hasInvitationPermissions = user.role === RoleEnum.ADMIN || user.role === RoleEnum.COORDINATOR && user.coordinator.approved

  const loadDataset = useCallback(async () => {
    setIsLoading(true)

    try {
      const invitations = await app.service('coordinators-raw-query').find({ query: { service: 'invitations' }})
      const mappedInvitations: InvitationsColumn[] = map(invitations, invitation => {
        const message_count = !!invitation.sent_messages ? invitation.sent_messages.length : 0
        const last_message = !!invitation.sent_messages ? invitation.sent_messages[message_count - 1] : null
        return {
          ...invitation,
          last_sent_at: !!last_message ? moment(last_message.sent_at).format('YYYY-MM-DD HH:mm') : null,
          last_sent_by: !!last_message ? last_message.triggered_by : null,
          total_messages_sent: message_count,
          revoked_at: !!invitation.revoked_at ? moment(invitation.revoked_at).format('YYYY-MM-DD HH:mm') : null,
          consumed_at: !!invitation.consumed_at ? moment(invitation.consumed_at).format('YYYY-MM-DD HH:mm') : null,
          created_at: !!invitation.created_at ? moment(invitation.created_at).format('YYYY-MM-DD HH:mm') : null,
        }
      })
      setData(mappedInvitations)

      //load all the data sources here so the query is only done once
      //instead of each time a user opens the invitation dialog
      const dataSourceObject = await app.service('data-sources').find()
      setDataSources(dataSourceObject.data)
    }
    finally {
      setIsLoading(false)
    }
  }, [study_id])

  useEffect(() => {
    loadDataset()
  }, [study_id])

  const columnInfo = [
    {
      accessorKey: 'type',
      header: translateString('invitations.type', 'Type'),
      size: 150
    },
    {
      accessorKey: 'recipient',
      header: translateString('invitations.recipient', 'Recipient'),
      size: 150
    },
    {
      accessorKey: 'data_source',
      header: translateString('invitations.dataSource', 'Data Source'),
      size: 150
    },
    {
      accessorKey: 'created_by',
      header: translateString('invitations.createdBy', 'Created by'),
      size: 150
    },
    {
      accessorKey: 'last_sent_by',
      header: translateString('invitations.lastSentBy', 'Last Sent by'),
      size: 150
    },
    {
      accessorKey: 'last_sent_at',
      header: translateString('invitations.lastSentAt', 'Last Sent at'),
      size: 150
    },
    {
      accessorKey: 'total_messages_sent',
      header: translateString('invitations.totalMessages', 'Total Messages Sent'),
      size: 50
    },
    {
      accessorKey: 'revoked_by',
      header: translateString('invitations.revokedBy', 'Revoked by'),
      size: 150
    },
    {
      accessorKey: 'revoked_at',
      header: translateString('invitations.revokedAt', 'Revoked at'),
      size: 150
    },
    {
      accessorKey: 'consumed_by',
      header: translateString('invitations.consumedBy', 'Consumed by'),
      size: 150
    },
    {
      accessorKey: 'consumed_at',
      header: translateString('invitations.consumedAt', 'Consumed at'),
      size: 150
    },
    {
      accessorKey: 'created_at',
      header: translateString('invitations.createdAt', 'Created at'),
      size: 150
    }
  ]
  const columns = useMemo<MRT_ColumnDef<InvitationsColumn>[]>(
    () => columnInfo,
    [study_id] // Re-compute columns when study_id changes
  )

  const handleRowDoubleClick = (row: InvitationsColumn) => {
    setSelectedRow(row)
    setDisplayDialog(true)
  }

  const handleDisplayDialogClose = () => {
    setDisplayDialog(false)
    loadDataset()
  }

  const handleNewInvitationDialogClose = () => {
    setNewInvitationsDialogOpen(false)
    loadDataset()
  }

  if (!study_id) {
    return (
      <Typography>
        <FormattedMessage id='invitations.viewInvitations' defaultMessage='Select a study to view invitations' />
      </Typography>
    )
  }

  return (
    <>

      <SuccessSnackbar open={!!successSnackbarMessage} message={successSnackbarMessage} onClose={() => setSuccessSnackbarMessage('')} />
      <NewInvitationDialog
        open={newInvitationsDialogOpen}
        onClose={handleNewInvitationDialogClose}
        study_id={study_id}
        data_sources={dataSources}
      />
      <ViewInvitationDialog
        open={displayDialog}
        onClose={handleDisplayDialogClose}
        invitation={selectedRow as undefined as InvitationType}
        setSuccessSnackbarMessage={setSuccessSnackbarMessage}
      />
      <Button variant='contained' sx={{ right: 0, my: 3, float: 'right' }} onClick={() => setNewInvitationsDialogOpen(true)}>
        <FormattedMessage id='invitations.invite' defaultMessage='Invite' />
      </Button>
      <Table<InvitationsColumn>
        isLoading={isLoading}
        data={data}
        columns={columns}
        initialState={{
          columnVisibility: {
            sent_at: false,
            sent_by: false,
            consumed_at: false,
            consumed_by: false,
            revoked_at: false,
            revoked_by: false
          }
        }}
        csvFilename='Connect Invitations Table Export'
        onRowDoubleClick={handleRowDoubleClick}
      />
    </>
  )
}

export default InvitationsTable
