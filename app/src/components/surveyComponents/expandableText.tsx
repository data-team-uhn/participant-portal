import React from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import { useTheme } from '@mui/material/styles'

import get from 'lodash/get'

import Typography from 'PORTAL/components/basicComponents/typography'

import type { SurveyComponentProps } from 'PORTAL/declarations'

const ExpandableText = (props: SurveyComponentProps) => {
  const { component, disabled, isPrinting } = props

  const id = get(component, 'accessibleId', '')
  const summary = get(component, 'summary', '')
  const details = get(component, 'details', '')
  const { sx = {}, ...rest } = get(component, 'props', { sx: {} }) as Record<string, any>

  const theme = useTheme()
  const borderRadius = Number(theme.shape.borderRadius)

  return (
    <Accordion
      square
      disableGutters
      elevation={0}
      defaultExpanded={isPrinting}
      {...rest}
      sx={{
        ...sx,
        '&:before': { // Target the pseudo-element for the top border line
          height: '0px',
        }
      }}
    >
      <AccordionSummary
        id={`${id}-header`}
        aria-controls={`${id}-content`}
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 3,
          py: 2,
          bgcolor: 'common.grey',
          borderRadius: 2,
          '&.Mui-expanded': {
            borderRadius: theme => `${borderRadius * 2}px ${borderRadius * 2}px 0 0`
          },
        }}
      >
        <Typography
          component='span'
          dangerouslySetInnerHTML={{ __html: summary }}
          color={disabled ? 'textSecondary' : 'textPrimary'}
          sx={{ fontWeight: 700 }}
        />
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: 'common.grey',
          borderRadius: theme => `0 0 ${borderRadius * 2}px ${borderRadius * 2}px`
        }}
      >
        <Typography
          component='span'
          dangerouslySetInnerHTML={{ __html: details }}
          color={disabled ? 'textSecondary' : 'textPrimary'}
        />
      </AccordionDetails>
    </Accordion>
  )
}

export default ExpandableText
