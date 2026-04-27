# Daily Database Update Script for FraudGuard HK
# This script runs daily to fetch new fraud articles and update the vector database

import os
import re
import json
import time
import requests
import schedule
import threading
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path

# For RAG database
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from sentence_transformers import SentenceTransformer

class DailyUpdater:
    """
    Daily update script that:
    1. Fetches the latest 12 articles from HK01
    2. Filters for yesterday's articles
    3. Updates the vector database
    """
    
    def __init__(self, 
                 persist_directory: str = "./chroma_hk01_scam_db",
                 embedding_model: str = "BAAI/bge-large-zh-v1.5"):
        
        self.base_url = "https://web-data.api.hk01.com/v2/issues/10221/relatedBlock/0/"
        self.headers = {
            'Referer': 'https://www.hk01.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.persist_directory = persist_directory
        self.embedding_model = embedding_model
        
        # Initialize embedding function
        self._init_embedding()
    
    def _init_embedding(self):
        """Initialize the embedding model."""
        print(f"正在載入嵌入模型: {self.embedding_model}")
        self.model = SentenceTransformer(self.embedding_model)
        print("嵌入模型載入完成")
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents."""
        return self.model.encode(texts, normalize_embeddings=True).tolist()
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query."""
        return self.model.encode([text], normalize_embeddings=True)[0].tolist()
    
    def fetch_latest_articles(self, count: int = 12) -> List[Dict]:
        """
        Fetch the latest articles from HK01.
        
        Args:
            count: Number of articles to fetch (multiples of 6)
            
        Returns:
            List of article items
        """
        all_articles = []
        params = {
            'limit': 6,
            'offset': 0,
            'bucketId': '00000'
        }
        
        max_requests = (count // 6) + 1
        request_count = 0
        
        print(f"正在獲取最新 {count} 篇文章...")
        
        while len(all_articles) < count and request_count < max_requests:
            try:
                response = requests.get(
                    self.base_url,
                    headers=self.headers,
                    params=params,
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    items = data.get('items', [])
                    next_offset = data.get('nextOffset', None)
                    
                    all_articles.extend(items)
                    print(f" - 已獲取 {len(items)} 篇文章，累計: {len(all_articles)}")
                    
                    if next_offset is not None:
                        params['offset'] = next_offset
                    else:
                        break
                else:
                    print(f" - 請求失敗: {response.status_code}")
                    break
                    
            except Exception as e:
                print(f" - 請求出錯: {e}")
                break
            
            request_count += 1
            time.sleep(0.5)
        
        return all_articles[:count]
    
    def filter_yesterday_articles(self, articles: List[Dict]) -> List[Dict]:
        """
        Filter articles published yesterday (Hong Kong timezone UTC+8).
        
        Args:
            articles: List of raw article items
            
        Returns:
            List of articles published yesterday
        """
        yesterday = (datetime.now() - timedelta(days=1)).date()
        yesterday_str = yesterday.strftime("%Y-%m-%d")
        
        print(f"\n正在篩選 {yesterday_str} 的文章...")
        
        yesterday_articles = []
        
        for item in articles:
            article_data = item.get('data', {})
            publish_timestamp = article_data.get('publishTime', None)
            
            if publish_timestamp:
                try:
                    # Convert to Hong Kong time
                    dt_utc = datetime.utcfromtimestamp(publish_timestamp)
                    dt_hk = dt_utc + timedelta(hours=8)
                    pub_date_hk = dt_hk.date()
                    
                    if pub_date_hk == yesterday:
                        article_data['publish_time_hk'] = dt_hk.strftime("%Y-%m-%d %H:%M:%S")
                        yesterday_articles.append(article_data)
                        
                except Exception as e:
                    print(f" - 解析時間出錯: {e}")
        
        print(f"找到 {len(yesterday_articles)} 篇昨天的文章")
        return yesterday_articles
    
    def articles_to_documents(self, articles: List[Dict]) -> List[Document]:
        """
        Convert articles to LangChain Document objects.
        
        Args:
            articles: List of article data
            
        Returns:
            List of Document objects
        """
        docs = []
        
        for article in articles:
            title = article.get('title', '')
            url = article.get('canonicalUrl', '')
            content = article.get('description', '')
            publish_time = article.get('publish_time_hk', '')
            
            # Split content into paragraphs
            paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
            
            for j, para in enumerate(paragraphs):
                doc = Document(
                    page_content=para,
                    metadata={
                        "title": title,
                        "url": url,
                        "publish_time": publish_time,
                        "paragraph_id": j + 1,
                        "source": "hk01_daily_update"
                    }
                )
                docs.append(doc)
        
        return docs
    
    def update_vector_database(self, new_docs: List[Document]) -> bool:
        """
        Update the vector database with new documents.
        
        Args:
            new_docs: List of new Document objects
            
        Returns:
            True if successful, False otherwise
        """
        if not new_docs:
            print("沒有新文章需要添加")
            return False
        
        try:
            print(f"\n正在更新向量數據庫...")
            print(f" - 添加 {len(new_docs)} 個新文檔")
            
            # Check if database exists
            db_path = Path(self.persist_directory)
            
            if db_path.exists():
                # Load existing database and add new documents
                vectorstore = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self
                )
                vectorstore.add_documents(new_docs)
                print(" - 已添加到現有數據庫")
            else:
                # Create new database
                vectorstore = Chroma.from_documents(
                    new_docs,
                    self,
                    persist_directory=self.persist_directory,
                    collection_metadata={"hnsw:space": "cosine"}
                )
                print(" - 已創建新數據庫")
            
            print("向量數據庫更新完成！")
            return True
            
        except Exception as e:
            print(f"更新數據庫出錯: {e}")
            return False
    
    def run_daily_update(self) -> Dict:
        """
        Run the complete daily update process.
        
        Returns:
            Summary dictionary
        """
        print("=" * 50)
        print(f"每日更新開始: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 50)
        
        # Step 1: Fetch latest articles
        articles = self.fetch_latest_articles(count=12)
        
        # Step 2: Filter for yesterday's articles
        yesterday_articles = self.filter_yesterday_articles(articles)
        
        # Step 3: Convert to documents
        docs = self.articles_to_documents(yesterday_articles)
        
        # Step 4: Update vector database
        success = self.update_vector_database(docs)
        
        # Summary
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_fetched": len(articles),
            "yesterday_articles": len(yesterday_articles),
            "documents_added": len(docs),
            "success": success
        }
        
        print("\n" + "=" * 50)
        print("更新摘要:")
        print(f" - 獲取文章總數: {summary['total_fetched']}")
        print(f" - 昨日文章數: {summary['yesterday_articles']}")
        print(f" - 新增文檔數: {summary['documents_added']}")
        print(f" - 更新狀態: {'成功' if success else '失敗'}")
        print("=" * 50)
        
        return summary


def schedule_daily_update(updater: DailyUpdater, run_time: str = "00:00"):
    """
    Schedule daily updates at the specified time.
    
    Args:
        updater: DailyUpdater instance
        run_time: Time to run daily update (HH:MM format)
    """
    print(f"已設定每日 {run_time} 自動更新")
    schedule.every().day.at(run_time).do(updater.run_daily_update)
    
    # Keep the scheduler running
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="FraudGuard HK 每日數據庫更新腳本")
    parser.add_argument(
        "--schedule", 
        action="store_true",
        help="啟用定時任務模式（每日 00:00 執行）"
    )
    parser.add_argument(
        "--time",
        default="00:00",
        help="定時執行時間（默認 00:00）"
    )
    parser.add_argument(
        "--db-path",
        default="./chroma_hk01_scam_db",
        help="向量數據庫路徑"
    )
    
    args = parser.parse_args()
    
    # Create updater
    updater = DailyUpdater(persist_directory=args.db_path)
    
    if args.schedule:
        # Run as scheduled service
        print("啟動定時更新服務...")
        schedule_daily_update(updater, args.time)
    else:
        # Run once
        updater.run_daily_update()
