import React, { useState, type ChangeEvent } from 'react'

import get from 'lodash/get'

import { default as BasicTextField } from 'PORTAL/components/basicComponents/textField'
import Typography from 'PORTAL/components/basicComponents/typography'
import { SurveyComponentProps } from 'PORTAL/declarations'
import isOnMobile from 'PORTAL/hooks/isOnMobile'

const TextField = (props: SurveyComponentProps) => {
  const { component, responses, onResponse, disabled, isPrinting } = props

  const [characterCount, setCharacterCount] = useState(get(responses, component.id, '').length)

  const onMobile = isOnMobile()

  const inputProps = get(component, 'props.inputProps', {})
  const MAX_MESSAGE_LENGTH = get(inputProps, 'maxLength', 0)
  const rows = onMobile ? get(component, 'mobileRows', 5) : get(component, 'desktopRows', 10)

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const MAX_MESSAGE_LENGTH = 25
    if (MAX_MESSAGE_LENGTH && event.target.value.length <= MAX_MESSAGE_LENGTH) {
      setCharacterCount(event.target.value.length)
      onResponse(component, event.target)
    }
  }

  return (
    <>
      <BasicTextField
        {...component.props}
        label={<span dangerouslySetInnerHTML={{ __html: component.text }} />}
        minRows={rows}
        required={component.isRequired}
        disabled={disabled || isPrinting}
        fullWidth
        id={component.id}
        onChange={e => handleMessageChange(e)}
        value={get(responses, component.id, '')}
        sx={{ mb: 2 }}
        type={component.inputType}
        slotProps={{
          input: {
            required: false
          },
          htmlInput: inputProps
        }}
      />
      {MAX_MESSAGE_LENGTH > 0 && !disabled && <Typography
        variant='caption'
        color={disabled || isPrinting ? 'textSecondary' : 'textPrimary'}
        sx={{
          display: 'inline-block',
          textAlign: 'right',
          mb: 1,
          width: '100%'
        }}
      >
        {characterCount}/{MAX_MESSAGE_LENGTH}
      </Typography>
      }
    </>
  )
}

export default TextField
