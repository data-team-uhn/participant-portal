import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { type SxProps } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import map from 'lodash/map'

import Select from 'PORTAL/components/basicComponents/select'
import { supportedLanguages } from 'PORTAL/translations/supported-languages'

interface Props {
  sx?: SxProps

  [p: string]: any
}

export default function LanguageSelector({ sx, ...rest }: Props) {
  const { i18n } = useTranslation()
  const theme = useTheme()

  const changeLanguage = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage)
  }

  useEffect(() => {
    changeLanguage(i18n.language)
  }, [])

  return (
    <Select
      name='language-selector'
      disableUnderline
      value={i18n.language}
      onChange={(e => changeLanguage(e.target.value))}
      inputProps={{
        sx: { minWidth: '3rem' },
        'aria-label': 'Language Selector'
      }}
      sx={{
        ...theme.typography.footer,
        ...sx,
      }}
      {...rest}
    >
      {map(supportedLanguages, (language: { code: string, name: string }) => (
        <option key={`language.${language.code}`} value={language.code}>
          {language.name}
        </option>
      ))}
    </Select>
  )
}
