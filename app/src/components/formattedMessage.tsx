import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { ENVIRONMENT } from '../constants/'

interface FormattedMessageProps {
  id: string
  defaultMessage?: string
  values?: Record<string, any>
  children?: React.ReactNode
}

const FormattedMessage = (props: FormattedMessageProps) => {
  const {
    values = {},
    id,
    defaultMessage,
    children,
    ...rest
  } = props
  const { t, i18n } = useTranslation()

  // If the component has children, it is likely JSX interpolation needed
  if (children) {
    if (ENVIRONMENT === 'development' && !i18n.exists(id)) {
      return (
        <mark>
          <Trans i18nKey={id} values={values} {...rest}>
            {children}
          </Trans>
        </mark>
      )
    }

    return (
      <Trans i18nKey={id} values={values} {...props}>
        {children}
      </Trans>
    )
  }

  let content = t(id, { ...values, defaultValue: defaultMessage })

  if (ENVIRONMENT === 'development' && !i18n.exists(id)) {
    return <mark>{content}</mark>
  }

  return <>{content}</>
}

export default FormattedMessage
