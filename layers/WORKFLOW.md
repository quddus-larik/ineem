### 1. Document Loading & Layout Parsing (PDF $\rightarrow$ Structured Text)

* **`pdf-parse` / `pdf2json**` — Lightweight Node.js PDF text & layout extraction packages.
* **`pdfjs-dist`** — Mozilla’s official PDF parser for complex rendering & coordinate-level text position extraction.
* **`@docling/docling-ts` / REST API (`docling-serve`)** — Converts complex multi-column PDFs and tables into LLM-optimized Markdown.
* **`@unstructured/unstructured-js`** — Enterprise document partitioner for structured Markdown parsing via API/SDK.

---

### 2. Schema Definition & Validation

* **`zod`** — TypeScript-first schema validation used to enforce strict types and pass structural schemas directly into LangChain's structured output.

---

### 3. LangChain & LLM Orchestration

* **`@langchain/core`** — Base interfaces, prompt templates (`ChatPromptTemplate`), output parsers, and runnable chains.
* **`@langchain/openai`** — Native OpenAI client bindings supporting `.withStructuredOutput()` via Function Calling / JSON Schema.
* **`@langchain/langgraph`** — Stateful multi-agent workflow runtime for cyclic loops, checkpointers (`MemorySaver`), and human-in-the-loop steps.
* **`@langchain/textsplitters`** — Structural chunking libraries (`RecursiveCharacterTextSplitter`, `MarkdownHeaderTextSplitter`).

---

### 4. Vector DB & Embeddings

* **`@neondatabase/serverless`** — Postgres driver for querying Neon vector stores.
* **`@langchain/community`** — Native Postgres/Neon `pgvector` store wrappers (`NeonPostgres`).

---

### 5. Core Backend & Mobile Stack

* **`express` + `cors**` — Node.js / TypeScript REST API framework.
* **`@supabase/supabase-js`** — Auth middleware, user token validation, and storage file bucket management.
* **`expo` + `expo-router**` — Mobile client navigation and view layer.
