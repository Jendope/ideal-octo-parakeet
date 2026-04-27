# Core RAG Module for FraudGuard HK
# This module provides the core RAG functionality for fraud detection
# Can be imported by main.ipynb or used directly in the application

import os
import re
import json
from typing import List, Dict, Optional, Tuple
from datetime import datetime

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

class LocalEmbedding:
    """
    Local embedding function using SentenceTransformers.
    Uses BAAI/bge-large-zh-v1.5 for Chinese text.
    """
    
    def __init__(self, model_name: str = "BAAI/bge-large-zh-v1.5"):
        self.model = SentenceTransformer(model_name)
        print(f"Loaded embedding model: {model_name}")
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents."""
        return self.model.encode(texts, normalize_embeddings=True).tolist()
    
    def embed_query(self, text: str) -> List[List[float]]:
        """Embed a single query."""
        return self.model.encode([text], normalize_embeddings=True)[0].tolist()


class RAGDatabase:
    """
    RAG Database manager for fraud case retrieval.
    """
    
    def __init__(self, 
                 persist_directory: str = "./chroma_hk01_scam_db",
                 embedding_model: str = "BAAI/bge-large-zh-v1.5"):
        """
        Initialize the RAG database.
        
        Args:
            persist_directory: Path to the Chroma database
            embedding_model: Name of the embedding model
        """
        self.persist_directory = persist_directory
        self.embedding = LocalEmbedding(embedding_model)
        self.vectorstore = None
        self.retriever = None
        
    def load_database(self, top_k: int = 3) -> bool:
        """
        Load the existing vector database.
        
        Args:
            top_k: Number of similar documents to retrieve
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embedding,
                collection_metadata={"hnsw:space": "cosine"}
            )
            self.retriever = self.vectorstore.as_retriever(
                search_kwargs={"k": top_k}
            )
            print(f"Database loaded from: {self.persist_directory}")
            return True
        except Exception as e:
            print(f"Failed to load database: {e}")
            return False
    
    def retrieve_similar_cases(self, query: str) -> List[Document]:
        """
        Retrieve similar fraud cases from the database.
        
        Args:
            query: User's query or suspicious message
            
        Returns:
            List of similar Document objects
        """
        if not self.retriever:
            raise ValueError("Database not loaded. Call load_database() first.")
        
        return self.retriever.invoke(query)
    
    def get_case_count(self) -> int:
        """Get the total number of documents in the database."""
        if self.vectorstore:
            return self.vectorstore._collection.count()
        return 0


