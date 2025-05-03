import os
import pdfplumber
import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.docstore.document import Document

# 1. Load PDF
def load_pdf(path):
    full_text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"
    return full_text

# 2. Chunk PDF text
def chunk_text(text, chunk_size=1000, overlap=200):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap
    )
    return splitter.create_documents([text])

# 3. Create vector database
def embed_documents(docs):
    embedding_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(docs, embedding_model)
    return vectorstore

# 4. Initialize Gemini
def setup_gemini(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-pro-exp-03-25")

# 5. Retrieval-Augmented QA
def rag_query(model, vectorstore, question, k=5):
    docs = vectorstore.similarity_search(question, k=k)
    context = "\n\n".join([doc.page_content for doc in docs])
    prompt = f"""Answer the following question using the provided context.

Context:
{context}

Question: {question}
"""
    response = model.generate_content(prompt)
    return response.text

# 6. Main CLI loop
def main(pdf_path, api_key):
    print(f"🔍 Loading PDF: {pdf_path}")
    text = load_pdf(pdf_path)
    docs = chunk_text(text)
    print(f"✅ Chunked into {len(docs)} segments.")

    vectorstore = embed_documents(docs)
    print("✅ Embeddings created and vector store built.")

    model = setup_gemini(api_key)

    print("\n🤖 Ask questions about the PDF (type 'exit' to quit):")
    while True:
        query = input(">> ")
        if query.lower() in {"exit", "quit"}:
            break
        answer = rag_query(model, vectorstore, query)
        print(f"\n📎 Answer:\n{answer}\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python rag_gemini_pdf.py the_pdf.pdf MA_GEMINI_API_KEY")
    else:
        main(sys.argv[1], sys.argv[2])

