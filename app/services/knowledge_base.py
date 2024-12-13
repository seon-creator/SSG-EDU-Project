# app/services/knowledge_base.py
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from chromadb import Client, PersistentClient
from chromadb.config import Settings
from langchain.embeddings import HuggingFaceEmbeddings
class KnowledgeBaseService:
    def __init__(self):
        try:
           
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
            
        except Exception as e:
            print(f"Error initializing HuggingFaceEmbeddings: {str(e)}")
            self.embeddings = None
        
        self.persist_directory = "knowledge_base/chroma_db"
        self.pdf_directory = "knowledge_base/pdfs"
        self.vector_store = None
        self.client = PersistentClient(self.persist_directory, Settings(anonymized_telemetry=False,
            is_persistent=True))
        self._initialize_vector_store()

    def _initialize_vector_store(self):
        os.makedirs(self.persist_directory, exist_ok=True)
        os.makedirs(self.pdf_directory, exist_ok=True)

        if not self.embeddings:
            print("Embeddings not initialized. Cannot create or load vector store.")
            return

        if os.path.exists(self.persist_directory) and len(os.listdir(self.persist_directory)) > 0:
            print("Loading existing vector store...")
            self.vector_store = Chroma(
                client = self.client,
                embedding_function=self.embeddings,
                collection_name="pdf_documents"
            )
        else:
            print("Creating new vector store...")
            documents = self._load_pdf_documents()
            if documents:
                self.vector_store = Chroma.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    persist_directory=self.persist_directory
                )
                self.vector_store.persist()
                print(f"Created vector store with {len(documents)} documents")
            else:
                print("No documents found to process")
                self.vector_store = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self.embeddings
                )

    def _load_pdf_documents(self):
        documents = []
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1024,
            chunk_overlap=100
        )

        for filename in os.listdir(self.pdf_directory):
            if filename.endswith('.pdf'):
                file_path = os.path.join(self.pdf_directory, filename)
                try:
                    print(f"Processing {filename}...")
                    loader = PyPDFLoader(file_path)
                    pages = loader.load()
                    split_docs = text_splitter.split_documents(pages)
                    documents.extend(split_docs)
                    print(f"Processed {len(split_docs)} chunks from {filename}")
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")

        return documents

    def add_document(self, file_path):
        if not self.embeddings:
            return False, "Embeddings not initialized. Cannot add document."

        try:
            loader = PyPDFLoader(file_path)
            pages = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1024,
                chunk_overlap=100
            )
            documents = text_splitter.split_documents(pages)
            
            self.vector_store.add_documents(documents)
            self.vector_store.persist()
            
            return True, f"Successfully added {len(documents)} chunks to vector store"
        except Exception as e:
            return False, f"Error adding document: {str(e)}"

    def search_documents(self, query: str, k: int = 3):
        if not self.vector_store:
            return []
        
        try:
            results = self.vector_store.similarity_search(query, k=k)
            return results
        except Exception as e:
            print(f"Error searching documents: {str(e)}")
            return []