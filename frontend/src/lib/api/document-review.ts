export const analyzeDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await fetch('/api/document-review', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
};