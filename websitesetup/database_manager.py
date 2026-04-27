import os
from typing import List
from langchain_core.embeddings import Embeddings
from langchain_chroma import Chroma
from sentence_transformers import SentenceTransformer

class LocalEmbedding(Embeddings):
    def __init__(self, model_name="BAAI/bge-large-zh-v1.5"):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts, normalize_embeddings=True).tolist()

    def embed_query(self, text: str) -> List[float]:
        return self.model.encode([text], normalize_embeddings=True)[0].tolist()


def load_my_chroma():
    embedding = LocalEmbedding()
    # 使用绝对路径确保安全
    base_dir = os.path.dirname(os.path.abspath(__file__))
    persist_dir = os.path.join(base_dir, "chroma_scamdb_20260325")

    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embedding,
        collection_metadata={"hnsw:space": "cosine"}
    )
    return vectorstore

def get_retriever():
    embedding = LocalEmbedding()

    persist_dir = "./chroma_scamdb_20260325"

    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embedding,
        collection_metadata={"hnsw:space": "cosine"}
    )

    # 返回检索器
    return vectorstore.as_retriever(search_kwargs={"k": 3})
