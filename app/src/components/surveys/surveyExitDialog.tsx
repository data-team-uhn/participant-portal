import React from 'react'

import ConfirmationDialog from 'PORTAL/components/basicComponents/confirmationDialog'
import Typography from 'PORTAL/components/basicComponents/typography'
import { translateString } from 'PORTAL/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSave: () => Promise<void>
}

const SurveyExitDialog = ({ onSave, onClose, open }: Props) => {
  const [buttonsDisabled, setButtonsDisabled] = React.useState(false)

  const handleClose = () => {
    onClose()
  }

  const handleSave = async () => {
    setButtonsDisabled(true)
    await onSave()
    setButtonsDisabled(false)
  }

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleClose}
      onContinue={handleSave}
      continueColor='primary'
      title={translateString('survey.confirmClose', 'Are you sure you want to leave the survey?')}
      body={
        <Typography
          messageId='survey.confirmCloseMessage'
          defaultMessage='If you leave the survey now, your progress will be saved. You may come back and complete the survey at a later time.'
        />
      }
      cancelText={translateString('actions.returnToSurvey', 'Return to survey')}
      continueText={translateString('actions.saveAndClose', 'Save and close')}
      disabledButtons={buttonsDisabled}
    />
  )
}

export default SurveyExitDialog
