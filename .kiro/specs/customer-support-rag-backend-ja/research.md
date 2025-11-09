# Research & Design Decisions

---
**Purpose**: 本ドキュメントは、カスタマーサポート向けRAGバックエンドAPIの設計を支える調査結果、アーキテクチャ検討、および根拠を記録する。

**Usage**:
- ディスカバリーフェーズにおける調査活動と成果を記録
- design.mdには詳細すぎる設計判断のトレードオフを文書化
- 将来の監査や再利用のための参照資料とエビデンスを提供
---

## Summary
- **Feature**: `customer-support-rag-backend`
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - RAG実装には段階的アーキテクチャパターン(Simple RAG → Agentic RAG)が確立されており、本プロジェクトはモジュラーRAGパターンを採用
  - LLMストリーミングにはSSE(Server-Sent Events)が標準的で、WebSocketより軽量かつHTTP互換性が高い
  - ベクトルデータベースは用途に応じて選択が必要(Pinecone: フルマネージド、Qdrant: 高度なフィルタリング、pgvector: PostgreSQL統合)
  - Embedding生成はOpenAI text-embedding-3が性能とコストのバランスに優れる(代替: sentence-transformersでローカル展開可能)
  - FastAPIでSSE実装時は`sse-starlette`ライブラリとasync generatorsが推奨される

## Research Log

### RAGアーキテクチャパターンの調査

