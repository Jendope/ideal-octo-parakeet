# Sprint Backlog – TAN James Anthroi (Weeks 19–28)

> New entries to be merged into the main Periodic Work Report table.

---

## Week 19 (Feb 15th – Feb 21st)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Formulated a targeted plan based on supervisor feedback from the interim presentation. <br>• Began studying how backend architecture works — server-side logic, API calls, and request/response flow — to understand what is needed for the fraud detection system's deployment. <br>• Reviewed options for frontend-backend linkage and noted LangChain integration hurdles to address in upcoming weeks. |
| **Status** | Completed |
| **Useful information and links** | Fraud R1 repo: https://github.com/kaustpradalab/Fraud-R1 · MCP spec v0.3: https://modelcontextprotocol.io/specification |
| **Planned tasks for next week** | • Continue studying backend deployment options. <br>• Research suitable platforms for hosting the web UI and the backend API. |

---

## Week 20 (Feb 22nd – Feb 28th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Continued studying backend architecture. <br>• Watched YouTube tutorials and read online articles; discovered that **Vercel** can be used for frontend/UI web deployment. <br>• Discovered that **Render** is the corresponding platform for backend hosting. <br>• Searched for small example projects that deploy on both Vercel and Render to understand the end-to-end workflow. <br>• Started using **Claude Code** as the primary AI assistant and **Qwen** for supplementary guidance — found it easier to tailor explanations to personal understanding level than reading books. |
| **Status** | Completed |
| **Useful information and links** | Vercel (frontend hosting): https://vercel.com <br>Render (backend hosting): https://render.com <br>AI tools used: Claude Code, Qwen |
| **Planned tasks for next week** | • Attempt the Vercel deployment for the project web page. <br>• Explore Android app development as a potential delivery mechanism. |

---

## Week 21 (Mar 1st – Mar 7th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Began searching for Android app development tutorials to explore a mobile delivery path for the fraud detection tool. <br>• Encountered technical problems with Android development setup; required additional days to resolve. <br>• Continued AI-assisted learning with Claude Code and Qwen to work through errors and understand underlying logic. |
| **Status** | Completed |
| **Useful information and links** | AI tools used: Claude Code, Qwen |
| **Planned tasks for next week** | • Continue troubleshooting Android development issues. <br>• Begin drafting initial UI concept with elderly user accessibility in mind. |

---

## Week 22 (Mar 8th – Mar 14th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Continued troubleshooting Android app development issues (problem still required more time). <br>• Began drafting initial UI layout concepts with ease-of-use for elderly users as a key requirement (larger fonts, simple navigation, clear call-to-action). <br>• Continued using Claude Code (primary) and Qwen (supplementary) for AI-assisted learning and debugging. |
| **Status** | Completed |
| **Useful information and links** | AI tools used: Claude Code, Qwen |
| **Planned tasks for next week** | • Study MCP server documentation. <br>• Consult groupmates on deployment strategy for the embedding model. |

---

## Week 23 (Mar 15th – Mar 21st)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Studied the Model Context Protocol (MCP) server build documentation: https://modelcontextprotocol.io/docs/develop/build-server <br>• Consulted groupmates on deployment strategy; the team decided to use **ngrok** and explore other platforms to host the embedding model, as Render was causing recurring problems — TAN Xiuhao investigated and found a working alternative solution. <br>• Continued iterating on the UI layout to improve accessibility for elderly users. |
| **Status** | Completed |
| **Useful information and links** | MCP build-server docs: https://modelcontextprotocol.io/docs/develop/build-server <br>ngrok: https://ngrok.com |
| **Planned tasks for next week** | • Research OCR solutions to replace Qwen. <br>• Begin Vercel deployment trials. |

---

## Week 24 (Mar 22nd – Mar 28th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Researched OCR solutions: the originally used Qwen model had a bug when run for extended periods; discovered **GLM**, a newly released LLM that offers free tokens for trying their models — particularly strong for OCR tasks — and identified it as a viable replacement. <br>• Began initial trials of the Vercel deployment for the project information web page. <br>• Continued UI refinements targeting elderly user accessibility. <br>• Continued using Claude Code and Qwen for AI-assisted learning. |
| **Status** | Completed |
| **Useful information and links** | GLM (free OCR tokens): https://open.bigmodel.cn <br>AI tools used: Claude Code, Qwen |
| **Planned tasks for next week** | • Complete and publish the Vercel deployment. <br>• Put all project information on the web page. <br>• Evaluate GLM OCR integration with the pipeline. |

---

## Week 25 (Mar 29th – Apr 4th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Successfully deployed the project information page on Vercel and published all project information on the site: https://fraud-guard-4r9s14j5s-anthrois-projects.vercel.app <br>• Evaluated GLM OCR with free token tier; confirmed it resolves the long-session bug seen in Qwen. <br>• Continued iterating on the UI to ensure it is intuitive and accessible for elderly users. <br>• Continued using Claude Code and Qwen for troubleshooting and guidance. |
| **Status** | Completed |
| **Useful information and links** | Vercel deployment: https://fraud-guard-4r9s14j5s-anthrois-projects.vercel.app <br>GLM OCR: https://open.bigmodel.cn |
| **Planned tasks for next week** | • Further UI accessibility improvements. <br>• Follow up on Android app development. <br>• Continue assessing the overall deployment architecture with the team. |

---

## Week 26 (Apr 5th – Apr 11th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Continued iterating on the UI layout and interaction flow to make it more intuitive and accessible for elderly users. <br>• Continued troubleshooting Android app development tutorial issues; the problem still required additional days. <br>• Continued using Claude Code (primary) and Qwen (supplementary) for AI-assisted learning and error resolution. |
| **Status** | Completed |
| **Useful information and links** | AI tools used: Claude Code, Qwen |
| **Planned tasks for next week** | • Begin revising project documentation/report to reflect technology changes. <br>• Further UI refinements. |

---

## Week 27 (Apr 12th – Apr 18th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Revised and updated the project documentation/report to reflect recent technology changes (platform switches and OCR model change from Qwen to GLM). <br>• Continued UI refinements for elderly user accessibility (layout, font sizes, simplified interaction). <br>• Continued using Claude Code and Qwen for AI-assisted guidance. |
| **Status** | Completed |
| **Useful information and links** | AI tools used: Claude Code, Qwen |
| **Planned tasks for next week** | • Finalize deployment decision with the team. <br>• Prepare demo for the WhatsApp bot and web app. <br>• Complete remaining documentation revisions. |

---

## Week 28 (Apr 19th – Apr 25th)

| Field | Details |
|---|---|
| **Team Member** | TAN James Anthroi |
| **Tasks completed this week** | • Team finalized the deployment decision: the two delivery platforms are (1) the **WhatsApp bot** (proxy-based chatbot) and (2) the **web app** deployed on Vercel. <br>• Conducted a demo showcasing both the WhatsApp bot and the web interface to verify end-to-end functionality. <br>• Completed remaining revisions to the project documentation/report. <br>• Completed final UI accessibility refinements on the web app. |
| **Status** | Completed |
| **Useful information and links** | WhatsApp bot (Hugging Face): https://huggingface.co/spaces/TANjacky/WhatsAppbot <br>Web app (Vercel): https://fraud-guard-4r9s14j5s-anthrois-projects.vercel.app |
| **Planned tasks for next week** | • Prepare for final project submission and presentation. |
