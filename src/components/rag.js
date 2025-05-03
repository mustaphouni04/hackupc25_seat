import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI } from '@google/generative-ai';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

export async function initializeRAG(pdfUrl, apiKey) {
  try {
    console.log(`Loading PDF from: ${pdfUrl}`);
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const numPages = pdf.numPages;
    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    if (!fullText.trim()) throw new Error('No text extracted from PDF');
    const chunks = fullText.split('\n\n').filter(chunk => chunk.trim() !== '');
    if (chunks.length === 0) throw new Error('No chunks created from PDF text');
    console.log(`PDF loaded with ${chunks.length} chunks`);
    return { vectorStore: chunks, apiKey };
  } catch (error) {
    console.error('Failed to initialize RAG:', error);
    throw new Error('Error loading the document: ' + error.message);
  }
}

export async function queryRAG(ragSystem, query) {
  try {
    const { vectorStore, apiKey } = ragSystem;
    const queryWords = query.toLowerCase().split(' ');
    const scoredChunks = vectorStore.map(chunk => {
      const chunkWords = chunk.toLowerCase().split(' ');
      const score = queryWords.filter(word => chunkWords.includes(word)).length;
      return { chunk, score };
    });
    const topChunks = scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.chunk);
    const context = topChunks.join('\n\n');
    
    const prompt = `Answer the following question using the provided context.\n\nContext:\n${context}\n\nQuestion: ${query}`;
    
    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    return responseText;
  } catch (error) {
    console.error('Failed to query RAG:', error);
    throw new Error('Error getting response: ' + error.message);
  }
}