class FraudAnalyzer:
    """
    Fraud analyzer with RAG-enhanced detection.
    Integrates with DashScope/Qwen API for analysis.
    """
    
    # Risk level definitions with visual labels
    RISK_LEVELS = {
        "SAFE": {
            "color": "green",
            "icon": "🟢",
            "label_zh": "安全",
            "label_en": "Safe"
        },
        "LOW": {
            "color": "yellow",
            "icon": "🟡",
            "label_zh": "低風險",
            "label_en": "Low Risk"
        },
        "MEDIUM": {
            "color": "orange",
            "icon": "🟠",
            "label_zh": "中風險",
            "label_en": "Medium Risk"
        },
        "HIGH": {
            "color": "red",
            "icon": "🔴",
            "label_zh": "高風險",
            "label_en": "High Risk"
        },
        "CRITICAL": {
            "color": "darkred",
            "icon": "🔴",
            "label_zh": "極高風險",
            "label_en": "Critical Risk"
        }
    }
    
    # Elderly-friendly simple reasons
    ELDERLY_REASONS = {
        "zh": {
            "link": "此訊息要求您點擊不明連結",
            "money": "此訊息要求您匯款或提供銀行資料",
            "personal": "此訊息要求您提供個人資料",
            "prize": "此訊息聲稱您中獎，要求付費領取",
            "urgency": "此訊息催促您立即行動",
            "authority": "此訊息冒充官方機構",
            "safe": "此訊息沒有發現可疑內容"
        },
        "en": {
            "link": "This message asks you to click an unknown link",
            "money": "This message asks you to transfer money",
            "personal": "This message asks for personal information",
            "prize": "This message claims you won a prize",
            "urgency": "This message pressures you to act immediately",
            "authority": "This message pretends to be from officials",
            "safe": "No suspicious content detected"
        }
    }
    
    # Simple action advice for elderly
    ELDERLY_ACTIONS = {
        "zh": {
            "link": "請勿點擊，直接刪除訊息",
            "money": "請勿匯款，致電銀行確認",
            "personal": "請勿提供，聯絡家人求助",
            "prize": "這是詐騙，請勿回覆",
            "urgency": "這是詐騙手法，請聯絡家人",
            "authority": "請先致電官方核實",
            "safe": "此訊息安全，可以放心"
        },
        "en": {
            "link": "Do NOT click. Delete the message",
            "money": "Do NOT transfer. Call your bank",
            "personal": "Do NOT share. Contact family",
            "prize": "This is a scam. Do NOT reply",
            "urgency": "This is a scam tactic. Contact family",
            "authority": "Verify with officials first",
            "safe": "This message is safe"
        }
    }
    
    def __init__(self, 
                 api_key: str = None,
                 base_url: str = None,
                 model: str = "qwen3-max-2026-01-23"):
        """
        Initialize the fraud analyzer.
        
        Args:
            api_key: DashScope API key (defaults to env var)
            base_url: DashScope API base URL
            model: Model name to use
        """
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY")
        self.base_url = base_url or os.getenv(
            "DASHSCOPE_BASE_URL",
            "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
        )
        self.model = model
        
        if not self.api_key:
            raise ValueError("DASHSCOPE_API_KEY not found in environment variables")
        
        print(f"Initialized FraudAnalyzer with model: {self.model}")
        print(f"API endpoint: {self.base_url}")
    
    def _detect_fraud_indicators(self, text: str) -> List[str]:
        """
        Detect fraud indicators in text.
        
        Args:
            text: Message text to analyze
            
        Returns:
            List of detected indicator types
        """
        indicators = []
        text_lower = text.lower()
        
        # Check for links
        if 'http' in text_lower or '點擊' in text or '點擊' in text or 'click' in text_lower:
            indicators.append("link")
        
        # Check for money requests
        if any(kw in text for kw in ['匯款', '轉賬', '銀行', '付款', '轉帳', 'HK$', 'pay', 'transfer']):
            indicators.append("money")
        
        # Check for personal info requests
        if any(kw in text for kw in ['身份證', '密碼', '驗證碼', '個人資料', '身份證明文件', 'password', 'ID']):
            indicators.append("personal")
        
        # Check for prize scams
        if any(kw in text for kw in ['中獎', '獎品', '抽獎', '優惠', '獲得', 'won', 'prize', 'winner']):
            indicators.append("prize")
        
        # Check for urgency
        if any(kw in text for kw in ['立即', '緊急', '限時', '馬上', '即時', 'urgent', 'immediately', 'now']):
            indicators.append("urgency")
        
        # Check for authority impersonation
        if any(kw in text for kw in ['政府', '警察', '官員', '公安', '海關', '法院', 'government', 'police', 'official']):
            indicators.append("authority")
        
        return indicators
    
    def _calculate_fraud_score(self, indicators: List[str]) -> Tuple[float, str]:
        """
        Calculate fraud score based on indicators.
        
        Args:
            indicators: List of detected fraud indicators
            
        Returns:
            Tuple of (score 0-1, risk level)
        """
        if not indicators:
            return 0.0, "SAFE"
        
        score_map = {
            "link": 0.3,
            "money": 0.4,
            "personal": 0.35,
            "prize": 0.3,
            "urgency": 0.2,
            "authority": 0.25
        }
        
        total_score = sum(score_map.get(ind, 0.1) for ind in indicators)
        # Normalize to 0-1 range
        final_score = min(total_score, 1.0)
        
        # Determine risk level
        if final_score >= 0.8:
            risk_level = "CRITICAL"
        elif final_score >= 0.6:
            risk_level = "HIGH"
        elif final_score >= 0.4:
            risk_level = "MEDIUM"
        elif final_score >= 0.2:
            risk_level = "LOW"
        else:
            risk_level = "SAFE"
        
        return final_score, risk_level
    
    def format_elderly_output(self,
                              fraud_score: float,
                              risk_level: str,
                              language: str = "zh") -> Dict:
        """
        Format the output for elderly users.
        
        Args:
            fraud_score: Fraud score (0-1)
            risk_level: Risk level string
            language: Output language ("zh" or "en")
            
        Returns:
            Elderly-friendly output dictionary
        """
        risk_info = self.RISK_LEVELS.get(risk_level, self.RISK_LEVELS["SAFE"])
        
        # Get visual label
        if language == "zh":
            visual_label = f"{risk_info['icon']} {risk_info['label_zh']}"
        else:
            visual_label = f"{risk_info['icon']} {risk_info['label_en']}"
        
        # Calculate confidence display
        confidence_pct = int(fraud_score * 100)
        
        # Get simple reason and action (will be set by analyze method)
        simple_reason = ""
        action = ""
        
        return {
            "fraud_score": fraud_score,
            "visual_label": visual_label,
            "simple_reason": simple_reason,
            "action": action,
            "confidence_display": f"{confidence_pct}%",
            "color": risk_info["color"]
        }
    
    def analyze(self, 
                message: str,
                rag_cases: List[Document] = None,
                language: str = "zh",
                elderly_mode: bool = True) -> Dict:
        """
        Analyze a message for fraud indicators.
        
        Args:
            message: Message to analyze
            rag_cases: Retrieved similar cases from RAG
            language: Output language
            elderly_mode: If True, format output for elderly users
            
        Returns:
            Analysis result dictionary
        """
        # Detect indicators
        indicators = self._detect_fraud_indicators(message)
        
        # Calculate score
        fraud_score, risk_level = self._calculate_fraud_score(indicators)
        
        # Get primary indicator for elderly output
        primary_indicator = indicators[0] if indicators else "safe"
        
        # Format output
        if elderly_mode:
            result = self.format_elderly_output(fraud_score, risk_level, language)
            
            # Add simple reason and action
            result["simple_reason"] = self.ELDERLY_REASONS.get(language, self.ELDERLY_REASONS["zh"]).get(
                primary_indicator, 
                self.ELDERLY_REASONS[language]["safe"]
            )
            result["action"] = self.ELDERLY_ACTIONS.get(language, self.ELDERLY_ACTIONS["zh"]).get(
                primary_indicator,
                self.ELDERLY_ACTIONS[language]["safe"]
            )
        else:
            result = {
                "fraud_score": fraud_score,
                "risk_level": risk_level,
                "indicators": indicators,
                "similar_cases": []
            }
        
        # Add RAG context if available
        if rag_cases:
            result["similar_cases"] = [
                {
                    "title": doc.metadata.get("title", ""),
                    "url": doc.metadata.get("url", ""),
                    "relevance": doc.metadata.get("paragraph_id", "")
                }
                for doc in rag_cases[:3]
            ]
        
        return result


