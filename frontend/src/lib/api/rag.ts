export const askLegalQuestion = async (
  question: string,
  context: {
    documentId?: string | null
    useKnowledgeBase: boolean
  }
) => {
  try {
    const response = await fetch('/api/rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        ...context,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get answer')
    }

    return await response.json()
  } catch (error) {
    console.error('Error asking question:', error)
    throw error
  }
}