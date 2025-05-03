import os
from PyPDF2 import PdfReader
from langchain.vectorstores import FAISS
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# -------- 1. Load and chunk the PDF --------
def load_pdf(path):
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def chunk_text(text, chunk_size=1000, chunk_overlap=200):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    docs = splitter.create_documents([text])
    return docs

# -------- 2. Embed with SentenceTransformers or Ollama --------
def embed_documents(docs, use_ollama=False):
    if use_ollama:
        from langchain.embeddings import OllamaEmbeddings
        embeddings = OllamaEmbeddings(model="nomic-embed-text")
    else:
        embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = FAISS.from_documents(docs, embeddings)
    return db

# -------- 3. Setup LLM + RetrievalQA --------
def setup_qa(db, model="gemma3:4b"):
    llm = Ollama(model=model)
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm, retriever=db.as_retriever(search_kwargs={"k": 5}),
        return_source_documents=False
    )
    return qa_chain

# -------- 4. Main interaction --------
def main(pdf_path):
    print(f"🔍 Reading PDF: {pdf_path}")
    text = load_pdf(pdf_path)
    docs = chunk_text(text)
    print(f"✅ Loaded and split into {len(docs)} chunks.")

    db = embed_documents(docs)
    print("✅ Documents embedded and vector DB created.")

    qa = setup_qa(db)

    print("\n🤖 Ask anything about the PDF (type 'exit' to quit)")
    while True:
        q = input(">> ")
        if q.lower() in ("exit", "quit"):
            break
        result = qa.run(q)
        print(f"\n📎 Answer:\n{result}\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python rag_ollama_pdf.py the_pdf.pdf")
    else:
        main(sys.argv[1])