def create_rag_system(db_path: str = "./chroma_hk01_scam_db") -> Tuple[RAGDatabase, FraudAnalyzer]:
    """
    Create and initialize the RAG system.
    
    Args:
        db_path: Path to the Chroma database
        
    Returns:
        Tuple of (RAGDatabase, FraudAnalyzer)
    """
    # Initialize database
    rag_db = RAGDatabase(persist_directory=db_path)
    rag_db.load_database(top_k=3)
    
    # Initialize analyzer
    analyzer = FraudAnalyzer()
    
    return rag_db, analyzer


# Example usage
if __name__ == "__main__":
    print("=" * 50)
    print("FraudGuard HK - RAG System Test")
    print("=" * 50)
    
    # Create RAG system
    rag_db, analyzer = create_rag_system()
    
    print(f"\nDatabase contains {rag_db.get_case_count()} documents")
    
    # Test query
    test_message = """
    恭喜您！您已被選中獲得 HK$50,000 現金大獎！
    請立即點擊以下連結領取：http://fake-link.com/prize
    請在24小時內完成領取，否則獎品將作廢。
    """
    
    print("\n測試訊息:")
    print(test_message)
    
    # Retrieve similar cases
    similar_cases = rag_db.retrieve_similar_cases(test_message)
    
    print(f"\n找到 {len(similar_cases)} 個相似案例")
    for i, doc in enumerate(similar_cases, 1):
        print(f"\n{i}. {doc.metadata.get('title', 'N/A')}")
        print(f"   URL: {doc.metadata.get('url', 'N/A')}")
    
    # Analyze for elderly
    result = analyzer.analyze(
        message=test_message,
        rag_cases=similar_cases,
        language="zh",
        elderly_mode=True
    )
    
    print("\n" + "=" * 50)
    print("分析結果（長者模式）:")
    print("=" * 50)
    print(f"視覺標籤: {result['visual_label']}")
    print(f"簡單原因: {result['simple_reason']}")
    print(f"行動建議: {result['action']}")
    print(f"信心度: {result['confidence_display']}")
