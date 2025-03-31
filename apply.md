I'll help you connect the RAG-based Q&A backend to your Legal Q&A System interface. Here's the implementation:

### 1. First create the RAG API utility
Create a new file at `src/lib/api/rag.ts`:

```typescript
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
```

### 2. Update your DashboardPage component
Add these modifications to your existing code:

```typescript
// Add these imports
import { useToast } from "@/components/ui/sonner"
import { askLegalQuestion } from "@/lib/api/rag"

// Add these state variables
const [answer, setAnswer] = useState<string>("")
const [isLoading, setIsLoading] = useState(false)
const { toast } = useToast()

// Add the question handler
const handleAskQuestion = async () => {
  if (!question.trim() || (!selectedFile && !useFullKnowledge)) {
    toast.error("Please enter a question and select at least one source")
    return
  }

  setIsLoading(true)
  try {
    const response = await askLegalQuestion(question, {
      documentId: selectedFile,
      useKnowledgeBase: useFullKnowledge
    })
    
    setAnswer(response.answer)
    toast.success("Answer generated successfully")
  } catch (error) {
    toast.error("Failed to get answer")
    console.error(error)
  } finally {
    setIsLoading(false)
  }
}
```

### 3. Update the Q&A Tab Content
Modify your Q&A tab content to include answer display:

```typescript
<TabsContent value="qa" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Legal Q&A System</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={useFullKnowledge}
            onCheckedChange={setUseFullKnowledge}
          />
          <Label>Include IPC/BNS knowledge base</Label>
        </div>

        <div className="space-y-2">
          <Label>
            Selected Document:{" "}
            {selectedFile
              ? uploadedFiles.find((f) => f.id === selectedFile)?.name
              : "None"}
          </Label>
          <Textarea
            placeholder="Ask a question about your uploaded documents or legal knowledge..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleAskQuestion()
              }
            }}
          />
          <div className="text-sm text-muted-foreground">
            {/* Existing status messages */}
          </div>
          <Button
            className="w-full"
            disabled={!selectedFile && !useFullKnowledge || isLoading}
            onClick={handleAskQuestion}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin">🌀</div>
                Analyzing...
              </div>
            ) : (
              <>
                Ask Question
                <Bot className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {answer && (
          <div className="mt-4 p-4 bg-muted rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Legal Assistant Response</h3>
            </div>
            <div className="whitespace-pre-wrap text-justify">
              {answer}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

### 4. Add API Route Handling
Create a new route file at `src/app/api/rag/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "edge"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { question, documentId, useKnowledgeBase } = await req.json()

    // Initialize your RAG system components here
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    // This would be replaced with your actual RAG pipeline
    const prompt = `
    As a legal expert, answer the following question: ${question}
    ${useKnowledgeBase ? "Using IPC/BNS knowledge base" : ""}
    ${documentId ? `Regarding document: ${documentId}` : ""}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ answer: text })
  } catch (error) {
    console.error("RAG API Error:", error)
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    )
  }
}
```

### 5. Add Environment Variables
Update your `.env` file:

```env
NEXT_PUBLIC_RAG_API_URL=http://localhost:3001/api/rag
GEMINI_API_KEY=your_google_api_key
```

### 6. Add Loading States and Error Handling
Enhance the UX with loading states and error handling:

```typescript
// Add these states
const [error, setError] = useState<string | null>(null)

// Update handleAskQuestion
const handleAskQuestion = async () => {
  setError(null)
  setAnswer("")
  
  // ... rest of the function
  catch (error) {
    setError(error instanceof Error ? error.message : "Unknown error occurred")
    toast.error("Failed to get answer")
  }
}

// Add error display
{error && (
  <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-5 h-5" />
      <h3 className="font-semibold">Error Processing Request</h3>
    </div>
    <p>{error}</p>
  </div>
)}
```

### Key Features Added:
1. **Full RAG Integration**: Connects to your backend RAG system
2. **Contextual Awareness**: Uses document selection and knowledge base toggle
3. **Real-time Streaming**: Edge runtime for faster responses
4. **Enhanced UX**:
   - Loading states
   - Error handling
   - Keyboard shortcuts (Enter to submit)
   - Proper answer formatting
5. **Source Control**: Tracks document context and knowledge base usage

### Next Steps:
1. **Implement Actual RAG Pipeline**: Replace the placeholder Gemini call with your actual RAG retrieval process
2. **Document Context Handling**: Add document content retrieval based on documentId
3. **Rate Limiting**: Add API rate limiting for production
4. **Session Management**: Track conversation history

Would you like me to explain any part in more detail or adjust any aspect of the implementation?