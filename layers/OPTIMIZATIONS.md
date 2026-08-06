## Optimisation layer works in RAG and CAG pipeline processes.

### Optmisation in RAG and CAG methods for documents

1. Use of Smart Chunking and avoid fixed sized chunks
2. Sementic Chunking by spliting heading, paragraphs, and topic shifts
3. Preserve Metadata in DB or any other structured form
4. Hybrid Searching by combining vector and keyword searching
5. It uses LangChain `MultiQueryRetriver` or `SelfQueryRetriver` for hybrid setups
6. **Context Compression by summerize retrived chunks before passing them to main LLM (Token Saving) like 5 x 300 tokens into 5 x 50 tokens summeries**
7. **Caching and Batching cache embeddings and responses for repeated queries and batch retrival requests to reduce latency**

#### Risks that occurs in optimisation

1. Garbage in and out due to poor chunking or unclear data
2. Optimisation make slower to response may take more miliseconds
3. Over compresion cause critical information from data due to summerize more data.
