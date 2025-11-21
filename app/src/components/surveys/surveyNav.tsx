import React from 'react'
import get from 'lodash/get'

import Button from 'PORTAL/components/basicComponents/button'
import Typography from 'PORTAL/components/basicComponents/typography'
import { useSurvey } from 'PORTAL/contexts/surveyContext'

interface SurveyNavProps {
  onClose: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
  onPrev?: () => void
  onNext?: () => void
}

const SurveyNav = (props: SurveyNavProps) => {
  const { onClose, isSubmitting, isReadOnly = false, onPrev, onNext } = props
  const { handlePageChange, isLastPage, currentPageNum, checkForUnansweredInPage, getCurrentPage, totalPages } = useSurvey()

  const isFirstPage = currentPageNum === 0

  // The survey form may define a nextAction for each page,
  // Here, we default to 'next' or 'submit' depending on whether it's the last page.
  // If the survey is read-only, replace 'submit' with 'close'.
  const page = getCurrentPage()
  const surveyNextAction = get(page, `nextAction`, isLastPage ? 'submit' : 'next')
  const nextAction = surveyNextAction === 'submit' && isReadOnly ? 'close' : surveyNextAction

  const close = (
    <Button
      labelId='actions.close'
      defaultLabel='Close'
      variant={nextAction === 'close' ? 'contained' : 'outlinedGreyscale'}
      onClick={onClose}
      sx={{ mb: 0 }}
    />
  )

  const back = (
    <Button
      labelId='actions.back'
      defaultLabel='Back'
      variant='outlinedGreyscale'
      onClick={onPrev ?? (() => handlePageChange('prev'))}
      sx={{ mb: 0 }}
    />
  )

  const next = (
    <Button
      labelId='actions.next'
      defaultLabel='Next'
      variant='contained'
      disabled={checkForUnansweredInPage(currentPageNum)}
      onClick={onNext ?? (() => handlePageChange('next'))}
      sx={{ mb: 0 }}
    />
  )

  const submit = (
    <Button
      labelId='actions.submit'
      defaultLabel='Submit'
      variant='contained'
      disabled={isSubmitting || checkForUnansweredInPage(currentPageNum)}
      type='submit'
      sx={{ mb: 0 }}
    />
  )

  const left = isFirstPage ? close : back
  const right = nextAction === 'submit' ? submit : nextAction === 'close' ? close : next

  return <>
    {left}
    <Typography
      messageId='survey.pageCount'
      defaultMessage={`page ${currentPageNum + 1} of ${totalPages}`}
      values={{ currentPageNum: currentPageNum + 1, totalPages }}
      variant='caption'
      sx={{
        flex: '1 0 auto',
        textAlign: { xs: 'center', md: 'end' },
        opacity: 0.7,
        // MUI adds 8px of margin to the left of each action item by default
        // add 8px padding here to make up the additional spacing between the text and buttons
        px: 1,
      }}
    />
    {right}
  </>

}

export default SurveyNav
