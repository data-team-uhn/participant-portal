import React, { useContext, useMemo, memo, useState, useRef } from 'react'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance
} from 'material-react-table'
import { MRT_Localization_FR } from 'material-react-table/locales/fr'
import map from 'lodash/map'
import { download, generateCsv, mkConfig } from 'export-to-csv'

import Box from '@mui/material/Box'

import Button from 'PORTAL/components/basicComponents/button'
import ButtonWithMenu from 'PORTAL/components/basicComponents/buttonWithMenu'
import Typography from 'PORTAL/components/basicComponents/typography'
import { translateString } from 'PORTAL/utils'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'

interface Props<T> {
  isLoading: boolean,
  data: T[]
  columns: MRT_ColumnDef<T>[]
  enableRowSelection?: boolean
  initialState?: Record<string, any> // Includes compact density by default
  enableColumnResizing?: boolean
  enableSelectAll?: boolean
  csvFilename?: string
  onRowDoubleClick?: (row: T) => void
  renderAdditionalToolbarActions?: (table: any) => React.ReactNode
}

/**
 * A wrapper for Material React Table to help make table creation consistent
 */
const Table = <T extends Record<string, any>>({
  isLoading,
  data,
  columns,
  enableRowSelection = true,
  initialState = {},
  enableColumnResizing = false,
  enableSelectAll = false,
  csvFilename = 'PCGL Table Export',
  onRowDoubleClick,
  renderAdditionalToolbarActions
}: Props<T>) => {

  const { user } = useContext(AuthContext) as AuthContextType
  const [exportButtonMenuOpen, setExportButtonMenuOpen] = useState(false)
  const [exportButtonIndex, setExportButtonIndex] = useState(1)

  const anchorRef = useRef<HTMLDivElement>(null)

  // Memoize config to avoid recreating on each render given that it iterates through the columns
  const csvConfig = useMemo(() => mkConfig({
    filename: csvFilename,
    showTitle: false,
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: false,
    columnHeaders: map(columns, column => {
      return { key: column.accessorKey, displayLabel: column.header }
    })
  }), [columns, csvFilename])

  /**
   * Export all data if rows is null, otherwise export the provided rows
   * @param rows (optional)
   */
  const handleExportData = (rows?: MRT_Row<T>[]): void => {
    const rowData = rows ? rows.map((row) => row.original) : data
    const csv = generateCsv(csvConfig)(rowData)
    download(csvConfig)(csv)
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setExportButtonIndex(index);
    setExportButtonMenuOpen(false);
  }

  const handleToggle = () => {
    setExportButtonMenuOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setExportButtonMenuOpen(false);
  }

  const handleExport = () => {
    switch (exportButtonIndex) {
      case 0:
        handleExportData(table.getPrePaginationRowModel().rows)
      case 1:
        handleExportData(table.getSelectedRowModel().rows)
      case 2:
        handleExportData(table.getRowModel().rows)
    }
  }

  const options = [
    translateString('table.exportAll', 'Export All Data'),
    translateString('table.exportSelected', 'Export Selected Rows'),
    translateString('table.exportPage', 'Export This Page')
  ]

  /**
   * Render common and additional custom toolbar actions.
   */
  const renderToolbarActions = useMemo(() => ({ table }: { table: MRT_TableInstance<T> }) => (
    <Box sx={{ py: 1, px: 2, width: '57%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, overflow: 'visible' }}>
      <Typography
        messageId='table.selected'
        defaultMessage='{{selected}} of {{total}} selected'
        values={{ selected: table.getSelectedRowModel().rows.length, total: table.getRowCount() }}
      />
      <Button size='small' variant='outlinedGreyscale' onClick={() => table.resetRowSelection()} sx={{m: 0}}>
        <Typography messageId='table.clearSelection' defaultMessage='Clear Selection' variant='caption'/>
      </Button>
      <ButtonWithMenu
        anchorRef={anchorRef}
        handleButtonClick={handleExport}
        options={options}
        menuIndex={exportButtonIndex}
        handleToggle={handleToggle}
        menuOpen={exportButtonMenuOpen}
        handleClose={handleClose}
        handleMenuItemClick={handleMenuItemClick}
      />
      {renderAdditionalToolbarActions && renderAdditionalToolbarActions(table)}
    </Box>
  ), [handleExportData, renderAdditionalToolbarActions])

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection,
    initialState: { density: 'compact', ...initialState },
    state: {
      showLoadingOverlay: isLoading
    },
    enableColumnResizing,
    enableSelectAll,
    localization: user.locale === 'fr' ? MRT_Localization_FR : null,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        width: '100%',
        borderRadius: 2,
        my: 3,
        overflow: 'visible',
        clear: 'both'
      }
    },
    muiBottomToolbarProps: { sx: { overflow: 'visible' } },
    muiToolbarAlertBannerProps: { sx: { overflow: 'visible' } },
    positionToolbarAlertBanner: 'bottom',
    renderToolbarAlertBannerContent: renderToolbarActions,
    muiTableBodyCellProps: ({ cell }) => ({
      ...onRowDoubleClick && { onDoubleClick: () => onRowDoubleClick(cell.row.original) } || {},
      sx: {
        fontWeight: 400,
        fontSize: '0.875rem', // 14px
        lineHeight: 1.71,
        letterSpacing: '0.016rem' // 0.25px
      }
    })
  })

  return (
    <MaterialReactTable table={table} />
  )
}

export default memo(Table) as typeof Table
