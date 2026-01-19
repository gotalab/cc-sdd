# Research & Design Decisions

---
**Purpose**: This document records research findings, architecture considerations, and rationale supporting the design of the customer support RAG backend API.

**Usage**:
- Record discovery phase research activities and outcomes
- Document design decision trade-offs that are too detailed for design.md
- Provide reference materials and evidence for future audits or reuse
---

## Summary
- **Feature**: `customer-support-rag-backend`
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - RAG implementation has established progressive architecture patterns (Simple RAG → Agentic RAG), with this project adopting the modular RAG pattern
  - SSE (Server-Sent Events) is standard for LLM streaming, being lighter weight and more HTTP-compatible than WebSocket
  - Vector databases require selection based on use case (Pinecone: fully managed, Qdrant: advanced filtering, pgvector: PostgreSQL integration)
  - OpenAI text-embedding-3 offers excellent balance of performance and cost for embedding generation (alternative: sentence-transformers for local deployment)
  - For FastAPI SSE implementation, `sse-starlette` library and async generators are recommended

## Research Log

### RAG Architecture Pattern Investigation

- **Context**: Investigated latest architecture patterns as of 2025 to determine RAG system design approach
- **Sources Consulted**:
  - [RAG Architecture Explained: A Comprehensive Guide [2025] | Orq.ai](https://orq.ai/blog/rag-architecture)
  - [8 RAG Architectures You Should Know in 2025 | Humanloop](https://humanloop.com/blog/rag-architectures)
  - [RAG in 2025: From Quick Fix to Core Architecture | Medium](https://medium.com/@hrk84ya/rag-in-2025-from-quick-fix-to-core-architecture-9a9eb0a42493)
  - [IBM Architecture Patterns - Retrieval Augmented Generation](https://www.ibm.com/architectures/patterns/genai-rag)

- **Findings**:
  - **Basic Architecture**: Simple RAG is the fundamental pattern of retrieving relevant documents from a static database and passing them to LLM
  - **Advanced Patterns**:
    - Simple RAG with Memory: Maintains conversation history to achieve context continuity
    - Agentic RAG: Autonomous agents perform task planning and execution
    - Long RAG: Handles large volumes of documents by processing sections/documents rather than chunking
    - Self-RAG: Advanced framework with self-judgment of retrieval timing, relevance evaluation, and output critique
  - **Modular RAG Pattern**: Separating Retriever, Generator, and Orchestration logic facilitates debugging and updates (recommended)
  - **Retrieval Strategy**: Hybrid of vector search and keyword search is effective for balancing semantic understanding and precise term matching
  - **2025 Trends**: RAG is evolving from a temporary measure for hallucination mitigation to a foundational pattern for reliable, dynamically-grounded AI systems

- **Implications**:
  - This project adopts the modular RAG pattern, designing Retriever (search), Generator (generation), and Orchestrator (control) as independent components
  - Initial implementation is Simple RAG with boundaries set to allow future Memory functionality and Agentic expansion
  - Adopt hybrid search (vector + keyword) to improve document search accuracy

### LLM Streaming API Investigation

- **Context**: Investigated implementation methods for real-time streaming of LLM responses to improve user experience
- **Sources Consulted**:
  - [How to Stream LLM Responses Using SSE | Apidog](https://apidog.com/blog/stream-llm-responses-using-sse/)
  - [The Streaming Backbone of LLMs: Why SSE Still Wins in 2025 | Procedure Technologies](https://procedure.tech/blogs/the-streaming-backbone-of-llms-why-server-sent-events-(sse)-still-wins-in-2025)
  - [How streaming LLM APIs work | Simon Willison's TILs](https://til.simonwillison.net/llms/streaming-llm-apis)
  - [OpenAI SSE Streaming API | Better Programming](https://betterprogramming.pub/openai-sse-sever-side-events-streaming-api-733b8ec32897)

- **Findings**:
  - **SSE Advantages**: Compared to WebSocket or gRPC, SSE is lightweight, operates over standard HTTP, and has automatic reconnection capability
  - **Protocol Specification**: Events formatted as `data: <your_data>\n\n`, returning Content-Type: text/event-stream header
  - **OpenAI Implementation**: Enable streaming with `stream: true` flag, progressive token delivery via "delta" object, completion notification with `[DONE]` message
  - **Best Practices**:
    - Properly handle response fragmentation (Auto-Merge feature recommended)
    - Test with different LLM models (OpenAI, Gemini, DeepSeek) to ensure compatibility
    - Visualize stream progress during debugging with Timeline View
    - Leverage JSONPath or Post-Processor scripts for non-standard format support
  - **UX Effect**: "Latency Theater" improves perceived user speed through incremental feedback even with same total generation time

- **Implications**:
  - This API will stream LLM responses using SSE protocol (WebSocket not adopted)
  - Utilize OpenAI Chat Completions API's `stream: true` mode
  - Error handling requires auto-reconnect on connection loss and graceful shutdown implementation
  - Infrastructure consideration: When using Nginx, `X-Accel-Buffering: no` header setting is mandatory

### Vector Database Selection Investigation

- **Context**: Selecting vector database to achieve semantic search
- **Sources Consulted**:
  - [The 7 Best Vector Databases in 2025 | DataCamp](https://www.datacamp.com/blog/the-top-5-vector-databases)
  - [Vector Database Comparison: Pinecone vs Weaviate vs Qdrant vs FAISS vs Milvus vs Chroma | Medium](https://medium.com/tech-ai-made-easy/vector-database-comparison-pinecone-vs-weaviate-vs-qdrant-vs-faiss-vs-milvus-vs-chroma-2025-15bf152f891d)
  - [Pinecone vs Qdrant vs Weaviate | Xenoss](https://xenoss.io/blog/vector-database-comparison-pinecone-qdrant-weaviate)
  - [Top Vector Database for RAG: Qdrant vs Weaviate vs Pinecone | AIM Multiple](https://research.aimultiple.com/vector-database-for-rag/)

- **Findings**:
  - **Pinecone**:
    - Performance: Insertion speed 50k ops/sec, query speed 5k ops/sec (top benchmark)
    - Features: Fully managed service, billions of vectors support, minimal operational overhead
    - Security: SOC 2 Type II, ISO 27001, GDPR compliant, HIPAA certified
    - Application: Optimal for turnkey scale requirements
  - **Weaviate**:
    - Features: Knowledge graph functionality, GraphQL interface
    - Application: When combining vector search with complex data relationships
  - **Qdrant**:
    - Performance: Insertion speed 45k ops/sec, query speed 4.5k ops/sec
    - Features: Rust implementation, advanced metadata filtering capabilities
    - Application: When combining vector similarity with complex metadata filtering
  - **pgvector**:
    - Features: Operates as PostgreSQL extension, integrates structured data with vector search
    - Constraints: Slower than dedicated vector DBs at scale, requires Postgres tuning
    - Application: When adding vector search to existing PostgreSQL environment
  - **Selection Guidance**: Workload-appropriate choice is important (Pinecone: turnkey scale, Weaviate: OSS flexibility, Qdrant: complex filtering, pgvector: SQL integration)

- **Implications**:
  - Recommend Pinecone or Qdrant for initial implementation (select based on requirements)
  - Pinecone: Fully managed with low operational burden, high scalability
  - Qdrant: Self-hostable, effective when cost optimization and data sovereignty are important
  - pgvector is an alternative option when existing PostgreSQL environment is available
  - Implement retry logic and circuit breaker pattern for connection failures

### Embedding Model Selection Investigation

- **Context**: Investigated embedding models for vectorizing documents and inquiries
- **Sources Consulted**:
  - [13 Best Embedding Models in 2025 | Elephas](https://elephas.app/blog/best-embedding-models)
  - [Embedding Models Comparison: OpenAI vs Sentence-Transformers | Markaicode](https://markaicode.com/embedding-models-comparison-openai-sentence-transformers/)
  - [OpenAI's Text Embeddings v3 | Pinecone](https://www.pinecone.io/learn/openai-embeddings-v3/)
  - [New embedding models and API updates | OpenAI](https://openai.com/index/new-embedding-models-and-api-updates/)

- **Findings**:
  - **OpenAI text-embedding-3**:
    - Models: text-embedding-3-small (cost efficient), text-embedding-3-large (high performance)
    - Pricing: text-embedding-3-small $0.02/million tokens, text-embedding-3-large $0.13/million tokens
    - Dimensions: text-embedding-3-small up to 8191 tokens, text-embedding-3-large up to 3072 dimensions
    - Performance: Top scores on MTEB (Massive Text Embedding Benchmark)
    - Rate Limits: Based on Usage Tier (Tier 5: 10M TPM, 10k RPM)
    - Integration: Simple REST API, no model management required
  - **Sentence-Transformers (open source)**:
    - Models: all-MiniLM-L6-v2 (384 dimensions, balanced), all-mpnet-base-v2 (768 dimensions, high accuracy)
    - Cost: Completely free, local execution possible
    - Deployment: Complete data control, no external API calls
    - Performance: Fastest in latency tests even on CPU execution
  - **Recommendations**:
    - Semantic search/search accuracy priority: OpenAI embeddings recommended
    - Offline/privacy-focused environments: Sentence-Transformers recommended

- **Implications**:
  - Initial implementation adopts OpenAI text-embedding-3-small (excellent balance of cost and performance)
  - Design option to switch to text-embedding-3-large for high accuracy requirements
  - Maintain Sentence-Transformers local implementation as alternative when privacy requirements or cost optimization are important
  - Implement exponential backoff retry for rate limit mitigation

### FastAPI SSE Implementation Investigation

- **Context**: Investigated best practices for implementing SSE in Python backend
- **Sources Consulted**:
  - [Server-Sent Events with Python FastAPI | Medium](https://medium.com/@nandagopal05/server-sent-events-with-python-fastapi-f1960e0c8e4b)
  - [Real-Time Notifications in Python: Using SSE with FastAPI | Medium](https://medium.com/@inandelibas/real-time-notifications-in-python-using-sse-with-fastapi-1c8c54746eb7)
  - [sse-starlette · PyPI](https://pypi.org/project/sse-starlette/)
  - [Streaming Responses in FastAPI | Random Thoughts](https://hassaanbinaslam.github.io/posts/2025-01-19-streaming-responses-fastapi.html)

- **Findings**:
  - **Recommended Library**: `sse-starlette` provides production-ready implementation compliant with W3C SSE specification
  - **Async Generators**: Use FastAPI's async capabilities and async generators to improve scalability
  - **EventSourceResponse vs StreamingResponse**: EventSourceResponse is more suitable for SSE handling than basic StreamingResponse
  - **Connection Management**: Each SSE client uses 1 server thread/coroutine, so monitor connection count and memory usage in large systems and use I/O-optimized async servers (Uvicorn, Daphne)
  - **Infrastructure Considerations**:
    - When using Nginx, add `X-Accel-Buffering: no` header (buffered by default)
    - Confirm hosting environment supports streaming responses (servers requiring Content-Length are incompatible)
  - **Protocol Requirements**: Messages must be UTF-8 encoded, include `Cache-Control: no-cache` in headers
  - **ASGI Server**: Python's WSGI servers may not stream properly in some cases, so ASGI servers (Uvicorn, Daphne) are recommended

- **Implications**:
  - Implement with FastAPI + `sse-starlette` + Uvicorn combination
  - Use async generator pattern to stream LLM responses
  - Disable buffering in Nginx/load balancer configuration
  - Implement monitoring for connection count and memory usage

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Modular RAG | Separate Retriever, Generator, Orchestrator as independent components | Clear boundaries, test ease, progressive expansion possible, easier debugging | Requires adapter layer construction, inter-component communication overhead | Complies with 2025 best practices, supports future Agentic RAG expansion |
| Simple RAG | Simple flow integrating search and generation | Rapid implementation, low initial cost | Scalability constraints, difficult testing, unclear boundaries | Suitable for prototypes but not recommended for production |
| Hexagonal Architecture | Abstract core domain with ports & adapters | High test ease, separation from external dependencies | High initial design cost, excessive for small projects | Effective in enterprise environments but excessive for this project scale |

**Selection Result**: Adopt Modular RAG pattern
- Addresses requirement complexity (search, generation, streaming, error handling)
- Each component can be tested and deployed independently
- Boundary design supports future expansion (Memory, Agentic functionality)

## Design Decisions

### Decision: `Streaming Protocol Selection (SSE vs WebSocket)`

- **Context**: Selecting protocol to deliver LLM responses to clients in real-time
- **Alternatives Considered**:
  1. **Server-Sent Events (SSE)** — Lightweight unidirectional streaming, standard HTTP, auto-reconnect
  2. **WebSocket** — Bidirectional communication, stateful connection, more complex connection management

- **Selected Approach**: Server-Sent Events (SSE)
  - W3C standard protocol, Content-Type: text/event-stream
  - Use `sse-starlette` library in FastAPI
  - Progressive delivery of LLM responses using async generator pattern

- **Rationale**:
  - LLM responses are unidirectional delivery, so bidirectional communication is unnecessary
  - SSE operates over standard HTTP with high compatibility with existing infrastructure (CDN, load balancers)
  - Auto-reconnect feature facilitates recovery from connection loss
  - Simpler implementation and lower operational overhead compared to WebSocket

- **Trade-offs**:
  - **Benefits**: Lightweight, HTTP compatible, auto-reconnect, simple implementation, high infrastructure compatibility
  - **Compromises**: Unidirectional communication only (no issue as bidirectional not needed), browser connection limit (6 connections/domain, no practical issue)

- **Follow-up**:
  - Confirm `X-Accel-Buffering: no` setting in Nginx/load balancer
  - Implement monitoring for connection count and memory usage
  - Verify graceful shutdown and error notification implementation on connection loss

### Decision: `Vector Database Selection (Pinecone vs Qdrant vs pgvector)`

- **Context**: Selecting vector database for semantic search
- **Alternatives Considered**:
  1. **Pinecone** — Fully managed, high performance (50k insertion/sec), minimal operational burden
  2. **Qdrant** — Self-hostable, advanced filtering, Rust implementation
  3. **pgvector** — PostgreSQL extension, existing DB integration, low cost

- **Selected Approach**: Pinecone (initial implementation), maintain Qdrant as alternative option
  - Design with Pinecone as primary choice
  - Enable future switching to Qdrant/pgvector through interface abstraction

- **Rationale**:
  - Prioritize development speed and operational stability in initial phase
  - Pinecone is fully managed with guaranteed scalability and security (SOC 2, GDPR)
  - Qdrant is alternative when cost optimization or data sovereignty is required

- **Trade-offs**:
  - **Benefits (Pinecone)**: Zero operational burden, scalability guarantee, security compliance
  - **Compromises**: Vendor lock-in risk, pay-per-use costs, customization constraints
  - **Benefits (Qdrant)**: Self-hostable, cost control, advanced filtering
  - **Compromises**: Increased operational burden, scaling management required

- **Follow-up**:
  - Define VectorStore interface to enable switching between Pinecone/Qdrant/pgvector
  - Conduct cost estimation and scaling tests in early implementation phase
  - Design Qdrant migration path if self-hosting requirements arise

### Decision: `Embedding Model Selection (OpenAI vs Sentence-Transformers)`

- **Context**: Selecting embedding model for vectorizing documents and inquiries
- **Alternatives Considered**:
  1. **OpenAI text-embedding-3-small** — API-based, $0.02/million tokens, high accuracy
  2. **OpenAI text-embedding-3-large** — API-based, $0.13/million tokens, highest accuracy
  3. **Sentence-Transformers (all-MiniLM-L6-v2)** — Local execution, free, privacy protection

- **Selected Approach**: OpenAI text-embedding-3-small
  - Initial implementation uses text-embedding-3-small
  - Maintain option to switch to text-embedding-3-large for high accuracy requirements
  - Abstract implementation with EmbeddingService interface

- **Rationale**:
  - text-embedding-3-small offers excellent balance of cost and performance
  - No infrastructure management required due to API-based approach, high scalability
  - Top-class accuracy in MTEB benchmark

- **Trade-offs**:
  - **Benefits**: High accuracy, no infrastructure needed, easy integration, scalability
  - **Compromises**: API dependency, pay-per-use costs, rate limits, no offline support
  - **Alternative Benefits (Sentence-Transformers)**: Completely free, privacy protection, offline capable
  - **Alternative Compromises**: Infrastructure management required, slightly lower accuracy, scaling response needed

- **Follow-up**:
  - Implement exponential backoff retry for rate limit mitigation
  - Build cost monitoring dashboard
  - Design Sentence-Transformers migration path if privacy requirements become stricter

### Decision: `Backend Framework Selection (FastAPI)`

- **Context**: Selecting Python framework for RAG API backend
- **Alternatives Considered**:
  1. **FastAPI** — Fast, async support, type-safe, automatic documentation generation
  2. **Flask** — Simple, mature, rich ecosystem
  3. **Django** — Full-stack, ORM integration, admin panel

- **Selected Approach**: FastAPI
  - Run with Uvicorn (ASGI server)
  - Implement SSE with `sse-starlette` library
  - Type-safe request/response definition with Pydantic

- **Rationale**:
  - Async/await support enables efficient parallel processing of SSE streaming and LLM API calls
  - Type safety with Pydantic prevents implementation errors
  - Automatic OpenAPI documentation generation facilitates API specification management
  - Standard choice for Python API backends as of 2025

- **Trade-offs**:
  - **Benefits**: Fast, type-safe, async support, automatic documentation, modern development experience
  - **Compromises**: Less history than Flask, somewhat smaller ecosystem

- **Follow-up**:
  - Optimize Uvicorn production environment settings (worker count, timeouts)
  - Type-define all requests/responses with Pydantic models
  - Auto-generate OpenAPI documentation and coordinate with frontend development

## Risks & Mitigations

- **Risk 1: Service outage due to LLM API rate limit exceeded**
  - Mitigation: Implement exponential backoff retry, rate limit monitoring alerts, request queueing, failover configuration with multiple API keys/endpoints

- **Risk 2: Vector database connection failure**
  - Mitigation: Implement circuit breaker pattern, fallback search (keyword search), connection pooling and auto-retry, health check endpoint

- **Risk 3: Connection loss during streaming**
  - Mitigation: Leverage SSE auto-reconnect feature, implement graceful shutdown, send error events and client-side error handling, timeout settings

- **Risk 4: LLM error due to context window exceeded**
  - Mitigation: Token count and pre-validation, progressive truncation of lower-ranked documents, chunk size optimization, apply context compression techniques

- **Risk 5: Security vulnerabilities (Prompt Injection, PII leakage)**
  - Mitigation: Implement input sanitization, fixed prompt templates, PII detection and masking, exclude sensitive information from logs

- **Risk 6: Scalability issues (performance degradation under high load)**
  - Mitigation: Support horizontal scaling (stateless design), connection pooling, caching strategies (search results, embeddings), load testing and performance tuning

## References

- [RAG Architecture Explained: A Comprehensive Guide [2025] | Orq.ai](https://orq.ai/blog/rag-architecture)
- [8 RAG Architectures You Should Know in 2025 | Humanloop](https://humanloop.com/blog/rag-architectures)
- [The Streaming Backbone of LLMs: Why SSE Still Wins in 2025 | Procedure Technologies](https://procedure.tech/blogs/the-streaming-backbone-of-llms-why-server-sent-events-(sse)-still-wins-in-2025)
- [The 7 Best Vector Databases in 2025 | DataCamp](https://www.datacamp.com/blog/the-top-5-vector-databases)
- [Vector Database Comparison: Pinecone vs Weaviate vs Qdrant | Medium](https://medium.com/tech-ai-made-easy/vector-database-comparison-pinecone-vs-weaviate-vs-qdrant-vs-faiss-vs-milvus-vs-chroma-2025-15bf152f891d)
- [13 Best Embedding Models in 2025 | Elephas](https://elephas.app/blog/best-embedding-models)
- [OpenAI's Text Embeddings v3 | Pinecone](https://www.pinecone.io/learn/openai-embeddings-v3/)
- [sse-starlette · PyPI](https://pypi.org/project/sse-starlette/)
- [Streaming Responses in FastAPI | Random Thoughts](https://hassaanbinaslam.github.io/posts/2025-01-19-streaming-responses-fastapi.html)
- [OpenAI SSE Streaming API | Better Programming](https://betterprogramming.pub/openai-sse-sever-side-events-streaming-api-733b8ec32897)
