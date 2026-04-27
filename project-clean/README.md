# Hong Kong Fraud Detection with RAG/LLM

This project detects likely scam messages in a Hong Kong context by retrieving relevant scam-news evidence (RAG) and asking an LLM to produce a risk score and justification.

## Folder structure

```text
project-clean/
├── notebooks/
│   ├── HK01_news_webScraping.ipynb
│   ├── main.ipynb
│   └── Daily_database_update_script.ipynb
├── scripts/
│   ├── app.py
│   ├── database_manager.py
│   ├── llm_manager.py
│   ├── wechatbot_main.py
│   └── templates/
├── data/
│   ├── hk01_scam_articles.md
│   └── daily_new_articles.md
├── vectorstore/
│   └── chroma_hk01_scam_db/
├── config/
│   ├── .env
│   └── requirements.txt
├── docs/
└── README.md
```

## Setup

1. Create and activate a virtual environment:
   - `python -m venv .venv`
   - macOS/Linux: `source .venv/bin/activate`
   - Windows (PowerShell): `.venv\\Scripts\\Activate.ps1`
2. Install dependencies:
   - `pip install -r config/requirements.txt`
3. Configure environment variables:
   - Edit `config/.env`
   - Add required keys such as `DASHSCOPE_API_KEY` and webhook tokens if needed.
4. Run notebooks from `notebooks/` for scraping and update workflows.
5. Run API/service scripts from `scripts/` when needed.

## How to update the knowledge base

1. Use `notebooks/HK01_news_webScraping.ipynb` to scrape/collect latest fraud-related articles.
2. Append or refresh article outputs in `data/hk01_scam_articles.md` and `data/daily_new_articles.md`.
3. Run `notebooks/Daily_database_update_script.ipynb` (or equivalent script logic) to rebuild/update embeddings.
4. Persist the updated Chroma database under `vectorstore/chroma_hk01_scam_db/`.
5. Validate by running the analysis flow (notebook or `scripts/app.py`) against sample messages.