- **Context**: RAGシステムの設計方針を決定するため、2025年時点での最新アーキテクチャパターンを調査
- **Sources Consulted**:
  - [RAG Architecture Explained: A Comprehensive Guide [2025] | Orq.ai](https://orq.ai/blog/rag-architecture)
  - [8 RAG Architectures You Should Know in 2025 | Humanloop](https://humanloop.com/blog/rag-architectures)
  - [RAG in 2025: From Quick Fix to Core Architecture | Medium](https://medium.com/@hrk84ya/rag-in-2025-from-quick-fix-to-core-architecture-9a9eb0a42493)
  - [IBM Architecture Patterns - Retrieval Augmented Generation](https://www.ibm.com/architectures/patterns/genai-rag)

- **Findings**:
  - **基本アーキテクチャ**: Simple RAGは静的データベースから関連文書を検索してLLMに渡す基本パターン
  - **発展パターン**:
    - Simple RAG with Memory: 会話履歴を保持してコンテキスト継続性を実現
    - Agentic RAG: 自律エージェントがタスク計画と実行を行う
    - Long RAG: 大量文書を扱うため、チャンク分割ではなくセクション/文書単位で処理
    - Self-RAG: 検索タイミング、関連性評価、出力批評を自己判断する高度なフレームワーク
  - **モジュラーRAGパターン**: Retriever、Generator、Orchestration logicを分離することで、デバッグと更新が容易になる(推奨)
  - **検索戦略**: ベクトル検索とキーワード検索のハイブリッドがセマンティック理解と正確な用語マッチングの両立に有効
  - **2025年のトレンド**: RAGはハルシネーション対策の一時的手法から、信頼性の高い動的知識接地AIシステムの基礎パターンへと進化

- **Implications**:
  - 本プロジェクトはモジュラーRAGパターンを採用し、Retriever(検索)、Generator(生成)、Orchestrator(制御)を独立コンポーネントとして設計
  - 初期実装はSimple RAGとし、将来的にMemory機能やAgentic拡張に対応できる境界を設定
  - ハイブリッド検索(ベクトル + キーワード)を採用してドキュメント検索精度を向上

### LLMストリーミングAPI調査

- **Context**: ユーザー体験向上のためLLM応答をリアルタイムストリーミングする実装方式を調査
- **Sources Consulted**:
  - [How to Stream LLM Responses Using SSE | Apidog](https://apidog.com/blog/stream-llm-responses-using-sse/)
  - [The Streaming Backbone of LLMs: Why SSE Still Wins in 2025 | Procedure Technologies](https://procedure.tech/blogs/the-streaming-backbone-of-llms-why-server-sent-events-(sse)-still-wins-in-2025)
  - [How streaming LLM APIs work | Simon Willison's TILs](https://til.simonwillison.net/llms/streaming-llm-apis)
  - [OpenAI SSE Streaming API | Better Programming](https://betterprogramming.pub/openai-sse-sever-side-events-streaming-api-733b8ec32897)

- **Findings**:
  - **SSEの優位性**: WebSocketやgRPCと比較して、SSEは軽量で標準HTTP上で動作し、自動再接続機能を持つ
  - **プロトコル仕様**: イベントは`data: <your_data>\n\n`形式でフォーマットし、Content-Type: text/event-streamヘッダーを返す
  - **OpenAI実装**: `stream: true`フラグでストリーミング有効化、"delta"オブジェクトでトークンを段階的配信、`[DONE]`メッセージで完了通知
  - **ベストプラクティス**:
    - レスポンスの断片化を適切に処理(Auto-Merge機能推奨)
    - 異なるLLMモデル(OpenAI, Gemini, DeepSeek)でテストして互換性確保
    - Timeline Viewでデバッグ時のストリーム進行を可視化
    - 非標準フォーマット対応にはJSONPathやPost-Processorスクリプトを活用
  - **UX効果**: "Latency Theater"により、総生成時間が同じでも段階的フィードバックでユーザー体感速度が向上

- **Implications**:
  - 本APIはSSEプロトコルでLLM応答をストリーミング(WebSocketは不採用)
  - OpenAI Chat Completions APIの`stream: true`モードを利用
  - エラーハンドリングでは接続断絶時の自動再接続とgraceful shutdown実装が必要
  - インフラ考慮事項: Nginx使用時は`X-Accel-Buffering: no`ヘッダー設定が必須

### ベクトルデータベース選定調査

- **Context**: セマンティック検索を実現するベクトルデータベースの選定
- **Sources Consulted**:
  - [The 7 Best Vector Databases in 2025 | DataCamp](https://www.datacamp.com/blog/the-top-5-vector-databases)
  - [Vector Database Comparison: Pinecone vs Weaviate vs Qdrant vs FAISS vs Milvus vs Chroma | Medium](https://medium.com/tech-ai-made-easy/vector-database-comparison-pinecone-vs-weaviate-vs-qdrant-vs-faiss-vs-milvus-vs-chroma-2025-15bf152f891d)
  - [Pinecone vs Qdrant vs Weaviate | Xenoss](https://xenoss.io/blog/vector-database-comparison-pinecone-qdrant-weaviate)
  - [Top Vector Database for RAG: Qdrant vs Weaviate vs Pinecone | AIM Multiple](https://research.aimultiple.com/vector-database-for-rag/)

- **Findings**:
  - **Pinecone**:
    - パフォーマンス: 挿入速度50k ops/sec、クエリ速度5k ops/sec(ベンチマークトップ)
    - 特徴: フルマネージドサービス、数十億ベクトル対応、運用オーバーヘッド最小
    - セキュリティ: SOC 2 Type II、ISO 27001、GDPR準拠、HIPAA認証
    - 適用: ターンキーでスケールが必要な場合に最適
  - **Weaviate**:
    - 特徴: ナレッジグラフ機能、GraphQLインターフェース
    - 適用: ベクトル検索と複雑なデータ関係性の組み合わせが必要な場合
  - **Qdrant**:
    - パフォーマンス: 挿入速度45k ops/sec、クエリ速度4.5k ops/sec
    - 特徴: Rust実装、高度なメタデータフィルタリング機能
    - 適用: ベクトル類似度と複雑なメタデータフィルタリングの両立が必要な場合
  - **pgvector**:
    - 特徴: PostgreSQL拡張として動作、構造化データとベクトル検索を統合
    - 制約: 大規模時は専用ベクトルDBより低速、Postgresチューニングが必要
    - 適用: 既存PostgreSQL環境でベクトル検索を追加したい場合
  - **選定ガイダンス**: ワークロードに応じた選択が重要(Pinecone: ターンキースケール、Weaviate: OSS柔軟性、Qdrant: 複雑フィルタ、pgvector: SQL統合)

- **Implications**:
  - 初期実装ではPineconeまたはQdrantを推奨(要件に応じて選択)
  - Pinecone: フルマネージドで運用負荷低、スケーラビリティ高
  - Qdrant: セルフホスト可能、コスト最適化とデータ主権が重要な場合に有効
  - pgvectorは既存PostgreSQL環境がある場合の代替オプション
  - 接続失敗時のリトライロジックとサーキットブレーカーパターンを実装

### Embeddingモデル選定調査

- **Context**: ドキュメントと問い合わせのベクトル化に使用するEmbeddingモデルを調査
- **Sources Consulted**:
  - [13 Best Embedding Models in 2025 | Elephas](https://elephas.app/blog/best-embedding-models)
  - [Embedding Models Comparison: OpenAI vs Sentence-Transformers | Markaicode](https://markaicode.com/embedding-models-comparison-openai-sentence-transformers/)
  - [OpenAI's Text Embeddings v3 | Pinecone](https://www.pinecone.io/learn/openai-embeddings-v3/)
  - [New embedding models and API updates | OpenAI](https://openai.com/index/new-embedding-models-and-api-updates/)

- **Findings**:
  - **OpenAI text-embedding-3**:
    - モデル: text-embedding-3-small(コスト効率)、text-embedding-3-large(高性能)
    - 価格: text-embedding-3-small $0.02/百万トークン、text-embedding-3-large $0.13/百万トークン
    - 次元数: text-embedding-3-small最大8191トークン、text-embedding-3-large最大3072次元
    - 性能: MTEB(Massive Text Embedding Benchmark)でトップスコア
    - レート制限: Usage Tierに基づく(Tier 5で10M TPM、10k RPM)
    - 統合: シンプルなREST API、モデル管理不要
  - **Sentence-Transformers(オープンソース)**:
    - モデル: all-MiniLM-L6-v2(384次元、バランス型)、all-mpnet-base-v2(768次元、高精度)
    - コスト: 完全無料、ローカル実行可能
    - デプロイ: 完全なデータ制御、外部API呼び出し不要
    - パフォーマンス: CPU実行でもレイテンシテストで最速
  - **推奨**:
    - セマンティック検索・検索精度優先: OpenAI embeddings推奨
    - オフライン/プライバシー重視環境: Sentence-Transformers推奨

- **Implications**:
  - 初期実装はOpenAI text-embedding-3-small採用(コスト効率と性能のバランス)
  - 高精度要求時はtext-embedding-3-largeへの切り替えオプションを設計
  - プライバシー要件やコスト最適化が重要な場合、Sentence-Transformersでのローカル実装を代替案として保持
  - レート制限対策として指数バックオフリトライを実装

### FastAPI SSE実装調査

- **Context**: PythonバックエンドでSSEを実装するベストプラクティスを調査
- **Sources Consulted**:
  - [Server-Sent Events with Python FastAPI | Medium](https://medium.com/@nandagopal05/server-sent-events-with-python-fastapi-f1960e0c8e4b)
  - [Real-Time Notifications in Python: Using SSE with FastAPI | Medium](https://medium.com/@inandelibas/real-time-notifications-in-python-using-sse-with-fastapi-1c8c54746eb7)
  - [sse-starlette · PyPI](https://pypi.org/project/sse-starlette/)
  - [Streaming Responses in FastAPI | Random Thoughts](https://hassaanbinaslam.github.io/posts/2025-01-19-streaming-responses-fastapi.html)

- **Findings**:
  - **推奨ライブラリ**: `sse-starlette`がW3C SSE仕様に準拠した本番環境対応実装を提供
  - **Async Generators**: FastAPIのasync機能とasync generatorsを使用してスケーラビリティ向上
  - **EventSourceResponse vs StreamingResponse**: 基本的なStreamingResponseより、EventSourceResponseがSSE処理に適している
  - **接続管理**: 各SSEクライアントが1サーバースレッド/コルーチンを使用するため、大規模システムでは接続数とメモリ使用量を監視し、I/O最適化されたasyncサーバー(Uvicorn、Daphne)を使用
  - **インフラ考慮事項**:
    - Nginx使用時は`X-Accel-Buffering: no`ヘッダー追加(デフォルトでバッファリングされるため)
    - ホスティング環境がストリーミングレスポンス対応を確認(Content-Lengthを要求するサーバーは非対応)
  - **プロトコル要件**: メッセージはUTF-8エンコード必須、ヘッダーに`Cache-Control: no-cache`含める
  - **ASGIサーバー**: PythonのWSGIサーバーは適切にストリーミングできない場合があるため、ASGIサーバー(Uvicorn、Daphne)を推奨

- **Implications**:
  - FastAPI + `sse-starlette` + Uvicornの組み合わせで実装
  - Async generatorパターンを使用してLLMレスポンスをストリーミング
  - Nginx/ロードバランサー設定でバッファリング無効化
  - 接続数とメモリ使用量のモニタリング実装

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Modular RAG | Retriever、Generator、Orchestratorを独立コンポーネントとして分離 | 明確な境界、テスト容易性、段階的拡張が可能、デバッグしやすい | アダプター層の構築が必要、コンポーネント間通信のオーバーヘッド | 2025年のベストプラクティスに準拠、将来のAgentic RAG拡張に対応可能 |
| Simple RAG | 検索と生成を一体化した単純なフロー | 実装が迅速、初期コスト低 | スケーラビリティ制約、テストが困難、境界が不明瞭 | プロトタイプには適しているが、本番環境では推奨されない |
| Hexagonal Architecture | ポート&アダプターでコアドメインを抽象化 | テスト容易性高、外部依存からの分離 | 初期設計コスト高、小規模プロジェクトには過剰 | エンタープライズ環境では有効だが、本プロジェクトの規模には過剰 |

**選定結果**: Modular RAGパターンを採用
- 要件の複雑性(検索、生成、ストリーミング、エラーハンドリング)に対応
- 各コンポーネントが独立してテスト・デプロイ可能
- 将来的な拡張(Memory、Agentic機能)に対応できる境界設計

## Design Decisions

### Decision: `ストリーミングプロトコル選定(SSE vs WebSocket)`

- **Context**: LLM応答をリアルタイムでクライアントに配信するプロトコルの選定
- **Alternatives Considered**:
  1. **Server-Sent Events (SSE)** — 一方向の軽量ストリーミング、標準HTTP、自動再接続
  2. **WebSocket** — 双方向通信、ステートフル接続、より複雑な接続管理

- **Selected Approach**: Server-Sent Events (SSE)
  - W3C標準プロトコル、Content-Type: text/event-stream
  - FastAPIでは`sse-starlette`ライブラリを使用
  - Async generatorパターンでLLMレスポンスを段階的配信

- **Rationale**:
  - LLM応答は一方向配信のため、双方向通信は不要
  - SSEは標準HTTPで動作し、既存インフラ(CDN、ロードバランサー)との互換性が高い
  - 自動再接続機能により接続断絶時の復旧が容易
  - WebSocketと比較して実装がシンプルで運用オーバーヘッドが低い

- **Trade-offs**:
  - **Benefits**: 軽量、HTTP互換、自動再接続、実装シンプル、インフラ互換性高
  - **Compromises**: 一方向通信のみ(双方向不要のため問題なし)、ブラウザ接続数制限(6接続/ドメイン、実用上問題なし)

- **Follow-up**:
  - Nginx/ロードバランサーで`X-Accel-Buffering: no`設定を確認
  - 接続数とメモリ使用量のモニタリング実装
  - 接続断絶時のgraceful shutdownとエラー通知の実装検証

### Decision: `ベクトルデータベース選定(Pinecone vs Qdrant vs pgvector)`

- **Context**: セマンティック検索のためのベクトルデータベース選定
- **Alternatives Considered**:
  1. **Pinecone** — フルマネージド、高性能(50k insertion/sec)、運用負荷最小
  2. **Qdrant** — セルフホスト可能、高度なフィルタリング、Rust実装
  3. **pgvector** — PostgreSQL拡張、既存DB統合、コスト低

- **Selected Approach**: Pinecone(初期実装)、Qdrantを代替オプションとして保持
  - Pineconeをプライマリ選択肢として設計
  - インターフェース抽象化により将来的なQdrant/pgvectorへの切り替えを可能にする

- **Rationale**:
  - 初期フェーズでは開発速度と運用安定性を優先
  - Pineconeはフルマネージドでスケーラビリティとセキュリティ(SOC 2、GDPR)が保証される
  - Qdrantはコスト最適化やデータ主権が必要な場合の代替案

- **Trade-offs**:
  - **Benefits(Pinecone)**: 運用負荷ゼロ、スケーラビリティ保証、セキュリティ準拠
  - **Compromises**: ベンダーロックインリスク、従量課金コスト、カスタマイズ制約
  - **Benefits(Qdrant)**: セルフホスト可能、コスト制御、フィルタリング高度化
  - **Compromises**: 運用負荷増、スケーリング管理が必要

- **Follow-up**:
  - VectorStoreインターフェースを定義し、Pinecone/Qdrant/pgvectorの切り替えを可能にする
  - 実装初期段階でコスト試算とスケーリングテストを実施
  - セルフホスト要件が発生した場合のQdrant移行パスを設計

### Decision: `Embeddingモデル選定(OpenAI vs Sentence-Transformers)`

- **Context**: ドキュメントと問い合わせのベクトル化に使用するEmbeddingモデル選定
- **Alternatives Considered**:
  1. **OpenAI text-embedding-3-small** — API型、$0.02/百万トークン、高精度
  2. **OpenAI text-embedding-3-large** — API型、$0.13/百万トークン、最高精度
  3. **Sentence-Transformers(all-MiniLM-L6-v2)** — ローカル実行、無料、プライバシー保護

- **Selected Approach**: OpenAI text-embedding-3-small
  - 初期実装はtext-embedding-3-smallを使用
  - 高精度要求時にtext-embedding-3-largeへの切り替えオプションを保持
  - EmbeddingServiceインターフェースで実装を抽象化

- **Rationale**:
  - text-embedding-3-smallはコストと性能のバランスが優れている
  - API型のためインフラ管理不要、スケーラビリティ高
  - MTEBベンチマークでトップクラスの精度

- **Trade-offs**:
  - **Benefits**: 高精度、インフラ不要、簡単統合、スケーラビリティ
  - **Compromises**: API依存、従量課金コスト、レート制限、オフライン非対応
  - **Alternative Benefits(Sentence-Transformers)**: 完全無料、プライバシー保護、オフライン可能
  - **Alternative Compromises**: インフラ管理必要、精度がやや低い、スケーリング対応必要

- **Follow-up**:
  - レート制限対策として指数バックオフリトライ実装
  - コスト監視ダッシュボード構築
  - プライバシー要件が厳格化した場合のSentence-Transformers移行パスを設計

### Decision: `バックエンドフレームワーク選定(FastAPI)`

- **Context**: RAG APIバックエンドのPythonフレームワーク選定
- **Alternatives Considered**:
  1. **FastAPI** — 高速、async対応、型安全、自動ドキュメント生成
  2. **Flask** — シンプル、成熟、豊富なエコシステム
  3. **Django** — フルスタック、ORM統合、管理画面

- **Selected Approach**: FastAPI
  - Uvicorn(ASGIサーバー)で実行
  - `sse-starlette`ライブラリでSSE実装
  - Pydanticで型安全なリクエスト/レスポンス定義

- **Rationale**:
  - Async/await対応によりSSEストリーミングとLLM API呼び出しの並行処理が効率的
  - Pydanticによる型安全性で実装エラーを防止
  - 自動OpenAPIドキュメント生成でAPI仕様管理が容易
  - 2025年時点でPython APIバックエンドの標準的選択肢

- **Trade-offs**:
  - **Benefits**: 高速、型安全、async対応、自動ドキュメント、モダンな開発体験
  - **Compromises**: Flaskより歴史が浅い、エコシステムがやや小さい

- **Follow-up**:
  - Uvicornの本番環境設定(ワーカー数、タイムアウト)を最適化
  - Pydanticモデルで全てのリクエスト/レスポンスを型定義
  - OpenAPIドキュメントを自動生成し、フロントエンド開発と連携

## Risks & Mitigations

- **Risk 1: LLM API レート制限超過によるサービス停止**
  - Mitigation: 指数バックオフリトライ実装、レート制限監視アラート、リクエストキューイング、複数APIキー/エンドポイントのフェイルオーバー構成

- **Risk 2: ベクトルデータベース接続障害**
  - Mitigation: サーキットブレーカーパターン実装、フォールバック検索(キーワード検索)、接続プーリングと自動リトライ、ヘルスチェックエンドポイント

- **Risk 3: ストリーミング中の接続断絶**
  - Mitigation: SSEの自動再接続機能活用、graceful shutdown実装、エラーイベント送信とクライアント側エラーハンドリング、タイムアウト設定

- **Risk 4: コンテキストウィンドウ超過によるLLMエラー**
  - Mitigation: トークン数カウントと事前検証、低ランク文書の段階的切り捨て、チャンクサイズ最適化、コンテキスト圧縮技術適用

- **Risk 5: セキュリティ脆弱性(Prompt Injection、PII漏洩)**
  - Mitigation: 入力サニタイゼーション実装、プロンプトテンプレート固定化、PII検出とマスキング、ログ出力時の機密情報除外

- **Risk 6: スケーラビリティ問題(高負荷時のパフォーマンス劣化)**
  - Mitigation: 水平スケーリング対応(ステートレス設計)、接続プーリング、キャッシング戦略(検索結果、Embedding)、負荷テストと性能チューニング

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
