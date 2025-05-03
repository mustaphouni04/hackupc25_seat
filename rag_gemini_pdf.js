const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Function to load and chunk PDF (unchanged)
async function loadPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
}

function chunkText(text) {
    return text.split('\n\n'); // Simple chunking by paragraphs
}

// Updated getEmbeddings to accept extractor
async function getEmbeddings(texts, extractor) {
    const embeddings = [];
    for (const text of texts) {
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        embeddings.push(Array.from(output.data));
    }
    return embeddings;
}

// Updated ragQuery to accept extractor
async function ragQuery(model, vectorStore, question, extractor, k = 5) {
    const queryEmbedding = await getEmbeddings([question], extractor);
    const relevantTexts = vectorStore.similaritySearch(queryEmbedding[0], k);
    const context = relevantTexts.join('\n\n');
    const prompt = `Answer the following question using the provided context.\n\nContext:\n${context}\n\nQuestion: ${question}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Simple VectorStore class (unchanged)
class VectorStore {
    constructor() {
        this.vectors = [];
        this.texts = [];
    }
    add(vector, text) {
        this.vectors.push(vector);
        this.texts.push(text);
    }
    similaritySearch(queryVector, k) {
        // Placeholder for similarity search logic
        return this.texts.slice(0, k);
    }
}

function setupGemini(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-pro-exp-03-25' });
}

async function main() {
    const pdfPath = process.argv[2];
    const apiKey = process.argv[3];

    console.log(`🔍 Loading PDF: ${pdfPath}`);
    const text = await loadPDF(pdfPath);
    const chunks = chunkText(text);
    console.log(`✅ Chunked into ${chunks.length} segments.`);

    // Dynamically import the ES Module and create extractor
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Use extractor to generate embeddings
    const embeddings = await getEmbeddings(chunks, extractor);
    const vectorStore = new VectorStore();
    chunks.forEach((chunk, index) => {
        vectorStore.add(embeddings[index], chunk);
    });
    console.log("✅ Embeddings created and vector store built.");

    const model = setupGemini(apiKey);

    console.log("\n🤖 Ask questions about the PDF (type 'exit' to quit):");
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function askQuestion() {
        readline.question('>> ', async (query) => {
            if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
                readline.close();
                return;
            }
            const answer = await ragQuery(model, vectorStore, query, extractor);
            console.log(`\n📎 Answer:\n${answer}\n`);
            askQuestion();
        });
    }

    askQuestion();
}

main().catch(console.error);
