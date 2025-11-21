import React, { useState, useReducer } from 'react'

import { keys, each, map, isEmpty } from 'lodash'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import Dialog from 'PORTAL/components/basicComponents/dialog'
import FormError from 'PORTAL/components/formError'
import FormattedMessage from 'PORTAL/components/formattedMessage'
import app from 'PORTAL/feathers-client'
import { translateString } from 'PORTAL/utils'

type NewStudyDialogProps = {
  open: boolean
  onClose: () => void
  refreshStudies: () => void
}

const NewStudyDialog: React.FC<NewStudyDialogProps> = ( props: NewStudyDialogProps ) => {

  interface fieldErrors {
    title?: string,
    external_study_id?: string,
    description?: string,
    stage?: string,
    type?: string,
    phase?: string,
    error?: string
  }

  const initialData = {
    title: '',
    external_study_id: '',
    description: '',
    stage: '',
    type: '',
    phase: ''
  }

  const { open, onClose, refreshStudies } = props

  const [data, updateData] = useReducer((prevState, data) => {
    return {...prevState, ...data}
  }, initialData)
  const [fieldErrorsMapping, setFieldErrorsMapping] = useState<fieldErrors>({})
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)

  const EMPTY_FIELD_ERROR = translateString('common.errors.emptyField', 'Don\'t forget to fill this out')
  const GENERIC_ERROR = translateString('study.error', 'An error occurred creating the study.')

  const createStudy = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors: any = {}
    setIsSubmitButtonDisabled(true)

    const fields = keys(initialData)

    each(fields, (fieldName: string) => {

      if (!data[fieldName]) {
        errors[fieldName] = EMPTY_FIELD_ERROR
      }
    })

    if (!isEmpty(errors)) {
      setFieldErrorsMapping(errors)
      setIsSubmitButtonDisabled(false)
      return
    }

    return app.service('studies').create({
      ...data,
      linkId: data.external_study_id
    })
    .then(() => {
      setFieldErrorsMapping({})
      updateData(initialData)
      setIsSubmitButtonDisabled(false)
      refreshStudies()
      onClose()
    })
    .catch((e: Error) => {
      errors.error = GENERIC_ERROR
      setFieldErrorsMapping(errors)
      setIsSubmitButtonDisabled(false)
    })
  }

  const stages = [
    'recruiting',
    'active',
    'invitation',
    'withdrawn',
    'completed',
    'hold'
  ]

  const types = [
    'interventional',
    'observational',
    'expanded',
  ]

  const phases = [
    {value: '0', string: translateString('study.tags.phase.zero', "Zero")},
    {value: '1', string: 'I'},
    {value: '2', string: 'II'},
    {value: '3', string: 'III'},
    {value: '4', string: 'IV'},
    {value: 'n/a', string: translateString('study.tags.phase.notApplicable', 'N/A')}
  ]

  const handleDialogClose = () => {
    setFieldErrorsMapping({})
    updateData(initialData)
    onClose()
  }

  return(
    <Dialog
      open={open}
      onClose={handleDialogClose}
      slotProps={{
        paper: {
          noValidate: true,
          component: 'form',
          // @ts-ignore
          onSubmit: createStudy
        }
      }}
    >
      <DialogTitle variant='h4' component='h2'>
        <FormattedMessage id='study.createStudy' defaultMessage='Create Study'/>
      </DialogTitle>
      <DialogContent>

        <FormLabel htmlFor='title'>
            <FormattedMessage id='study.title' defaultMessage='Title' />
          </FormLabel>
          <TextField
            required
            fullWidth
            id='title'
            name='title'
            error={!!fieldErrorsMapping.title}
            helperText={fieldErrorsMapping.title || ' '}
            value={data.title}
            onChange={(e => {
              updateData({ title: e.target.value })
              setFieldErrorsMapping(prev => ({ ...prev, title: '' }))
            })}
          />

          <FormLabel htmlFor='externalStudyId'>
            <FormattedMessage id='study.externalStudyId' defaultMessage='External Study ID' />
          </FormLabel>
          <TextField
            required
            fullWidth
            id='externalStudyId'
            name={translateString('study.externalStudyId', 'External Study ID')}
            error={!!fieldErrorsMapping.external_study_id}
            helperText={fieldErrorsMapping.external_study_id || ' '}
            value={data.external_study_id}
            onChange={(e => {
              updateData({ external_study_id: e.target.value })
              setFieldErrorsMapping(prev => ({ ...prev, external_study_id: '' }))
            })}
          />

          <FormLabel htmlFor='description'>
            <FormattedMessage id='study.description' defaultMessage='Description' />
          </FormLabel>
          <TextField
            required
            fullWidth
            id='description'
            name={translateString('study.description', 'Description')}
            error={!!fieldErrorsMapping.description}
            helperText={fieldErrorsMapping.description || ' '}
            value={data.description}
            onChange={(e => {
              updateData({ description: e.target.value })
              setFieldErrorsMapping(prev => ({ ...prev, description: '' }))
            })}
          />

          <FormLabel htmlFor='stage' id='stage-label'>
            <FormattedMessage id='study.stage' defaultMessage='Stage' />
          </FormLabel>
          <Select
            id="stage"
            labelId="stage-label"
            value={data.stage}
            label={translateString('study.stage', 'Stage')}
            onChange={(e => {
              updateData({ stage: e.target.value })
              setFieldErrorsMapping(prev => ({ ...prev, stage: '' }))
            })}
            fullWidth
            error={!!fieldErrorsMapping.stage}
          >
            {
              map(stages, (stage, index) => (
                <MenuItem value={stage} key={`stage-item-${index}`}>
                  <FormattedMessage id={`study.tags.recruitment.${stage}`} defaultMessage={stage}/>
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText sx={{ ml: 2 }} aria-hidden={!fieldErrorsMapping.stage} error margin='dense' >{fieldErrorsMapping.stage ? fieldErrorsMapping.stage : ' '}</FormHelperText>

          <FormLabel htmlFor='type' id='type-label'>
            <FormattedMessage id='study.type' defaultMessage='Type' />
          </FormLabel>
          <Select
            required
            labelId='type-label'
            id="type"
            value={data.type}
            label={translateString('study.type', 'Type')}
            onChange={(e => {
              updateData({ type: e.target.value })
              setFieldErrorsMapping(prev => ({ ...prev, type: '' }))
            })}
            fullWidth
            error={!!fieldErrorsMapping.type}
          >
            {
              map(types, (type, index) => (
                <MenuItem value={type} key={`type-item-${index}`}>
                  <FormattedMessage id={`study.tags.type.${type}`} defaultMessage={type}/>
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText sx={{ ml: 2 }} aria-hidden={!fieldErrorsMapping.type} error margin='dense'>{fieldErrorsMapping.type ? fieldErrorsMapping.type : ' '}</FormHelperText>

          <FormLabel htmlFor='phase' id='phase-label'>
            <FormattedMessage id='study.phase' defaultMessage='Phase' />
          </FormLabel>
          <Select
            required
            labelId='phase-label'
            fullWidth
            id='phase'
            error={!!fieldErrorsMapping.phase}
            value={data.phase}
            onChange={(e => {
              updateData({ phase: e.target.value })
              setFieldErrorsMapping(prev => ({ ...prev, phase: '' }))
            })}
            aria-errormessage="phaseError"
          >
            {
              map(phases, (type, index) => (
                <MenuItem value={type.value} key={`type-item-${index}`}>
                  {type.string}
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText aria-hidden={!fieldErrorsMapping.phase} id="phaseError" sx={{ ml: 2 }} error margin='dense'>{fieldErrorsMapping.phase ? fieldErrorsMapping.phase : ' '}</FormHelperText>

        <FormError id='new-invitation-error' error={fieldErrorsMapping.error} onClose={() => { setFieldErrorsMapping({ error: '' })}} />
      </DialogContent>
      <DialogActions>
          <Button
            variant='outlined'
            size='large'
            sx={{ display: 'block', my: 2, mx: 'auto', width: '80%' }}
            onClick={handleDialogClose}
          >
            <FormattedMessage id='actions.close' defaultMessage='Close' />
          </Button>
          <Button
            disabled={isSubmitButtonDisabled}
            variant='contained'
            size='large'
            type='submit'
            sx={{ display: 'block', my: 2, mx: 'auto', width: '80%' }}
          >
            <FormattedMessage id='study.createStudy' defaultMessage='Create Study' />
          </Button>
      </DialogActions>
    </Dialog>
  )

}

export default NewStudyDialog
