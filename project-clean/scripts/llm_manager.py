import os
import json
import re
from collections import defaultdict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv(os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "config", ".env")))

DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")
if not DASHSCOPE_API_KEY:
    raise ValueError("请在 .env 文件中设置 DASHSCOPE_API_KEY")

llm = ChatOpenAI(
    # model="qwen3.5-flash",
    model="qwen3.5-plus-2026-02-15",
    api_key=DASHSCOPE_API_KEY,
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    temperature=0.0
)

prompt_template = """
你是一名反诈专家。请根据以下用户描述,近期真实诈骗新闻片段以及，判断用户描述的是否属于已知诈骗模式。

用户描述：
{sms}

相关近期诈骗新闻片段（来自 HK01）：
{retrieved_doc}

片段所属新闻：
{article}

请重点分析：
- 是否涉及相同手法（如“验证身份”、“紧急转账”、“中奖”等）
- 是否模仿官方机构（银行、公安、快递）
- 是否诱导点击链接/下载APP/提供验证码/拨打陌生电话
- 是否符合常见诈骗特征如：诱惑性高回报/制造紧急恐慌/非接触式联络/要求资金转账/提供第三方链接

请严格按照以下 JSON 格式输出（不要任何其他文字）：
{{"score": 整数（0-10）, "reason": "简要理由（50字内）"}}
"""
prompt = ChatPromptTemplate.from_template(prompt_template)


def predict_fraud(sms_text, vectorstore):
    """
    sms_text: 用户输入的文本
    vectorstore: 从 database_manager 传入的数据库实例
    """
    # 检索相似文档并获取分数
    docs_with_scores = vectorstore.similarity_search_with_score(sms_text, k=3)

    min_distance = min(score for _, score in docs_with_scores) if docs_with_scores else 1.0
    max_sim = 1 - min_distance

    news = "无相关新闻参考"
    para = "无"

    if max_sim < 0.7:
        formatted_prompt = prompt.format(sms=sms_text, retrieved_doc="无", article="无")
    else:
        # 整理检索段落
        para = "\n".join([doc.page_content for doc, _ in docs_with_scores])

        # 按文章分组，避免重复
        article_groups = defaultdict(list)
        for doc, distance in docs_with_scores:
            aid = doc.metadata.get("article_id", "Unknown")
            cos_sim = 1.0 - distance
            article_groups[aid].append((doc, cos_sim))

        news_parts = []
        for aid, docs_in_article in article_groups.items():
            first_doc, _ = docs_in_article[0]
            title = first_doc.metadata.get("title", "无标题")
            url = first_doc.metadata.get("url", "")
            combined_para = "\n\n".join(
                f"[相似度: {cos_sim:.2f}] {doc.page_content}"
                for doc, cos_sim in docs_in_article
            )
            news_parts.append(
                f"【新闻 #{aid}】\n标题：{title}\n链接：{url}\n\n相关段落：\n{combined_para}"
            )
        news = "\n---\n".join(news_parts)
        formatted_prompt = prompt.format(sms=sms_text, retrieved_doc=para, article=news)

    # 调用大模型
    response = llm.invoke(formatted_prompt)
    output = response.content.strip()

    # 解析 JSON 结果
    try:
        # 清理可能存在的 Markdown 标签
        clean_output = re.sub(r'```json\s*|\s*```', '', output)
        result = json.loads(clean_output)
        score = max(0, min(10, int(result["score"])))
        reason = result.get("reason", "无理由").strip()
    except Exception:
        # 容错处理：正则提取数字
        numbers = re.findall(r'\d+', output)
        score = int(numbers[0]) if numbers else 5
        reason = f"解析失败，原始返回：{output[:50]}"

    return {
        "probability": score / 10.0,
        "reason": reason,
        "evidence": news
    }