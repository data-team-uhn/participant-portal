import React, { createContext, useEffect, useState } from 'react'

import cloneDeep from 'lodash/cloneDeep'
import every from 'lodash/every'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import max from 'lodash/max'
import some from 'lodash/some'

import type { FormResponse, SurveyType, SurveyComponentType, SurveyPageType } from 'PORTAL/declarations'

interface SurveyProviderProps {
  children: React.ReactNode
  form: SurveyType
  formId: string
  formResponses?: Partial<FormResponse>
}

interface SurveyContext {
  survey: SurveyType
  responsesData: object
  totalPages: number
  currentPageNum: number
  furthestPageCompleted: number
  isLastPage: boolean
  questionCount: number
  formId: string
  responseComplete: boolean
  responsesId: string | null
  getCurrentPage: () => SurveyPageType
  checkForUnansweredInPage: (page_num: number, justRequired?: boolean) => boolean
  handleQuestionResponse: (question: SurveyComponentType, target: any) => void
  handlePageChange: (option: string) => void
  reset: () => void
}

const defaultContext = {
  survey: { title: '', pages: [], showWithdrawIfComplete: false } as SurveyType,
  responsesData: {},
  totalPages: 0,
  currentPageNum: 0,
  furthestPageCompleted: 0,
  isLastPage: false,
  questionCount: 0,
  formId: '',
  responseComplete: false,
  responsesId: null,
  getCurrentPage: () => ({}),
  checkForUnansweredInPage: (page_num: number, justRequired = true) => false,
  handleQuestionResponse: (question: SurveyComponentType, target: any) => {},
  handlePageChange: (option: string) => {},
  reset: () => {}
}

const SurveyContext = createContext(defaultContext)

/**
 * SurveyProvider component provides the context for managing survey state and responses.
 *
 * Functions prefixed with an underscore (_) are private and not intended to be used outside of this component.
 */
