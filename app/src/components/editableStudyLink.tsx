import React, { useRef } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'

import { translateString } from 'PORTAL/utils'

const APP_BASE_URL = process.env.APP_BASE_URL
const JOIN_ROUTE = '/join'
const URL_BASE = `${APP_BASE_URL}${JOIN_ROUTE}/`


interface Props {
  link: string
  onEdit: (link: string) => void
  onSubmit: () => Promise<any>
  error?: string
}

function EditableStudyLink({ link, onEdit, onSubmit, error }: Props) {
  const [isEditing, setIsEditing] = React.useState(false)
  const initialLink = useRef({ link })

  const cancel = translateString('actions.cancel', 'Cancel')
  const save = translateString('actions.save', 'Save')
  const edit = translateString('actions.editLink', 'Edit link')
  const copy = translateString('actions.copy', 'Copy to clipboard')

  const handleCancel = () => {
    // Reset the link to the initial value and exit editing mode
    onEdit(initialLink.current.link)
    setIsEditing(false)
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Only submit save is the link has changed
    if (link !== initialLink.current.link) {
      onSubmit()
        .then(() => {
          // On successful submission, update the initial link reference
          initialLink.current.link = link
          setIsEditing(false)
        })
        .catch(() => {
          // Keep editor in edit mode. Parent will handle error message state
        })
    }
  }

  return (
    <Paper
      elevation={0}
      component='form'
      noValidate
      onSubmit={handleSave}
      sx={{
        my: 2,
        py: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        width: '600px'
      }}
    >

      {/* To see a tooltip on a disabled button, it needs to be wrapped in span */}
      {/* https://mui.com/material-ui/react-tooltip/#disabled-elements */}
      <Tooltip title={copy}>
        <span>
          <IconButton
            disabled={isEditing}
            sx={{ p: '10px' }}
            aria-label={isEditing ? 'copy link disabled while editing' : 'copy link'}
            onClick={() => {
              navigator.clipboard.writeText(`${URL_BASE}${link}`)
            }}
          >
            <ContentCopyIcon />
          </IconButton>
        </span>
      </Tooltip>

      <InputBase
        id='study-link-id'
        disabled={!isEditing}
        value={link}
        onChange={(e) => onEdit(e.target.value)}
        inputProps={{
          maxLength: 20,
          'aria-label': isEditing ? 'study link can be copied' : 'study link can be edited'
        }}
        startAdornment={
          <InputAdornment position='start' sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {URL_BASE}
          </InputAdornment>
        }
      />

      <Tooltip title={edit}>
        <span>
          <IconButton
            disabled={isEditing}
            sx={{ p: '10px' }}
            aria-label={isEditing ? 'edit button disabled when editing' : 'edit button'}
            onClick={() => setIsEditing(prevState => !prevState)}
          >
            <EditIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />

      <Tooltip title={save}>
        <span>
          <IconButton
            type='submit'
            disabled={!isEditing}
            sx={{ p: '10px' }}
            aria-label={isEditing ? 'save button' : 'save button disabled when editing'}
          >
            <SaveIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={cancel}>
        <span>
          <IconButton
            disabled={!isEditing}
            sx={{ p: '10px' }}
            aria-label={isEditing ? 'cancel button' : 'cancel button disabled when editing'}
            onClick={handleCancel}
          >
            <CloseIcon />
          </IconButton>
        </span>
      </Tooltip>

      <FormHelperText error={!!error}>
        {error || ' '}
      </FormHelperText>

    </Paper>
  )
}

export default EditableStudyLink
