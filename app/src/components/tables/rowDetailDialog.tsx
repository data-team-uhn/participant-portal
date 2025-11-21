import React, { type ReactNode } from 'react'
import { type MRT_ColumnDef, type MRT_RowData } from 'material-react-table'

import get from 'lodash/get'
import map from 'lodash/map'

import Dialog from 'PORTAL/components/basicComponents/dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

interface Props<T> {
  open: boolean
  onClose: () => void
  columns: MRT_ColumnDef<T>[]
  selectedRow: T | null
  title: ReactNode
  renderActions?: () => ReactNode
}

const RowDetailDialog = <T extends MRT_RowData>(props: Props<T>) => {
  const { open, onClose, columns, selectedRow, title, renderActions = null } = props

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle variant='h4' component='h2' sx={{ mb: 2 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pb: 5 }}>
        {
          map(columns, (key) => (
            <Typography key={key.header}>
              <strong>{key.header}:</strong> {get(selectedRow, key.accessorKey)}
            </Typography>
          ))
        }
      </DialogContent>
      {renderActions &&
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {renderActions()}
        </DialogActions>
      }
    </Dialog>
  )
}

export default RowDetailDialog
