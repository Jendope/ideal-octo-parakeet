# HK01 News Web Scraper for FraudGuard HK
# Scrapes fraud-related news from HK01 and saves to database

import os
import re
import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path

class HK01Scraper:
    """
    Scraper for HK01 fraud-related news articles.
    Targets the "詐騙" (fraud) category.
    """
    
    def __init__(self, output_dir: str = "./data"):
        self.base_url = "https://web-data.api.hk01.com/v2/issues/10221/relatedBlock/0/"
        self.headers = {
            'Referer': 'https://www.hk01.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
        }
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def fetch_articles(self, max_articles: int = 1000, delay: float = 0.5) -> List[Dict]:
        """
        Fetch fraud-related articles from HK01.
        
        Args:
            max_articles: Maximum number of articles to fetch
            delay: Delay between requests to avoid rate limiting
            
        Returns:
            List of article dictionaries
        """
        all_articles = []
        params = {
            'limit': 6,
            'offset': 0,
            'bucketId': '00000'
        }
        
        request_count = 0
        max_requests = (max_articles // 6) + 10  # Safety margin
        
        print("開始爬取詐騙新聞...")
        
        while len(all_articles) < max_articles and request_count < max_requests:
            print(f"正在發送第 {request_count + 1} 次 API 請求...")
            
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
                    
                    print(f" - 獲取了 {len(items)} 篇文章")
                    all_articles.extend(items)
                    
                    if next_offset is not None:
                        params['offset'] = next_offset
                        print(f" - 下一頁 offset: {next_offset}")
                    else:
                        print(" - 沒有更多文章了")
                        break
                        
                else:
                    print(f" - 請求失敗，狀態碼: {response.status_code}")
                    break
                    
            except Exception as e:
                print(f" - 請求出錯: {e}")
                break
                
            request_count += 1
            time.sleep(delay)
            
        print(f"\n總共獲取了 {len(all_articles)} 篇文章")
        return all_articles[:max_articles]
    
    def parse_article(self, item: Dict) -> Optional[Dict]:
        """
        Parse a single article item.
        
        Args:
            item: Raw article data from API
            
        Returns:
            Parsed article dictionary or None if parsing fails
        """
        try:
            article_data = item.get('data', {})
            
            title = article_data.get('title', '')
            url = article_data.get('canonicalUrl', '')
            publish_timestamp = article_data.get('publishTime', None)
            
            # Convert timestamp to Hong Kong time
            publish_time_hk = ""
            if publish_timestamp:
                dt_utc = datetime.utcfromtimestamp(publish_timestamp)
                dt_hk = dt_utc + timedelta(hours=8)
                publish_time_hk = dt_hk.strftime("%Y-%m-%d %H:%M:%S")
            
            # Get article content (need to fetch full article)
            content = article_data.get('description', '')
            
            # Get tags/categories
            tags = []
            if 'tags' in article_data:
                tags = [tag.get('name', '') for tag in article_data.get('tags', [])]
            
            return {
                'title': title,
                'url': url,
                'publish_time': publish_time_hk,
                'content': content,
                'tags': tags,
                'category': self._classify_fraud_type(title, content, tags)
            }
            
        except Exception as e:
            print(f"解析文章出錯: {e}")
            return None
    
    def _classify_fraud_type(self, title: str, content: str, tags: List[str]) -> str:
        """
        Classify the type of fraud based on content.
        
        Returns:
            Fraud category string
        """
        text = (title + ' ' + content + ' ' + ' '.join(tags)).lower()
        
        if any(kw in text for kw in ['電話', '來電', '假冒', '官員', '公安']):
            return '電話詐騙'
        elif any(kw in text for kw in ['投資', '股票', '理財', '高回報']):
            return '投資詐騙'
        elif any(kw in text for kw in ['感情', '網戀', '交友', '裸聊']):
            return '感情詐騙'
        elif any(kw in text for kw in ['中獎', '抽獎', '優惠', '免費']):
            return '中獎詐騙'
        elif any(kw in text for kw in ['釣魚', '連結', '網站', '銀行']):
            return '釣魚詐騙'
        elif any(kw in text for kw in ['淘寶', '購物', '網購', '付款']):
            return '網購詐騙'
        elif any(kw in text for kw in ['借貸', '貸款', '財務']):
            return '借貸詐騙'
        elif any(kw in text for kw in ['求職', '工作', '招聘', '兼職']):
            return '求職詐騙'
        else:
            return '其他詐騙'
    
    def save_to_markdown(self, articles: List[Dict], filename: str = "hk01_scam_articles.md"):
        """
        Save articles to markdown file.
        
        Args:
            articles: List of parsed articles
            filename: Output filename
        """
        output_path = self.output_dir / filename
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("# HK01 詐騙新聞資料庫\n\n")
            f.write(f"# 最後更新時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"# 文章總數: {len(articles)}\n\n")
            
            for i, article in enumerate(articles, 1):
                if article is None:
                    continue
                    
                f.write("---\n\n")
                f.write(f"## [{article['title']}]({article['url']})\n\n")
                f.write(f"**發布時間**: {article['publish_time']}\n\n")
                f.write(f"**分類**: {article['category']}\n\n")
                
                if article['tags']:
                    f.write(f"**標籤**: {', '.join(article['tags'])}\n\n")
                
                f.write(f"**內容摘要**:\n{article['content']}\n\n")
        
        print(f"已保存 {len(articles)} 篇文章到 {output_path}")
        return str(output_path)
    
    def save_to_json(self, articles: List[Dict], filename: str = "hk01_scam_articles.json"):
        """
        Save articles to JSON file.
        
        Args:
            articles: List of parsed articles
            filename: Output filename
        """
        output_path = self.output_dir / filename
        
        # Filter out None values
        valid_articles = [a for a in articles if a is not None]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'last_updated': datetime.now().isoformat(),
                'total_articles': len(valid_articles),
                'articles': valid_articles
            }, f, ensure_ascii=False, indent=2)
        
        print(f"已保存 {len(valid_articles)} 篇文章到 {output_path}")
        return str(output_path)


def run_scraper(max_articles: int = 1000, output_format: str = "both"):
    """
    Main function to run the scraper.
    
    Args:
        max_articles: Maximum number of articles to fetch
        output_format: "markdown", "json", or "both"
    
    Returns:
        List of parsed articles
    """
    scraper = HK01Scraper(output_dir="./data")
    
    # Fetch raw articles
    raw_articles = scraper.fetch_articles(max_articles=max_articles)
    
    # Parse articles
    parsed_articles = []
    for item in raw_articles:
        parsed = scraper.parse_article(item)
        if parsed:
            parsed_articles.append(parsed)
    
    # Save to files
    if output_format in ["markdown", "both"]:
        scraper.save_to_markdown(parsed_articles)
    if output_format in ["json", "both"]:
        scraper.save_to_json(parsed_articles)
    
    return parsed_articles


if __name__ == "__main__":
    # Run with default settings
    articles = run_scraper(max_articles=1000, output_format="both")
    print(f"\n完成！共處理 {len(articles)} 篇文章")
