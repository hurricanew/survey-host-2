import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { InteractiveSurveyPreview } from '../InteractiveSurveyPreview'

const mockSurveyData = {
  title: 'Test Survey',
  description: 'This is a test survey',
  questions: [
    {
      id: 1,
      text: 'How do you feel?',
      options: [
        { id: 'a', text: 'Bad', score: 0 },
        { id: 'b', text: 'Okay', score: 1 },
        { id: 'c', text: 'Good', score: 2 },
        { id: 'd', text: 'Great', score: 3 }
      ]
    },
    {
      id: 2,
      text: 'How often do you exercise?',
      options: [
        { id: 'a', text: 'Never', score: 0 },
        { id: 'b', text: 'Sometimes', score: 1 },
        { id: 'c', text: 'Often', score: 2 },
        { id: 'd', text: 'Daily', score: 3 }
      ]
    }
  ],
  scoringGuide: {
    pointValues: 'a=0, b=1, c=2, d=3',
    totalPossible: 6,
    ranges: [
      { min: 0, max: 2, title: 'Low Score', description: 'You scored low' },
      { min: 3, max: 4, title: 'Medium Score', description: 'You scored medium' },
      { min: 5, max: 6, title: 'High Score', description: 'You scored high' }
    ]
  },
  note: 'This is a test note'
}

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  )
}

describe('InteractiveSurveyPreview', () => {
  it('should render empty state when no survey data', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={null} />)
    
    expect(screen.getByText('Enter survey text to see an interactive preview')).toBeInTheDocument()
  })

  it('should render survey title and description', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    expect(screen.getByText('Test Survey')).toBeInTheDocument()
    expect(screen.getByText('This is a test survey')).toBeInTheDocument()
  })

  it('should render first question with options', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    expect(screen.getByText('How do you feel?')).toBeInTheDocument()
    expect(screen.getByText('Bad')).toBeInTheDocument()
    expect(screen.getByText('Okay')).toBeInTheDocument()
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('Great')).toBeInTheDocument()
  })

  it('should show progress indicator', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('50% Complete')).toBeInTheDocument()
  })

  it('should disable Next button when no answer selected', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('should enable Next button when answer is selected', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    const goodOption = screen.getByText('Good')
    fireEvent.click(goodOption)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).not.toBeDisabled()
  })

  it('should navigate to next question', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    // Select answer and go to next question
    const goodOption = screen.getByText('Good')
    fireEvent.click(goodOption)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(screen.getByText('How often do you exercise?')).toBeInTheDocument()
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('100% Complete')).toBeInTheDocument()
  })

  it('should navigate back to previous question', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    // Go to second question
    const goodOption = screen.getByText('Good')
    fireEvent.click(goodOption)
    fireEvent.click(screen.getByText('Next'))
    
    // Go back to first question
    const previousButton = screen.getByText('Previous')
    fireEvent.click(previousButton)
    
    expect(screen.getByText('How do you feel?')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument()
  })

  it('should disable Previous button on first question', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    const previousButton = screen.getByText('Previous')
    expect(previousButton).toBeDisabled()
  })

  it('should show Finish Survey button on last question', () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    // Navigate to last question
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Next'))
    
    expect(screen.getByText('Finish Survey')).toBeInTheDocument()
  })

  it('should calculate and display final score', async () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    // Answer first question (score: 2)
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Next'))
    
    // Answer second question (score: 3)
    fireEvent.click(screen.getByText('Daily'))
    fireEvent.click(screen.getByText('Finish Survey'))
    
    await waitFor(() => {
      expect(screen.getByText('Survey Complete!')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument() // Score
      expect(screen.getByText('out of 6 points')).toBeInTheDocument()
      expect(screen.getByText('High Score')).toBeInTheDocument()
      expect(screen.getByText('You scored high')).toBeInTheDocument()
    })
  })

  it('should show note in results', async () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    // Complete survey
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Daily'))
    fireEvent.click(screen.getByText('Finish Survey'))
    
    await waitFor(() => {
      expect(screen.getByText('This is a test note')).toBeInTheDocument()
    })
  })

  it('should allow restarting survey', async () => {
    renderWithChakra(<InteractiveSurveyPreview surveyData={mockSurveyData} />)
    
    // Complete survey
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Daily'))
    fireEvent.click(screen.getByText('Finish Survey'))
    
    await waitFor(() => {
      expect(screen.getByText('Survey Complete!')).toBeInTheDocument()
    })
    
    // Restart survey
    fireEvent.click(screen.getByText('Take Again'))
    
    expect(screen.getByText('How do you feel?')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument()
  })

  it('should call onSave when Save Survey button is clicked', async () => {
    const onSave = jest.fn()
    renderWithChakra(
      <InteractiveSurveyPreview 
        surveyData={mockSurveyData} 
        onSave={onSave}
      />
    )
    
    // Complete survey
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Daily'))
    fireEvent.click(screen.getByText('Finish Survey'))
    
    await waitFor(() => {
      expect(screen.getByText('Save Survey')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Save Survey'))
    expect(onSave).toHaveBeenCalled()
  })

  it('should show loading state when saving', async () => {
    renderWithChakra(
      <InteractiveSurveyPreview 
        surveyData={mockSurveyData} 
        onSave={() => {}}
        isLoading={true}
      />
    )
    
    // Complete survey
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Daily'))
    fireEvent.click(screen.getByText('Finish Survey'))
    
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })
})