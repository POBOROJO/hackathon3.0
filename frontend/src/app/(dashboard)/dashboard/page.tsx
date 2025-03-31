"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Bot,
  FileText,
  Upload,
  AlertTriangle,
  BookOpen,
  FileCheck,
  File,
  Trash2,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { askLegalQuestion } from "@/lib/api/rag";
import { analyzeDocument } from "@/lib/api/document-review";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  fileObj: File; // Add this
}

const DashboardPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFullKnowledge, setUseFullKnowledge] = useState(false);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.type,
      size: file.size,
      fileObj: file, // Store the actual File object
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    if (selectedFile === id) {
      setSelectedFile(null);
    }
  };

  const DocumentSidebar = () => (
    <div className="w-64 border-r border-border p-4 space-y-4">
      <h3 className="font-semibold text-lg">Uploaded Documents</h3>
      {uploadedFiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No documents uploaded yet
        </p>
      ) : (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group ${
                selectedFile === file.id ? "bg-primary/10" : "hover:bg-muted"
              }`}
              onClick={() => setSelectedFile(file.id)}
            >
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleDocumentReview = async () => {
    if (!selectedFile) {
      toast.error("Please select a document first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const fileData = uploadedFiles.find((f) => f.id === selectedFile);
      if (!fileData) return;

      toast.info("Analyzing document...");
      const result = await analyzeDocument(fileData.fileObj);
      setAnalysis(result.aiResponse);
      toast.success("Document analysis complete");
    } catch (error) {
      toast.error("Failed to analyze document");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async () => {
    setError(null);
    setAnswer("");

    if (!question.trim() || (!selectedFile && !useFullKnowledge)) {
      toast.error("Please enter a question and select at least one source");
      return;
    }

    setIsLoading(true);
    try {
      const response = await askLegalQuestion(question, {
        documentId: selectedFile,
        useKnowledgeBase: useFullKnowledge,
      });

      setAnswer(response.answer);
      toast.success("Answer generated successfully");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      toast.error("Failed to get answer");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <DocumentSidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold">
            Legal Document Analysis Dashboard
          </h1>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-5 gap-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Review
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="drafting" className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Drafting
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      <div>
                        <p className="text-lg mb-2">
                          Drag & drop files here, or click to select files
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF and DOCX files
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                          ? uploadedFiles.find((f) => f.id === selectedFile)
                              ?.name
                          : "None"}
                      </Label>
                      <Textarea
                        placeholder="Ask a question about your uploaded documents or legal knowledge..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAskQuestion();
                          }
                        }}
                      />
                      <div className="text-sm text-muted-foreground">
                        {!selectedFile && !useFullKnowledge && (
                          <div className="flex items-center text-amber-600 font-medium">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Please select a document or enable IPC/BNS knowledge
                            base
                          </div>
                        )}
                        {selectedFile && !useFullKnowledge && (
                          <div className="flex items-center text-blue-600 font-medium">
                            <FileCheck className="w-4 h-4 mr-2" />
                            Question will be answered based on selected document
                            only
                          </div>
                        )}
                        {!selectedFile && useFullKnowledge && (
                          <div className="flex items-center text-purple-600 font-medium">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Question will be answered using IPC/BNS knowledge
                            base
                          </div>
                        )}
                        {selectedFile && useFullKnowledge && (
                          <div className="flex items-center text-green-600 font-medium">
                            <Bot className="w-4 h-4 mr-2" />
                            Question will be answered using both document and
                            IPC/BNS knowledge
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          disabled={
                            (!selectedFile && !useFullKnowledge) || isLoading
                          }
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

                        <Button
                          variant="outline"
                          onClick={() => {
                            setQuestion("");
                            setAnswer("");
                            setError(null);
                            toast.info("Conversation cleared");
                          }}
                          disabled={
                            isLoading || (!question && !answer && !error)
                          }
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5" />
                          <h3 className="font-semibold">
                            Error Processing Request
                          </h3>
                        </div>
                        <p>{error}</p>
                      </div>
                    )}
                    {answer && (
                      <div className="mt-4 p-4 bg-muted rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">
                            Legal Assistant Response
                          </h3>
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

            <TabsContent value="review" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Document Review</CardTitle>
                    <Button
                      onClick={handleDocumentReview}
                      disabled={!selectedFile || isAnalyzing}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Document"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Key Information</h3>
                      <div className="p-4 border rounded-lg min-h-48">
                        {analysis ? (
                          <div className="whitespace-pre-wrap">{analysis}</div>
                        ) : (
                          <p className="text-muted-foreground">
                            {selectedFile
                              ? "Click 'Analyze Document' to review"
                              : "Select a document to review"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Inconsistencies</h3>
                      <div className="p-4 border rounded-lg min-h-48">
                        <p className="text-muted-foreground">
                          {analysis
                            ? "Inconsistency detection coming soon"
                            : "No analysis performed yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Key Information</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-muted-foreground">
                          {selectedFile
                            ? "Analyzing document..."
                            : "Select a document to view extracted information"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Inconsistencies</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-muted-foreground">
                          {selectedFile
                            ? "Checking for inconsistencies..."
                            : "No inconsistencies detected"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Case Summary</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-muted-foreground">
                          {selectedFile
                            ? "Generating summary..."
                            : "Select a case to view summary"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Citation Analysis
                      </h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-muted-foreground">
                          {selectedFile
                            ? "Analyzing citations..."
                            : "No citations analyzed yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drafting" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Drafting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Contract Template
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FileText className="w-8 h-8 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Standard contract template with AI-assisted
                          customization
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">Legal Notice</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FileText className="w-8 h-8 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Legal notice template with compliance checks
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">Agreement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FileText className="w-8 h-8 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Agreement template with smart clause suggestions
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
