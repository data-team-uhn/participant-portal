import React from 'react'

import { default as MuiDivider } from '@mui/material/Divider'

import type { SurveyComponentProps } from 'PORTAL/declarations'

const Divider = (props: SurveyComponentProps) => {
  return <MuiDivider aria-hidden='true' sx={{ my: 3 }} />
}

export default Divider