function SurveyProvider(props: SurveyProviderProps) {
  const {
    children,
    form,
    formId,
    formResponses = {} // database form responses object
  } = props

  // Extract details about responses fetched from the database
  const responses = formResponses?.responses ?? {}
  const responseComplete = formResponses?.is_complete ?? false
  const responsesId = formResponses?.id ?? null

  const [survey, setSurvey] = useState<SurveyType>(defaultContext.survey)
  const [responsesData, setResponsesData] = useState(defaultContext.responsesData)
  const [totalPages, setTotalPages] = useState(defaultContext.totalPages)
  const [currentPageNum, setCurrentPageNum] = useState(defaultContext.currentPageNum)
  const [furthestPageCompleted, setFurthestPageCompleted] = useState(defaultContext.furthestPageCompleted)
  const [isLastPage, setIsLastPage] = useState(defaultContext.isLastPage)
  const [questionCount, setQuestionCount] = useState(defaultContext.questionCount)

  useEffect(() => {
    // Initialize the survey with the provided form and responses
    _updateSurveyProps(form, responses, true)
  }, [form?.title, formResponses?.id])

  /**
   * This function evaluates the visibility of a survey component based on the responses.
   * We need to pass all values to get most current versions
   */
  const _evalVisibility = (responses_data: object, item: SurveyComponentType | SurveyPageType) => {
    if (!item.enableWhen) return true

    // Look at the different questions that each evalVisibility depends on
    // Different question IDs are treated as AND conditions
    // Same question IDs multiple times are treated as OR conditions
    const conditions = groupBy(item.enableWhen, 'question')
    return every(conditions, condition => {
      return some(condition, c => {
        // For the below, only 1 will pass.
        if (c.hasAnswer !== undefined) return c.hasAnswer ? responses_data[c.question] !== '' : responses_data[c.question] === ''
        if (c.answer === false) return !responses_data[c.question]
        if (c.answer !== undefined) return responses_data[c.question] === c.answer
      })
    })
  }

  /**
   * Updates the survey properties based on the responses.
   *
   * This function checks for visibility of each component and page,
   * and sets the number of pages accordingly.
   */
  const _updateSurveyProps = (surveyData: SurveyType, responses: object, resetPageCounter = false) => {
    let numPages = 0
    let numQuestions = 0

    const newSurvey = cloneDeep(surveyData)

    forEach(newSurvey.pages, page => {
      const pageVisibility = _evalVisibility(responses, page)

      const components = get(page, 'components', [])

      forEach(components, component => {
        component.isQuestion = !!component.id
        component.isVisible = pageVisibility && _evalVisibility(responses, component)
        if (!component.isVisible && component.isQuestion) {
          responses[component.id] = component.type === 'checkbox' ? false : ''
        }
        if (component.isQuestion) {
          numQuestions++
        }
      })

      page.isVisible = page.enableWhen
        ? pageVisibility
        : some(components, q => q.isVisible)

      if (page.isVisible) {
        numPages++
        page.number = numPages
      }
    })

    setSurvey(newSurvey)
    setResponsesData(responses)
    setTotalPages(numPages)
    setQuestionCount(numQuestions)

    if (resetPageCounter) {
      // If a response object was passed and the survey is in progress, start from the furthest page.
      // Otherwise, start from the beginning.
      let furthestPage
      if (responseComplete || !formResponses?.furthest_page) {
        furthestPage = 0
      } else {
        furthestPage = formResponses?.furthest_page
      }

      setCurrentPageNum(furthestPage || 0)
      setFurthestPageCompleted(furthestPage || 0)
      setIsLastPage(furthestPage === numPages)
    }

    if (numPages < 2) {
      setIsLastPage(true)
    }
  }

  /**
   * This function finds the next visible page based on the current page number,
   * isVisible evaluation, and direction.
   */
  const _findVisiblePage = (direction = 1, pageNum = currentPageNum + direction) => {
    for (; !(pageNum < 0 || pageNum >= survey.pages.length) ; pageNum += direction) {
      if (get(survey, `pages[${pageNum}].isVisible`)) return pageNum
    }
  }

  /**
   * Set a response to a question and update page completion.
   *
   * `question` is the question object and `target` is the event target (e.g., checkbox, input).
   */
  const handleQuestionResponse = (question: SurveyComponentType, target: HTMLInputElement) => {
    const updatedResponses = {
      ...responsesData,
      [question.id]: question.type === 'checkbox' ? target.checked : target.value
    }
    _updateSurveyProps({ ...survey }, updatedResponses)

    setFurthestPageCompleted(prevState => max([prevState, currentPageNum]))
    setIsLastPage(!_findVisiblePage(1, currentPageNum + 1))
  }

  /**
   * Checks if there are any unanswered questions on page_num page.
   *
   * `justRequired` indicates whether to check only required questions or all questions.
   */
  const checkForUnansweredInPage = (page_num: number, justRequired = true) => {
    const isNotAnswered = (component: SurveyComponentType) => {
      const response = responsesData[component.id]
      const checkboxRequired = component.isRequired && component.type === 'checkbox' && !response
      return component.isQuestion && (response === '' || response === undefined || checkboxRequired)
    }

    const components = get(survey, `pages[${page_num}].components`, [])

    return justRequired
      ? !every(components, c => (c.isVisible && c.isRequired && !isNotAnswered(c)) || !c.isRequired || !c.isVisible)
      : !every(components, c => (c.isVisible && !isNotAnswered(c)) || !c.isVisible)
  }

  /**
   * Update the current page, skipping pages that aren't visible.
   *
   * `option` can be "next" to go forward or "prev" to go backwards.
   *
   * It updates:
   * - currentPageNum
   * - furthestPageCompleted
   * - isLastPage
   *
   * If a survey element has the id `survey-top`, it will scroll to that element.
   */
  const handlePageChange = (option: 'prev' | 'next') => {
    let newPageNum = currentPageNum
    if (option === 'next') {
      if (checkForUnansweredInPage(currentPageNum)) return
      newPageNum = _findVisiblePage(1)
    }
    if (option === 'prev') {
      newPageNum = _findVisiblePage(-1)
    }

    const hasMorePages = _findVisiblePage(1, newPageNum + 1)

    setCurrentPageNum(newPageNum)
    setFurthestPageCompleted(prevState => hasMorePages ? max([prevState, newPageNum]) : newPageNum)
    setIsLastPage(!hasMorePages)

    const survey_top = document.getElementById('survey-top')
    if (survey_top) survey_top.scrollIntoView()
  }

  /**
   * Get the current page object based on the current page number.
   */
  const getCurrentPage = (): SurveyPageType => {
    return survey.pages[currentPageNum]
  }

  /**
   * Reset the survey state to its initial values.
   */
  const reset = () => {
    _updateSurveyProps(form, responses, true)
  }

  const value = {
    /* State */
    survey,
    responsesData,
    totalPages,
    currentPageNum,
    furthestPageCompleted,
    isLastPage,
    formId,
    responseComplete,
    responsesId,
    questionCount,

    /* Functions */
    getCurrentPage,
    checkForUnansweredInPage,
    handleQuestionResponse,
    handlePageChange,
    reset
  }

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
}

/**
 * Custom hook to use the SurveyContext.
 */
function useSurvey() {
  const context = React.useContext(SurveyContext)
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider')
  }
  return context
}

export { SurveyProvider, useSurvey }
