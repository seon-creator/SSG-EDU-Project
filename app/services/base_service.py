# app/services/base_service.py
from langchain_openai import ChatOpenAI

class BaseService:
  def __init__(self):
      self.llm = ChatOpenAI(
          openai_api_key='',
          temperature=0.7
      )
      self.system_prompt = """You are a medical consultation assistant. Use the provided medical knowledge 
      to answer questions accurately and professionally. If you're unsure about something, acknowledge it 
      and suggest consulting a healthcare professional. Always maintain a helpful and empathetic tone."""