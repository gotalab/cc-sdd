# Implementation Plan

## 1. プロジェクト基盤とセットアップ

- [ ] 1.1 (P) Python開発環境とプロジェクト構造のセットアップ
  - Python 3.11+のインストール確認とバージョン固定
  - FastAPI、Uvicorn、Pydantic、sse-starletteの依存関係定義
  - プロジェクトディレクトリ構造の作成(app/、tests/、config/)
  - 環境変数管理の仕組み構築(.env.exampleテンプレート作成)
  - _Requirements: 6_

- [ ] 1.2 (P) 開発ツールとコード品質管理のセットアップ
  - linter(ruff)、formatter(black)、型チェッカー(mypy)の設定
  - pre-commitフックの設定
  - pytestテスト環境の構築
  - _Requirements: 6_

- [ ] 1.3 (P) Dockerコンテナ化環境のセットアップ
  - Dockerfileの作成(Python 3.11ベースイメージ、マルチステージビルド)
  - docker-compose.ymlの作成(API、VectorDB開発環境)
  - コンテナ内での開発ワークフロー確認
  - _Requirements: 6_

## 2. 外部サービス統合層の実装

- [ ] 2.1 (P) OpenAI Embeddings API統合
  - OpenAI Python SDKのインストールと設定
  - Embedding生成機能の実装(text-embedding-3-small使用)
  - トークン数カウント機能の実装(tiktoken使用)
  - レート制限エラーハンドリングと指数バックオフリトライ実装
  - 接続プーリング設定(タイムアウト10秒)
  - _Requirements: 2_

- [ ] 2.2 (P) Vector Database(Pinecone)統合
  - Pinecone Python SDKのインストールと設定
  - ベクトル検索機能の実装(Top-K検索、cosine similarity)
  - relevance_score閾値フィルタリングの実装(デフォルト0.7)
  - 接続プーリング設定(最大10接続、タイムアウト5秒)
  - 接続エラーリトライロジックの実装(指数バックオフ)
  - _Requirements: 2_

- [ ] 2.3 (P) OpenAI LLM API統合とストリーミング実装
  - OpenAI Chat Completions APIのストリーミング呼び出し実装(stream=True)
  - プロンプトテンプレート構築機能の実装
  - トークン制限管理とコンテキスト切り捨てロジックの実装
  - ストリーミングトークンの受信とイベント変換処理
  - タイムアウト設定(30秒)とエラーハンドリング
  - _Requirements: 3, 4_

## 3. コアサービスロジックの実装

- [ ] 3.1 RAG Orchestratorの実装
  - 問い合わせ処理フロー全体の調整ロジック実装(Embedding → Retrieval → Generation)
  - 各サービスの非同期呼び出しとエラーハンドリング
  - relevance_score閾値チェックと"情報不足"エラー生成
  - コンテキストトークン数検証とLLM制限チェック(80%制限)
  - サーキットブレーカーパターンの実装(30秒間5回失敗で回路オープン)
  - リトライロジックの統合(指数バックオフ、最大3回)
  - _Requirements: 4, 5_

- [ ] 3.2 (P) 入力検証とサニタイゼーション機能の実装
  - Pydanticモデルによるリクエストスキーマ定義(InquiryRequest)
  - 必須フィールド検証(inquiry_text、session_id)
  - 文字数制限チェック(inquiry_text最大10000文字)
  - UTF-8エンコーディング検証
  - Prompt Injection対策のための入力サニタイゼーション
  - _Requirements: 1, 7_

- [ ] 3.3 (P) エラーハンドリングとレスポンス生成機能の実装
  - 各エラーカテゴリの型定義(4xx、5xx、ビジネスロジックエラー)
  - エラーレスポンススキーマの実装(ErrorResponse)
  - 構造化ログ出力機能の実装(JSON形式、correlation ID付与)
  - PII情報のマスキング処理
  - _Requirements: 5, 7, 8_

## 4. API Layer実装

- [ ] 4.1 FastAPI問い合わせエンドポイントの実装
  - POST /api/inquiriesエンドポイントの実装
  - リクエスト受付とバリデーション処理の統合
  - RAG Orchestratorへのリクエスト委譲
  - 並行リクエスト処理のサポート(async/await)
  - _Requirements: 1_

- [ ] 4.2 SSEストリーミングレスポンスの実装
  - sse-starletteのEventSourceResponseを使用したストリーミング実装
  - Async generatorによるトークンストリーム生成
  - SSEイベントスキーマの実装(token、complete、errorイベント)
  - 接続状態管理とgraceful shutdown処理
  - ストリーミング中のエラーハンドリングとエラーイベント送信
  - _Requirements: 3_

- [ ] 4.3 (P) 認証ミドルウェアの実装
  - API Key認証機能の実装(X-API-Keyヘッダー検証)
  - レート制限機能の実装(1000 req/min per API key)
  - 認証エラー時の401エラー返却(詳細情報非公開)
  - FastAPIのDependency Injectionによるミドルウェア統合
  - _Requirements: 7_

## 5. 可観測性とモニタリング機能の実装

- [ ] 5.1 (P) ヘルスチェックエンドポイントの実装
  - GET /healthエンドポイントの実装
  - 自己診断機能(メモリ使用率、CPU使用率)
  - 外部サービス疎通確認(VectorDB、OpenAI API)の並行実行
  - HealthCheckResponseスキーマの実装(healthy/degraded/unhealthy判定)
  - 100ms以内のレスポンス返却保証
  - _Requirements: 6, 8_

- [ ] 5.2 (P) Prometheusメトリクスエンドポイントの実装
  - GET /metricsエンドポイントの実装(prometheus-client使用)
  - リクエストメトリクス収集(http_requests_total、http_request_duration_seconds)
  - コンポーネント別レイテンシメトリクス(rag_retrieval_latency_seconds、rag_generation_latency_seconds、rag_total_latency_seconds)
  - 外部APIメトリクス収集(external_api_calls_total、external_api_latency_seconds)
  - エラーメトリクス収集(errors_total)
  - _Requirements: 8_

- [ ] 5.3 (P) 構造化ログ出力機能の実装
  - JSON形式ログ出力の実装(structlogまたは標準loggingモジュール拡張)
  - リクエストIDの生成と全ライフサイクルでのトレース
  - コンポーネント別ログレベル設定
  - PII情報の自動マスキング
  - _Requirements: 8_

## 6. 統合とエンドツーエンド機能実装

- [ ] 6.1 全コンポーネント統合とFastAPIアプリケーションのセットアップ
  - FastAPIアプリケーションインスタンスの生成
  - 各エンドポイントのルーター登録
  - ミドルウェアの登録(認証、ロギング、メトリクス収集)
  - CORS設定(必要に応じて)
  - 環境変数からの設定読み込み
  - Uvicornサーバーの起動スクリプト作成
  - _Requirements: 1, 6_

- [ ] 6.2 エラーリカバリーとレジリエンス機能の統合テスト
  - リトライロジックの動作確認(Embedding、VectorDB、LLM API障害時)
  - サーキットブレーカーの動作確認(連続失敗時の回路オープン)
  - タイムアウト設定の検証(各API呼び出しと全体フロー)
  - 外部サービス障害時の503エラー返却確認
  - _Requirements: 5_

## 7. テスト実装

- [ ] 7.1 (P) Embedding Serviceユニットテストの実装
  - 正常系: 有効なテキストのEmbedding生成
  - 異常系: トークン制限超過エラー
  - 異常系: レート制限エラーとリトライロジック
  - 異常系: サービス障害時のエラーハンドリング
  - _Requirements: 2_

- [ ] 7.2 (P) Document Retrieverユニットテストの実装
  - 正常系: Top-K検索とrelevance_scoreランキング
  - relevance_score閾値フィルタリング検証
  - 接続エラー時のリトライロジック検証
  - 検索結果なし時のNoResultsError返却確認
  - _Requirements: 2_

- [ ] 7.3 (P) Response Generatorユニットテストの実装
  - プロンプトテンプレート構築ロジック検証
  - トークン制限管理と切り捨てロジック検証
  - ストリーミングイベント生成の検証(token、complete、error)
  - LLM APIタイムアウト時のエラーハンドリング確認
  - _Requirements: 3, 4_

- [ ] 7.4 (P) 認証ミドルウェアユニットテストの実装
  - 正常系: 有効なAPI Key検証
  - 異常系: 無効なAPI Keyでの401エラー
  - レート制限超過時の429エラー返却確認
  - 認証エラー詳細情報の非公開確認
  - _Requirements: 7_

- [ ] 7.5 RAG Orchestrator統合テストの実装
  - End-to-Endフロー検証(Embedding生成 → ドキュメント検索 → 応答生成)
  - relevance_score閾値未満時の"情報不足"エラー確認
  - トークン制限超過時の文書切り捨て動作確認
  - 外部サービス障害時のリトライとサーキットブレーカー動作確認
  - _Requirements: 2, 3, 4, 5_

- [ ] 7.6 SSEストリーミング統合テストの実装
  - クライアント接続からストリーム受信までのフロー検証
  - トークンイベントの順序確認
  - completeイベントの受信確認(total_tokens、sources情報)
  - エラーイベント受信と接続クローズ確認
  - 接続断絶時のgraceful shutdown確認
  - _Requirements: 3_

- [ ] 7.7 (P) ヘルスチェックとメトリクスエンドポイントテストの実装
  - /healthエンドポイントのレスポンス検証(healthy/degraded/unhealthy)
  - 外部サービス障害時のステータス変化確認
  - 100ms以内レスポンス保証の確認
  - /metricsエンドポイントのPrometheusフォーマット検証
  - _Requirements: 6, 8_

- [ ] 7.8 APIエンドポイントE2Eテストの実装
  - 正常系フルフロー: 問い合わせ送信 → ストリーミング応答受信
  - エラーシナリオ: 無効リクエスト(400)、認証失敗(401)、サービス障害(503)
  - 並行リクエスト処理の検証(100並行リクエスト)
  - タイムアウトシナリオの検証(504エラー)
  - _Requirements: 1, 3, 5, 7_

- [ ] 7.9* (P) パフォーマンステストの実装
  - 負荷テスト: 1000 req/minでの安定性確認
  - p95レイテンシ測定(ドキュメント検索2秒以内、ストリーミング開始3秒以内)
  - ベクトル検索性能テスト(10000ドキュメントインデックス)
  - 水平スケーリング検証(3インスタンスでの負荷分散)
  - _Requirements: 6_

## 8. デプロイ設定とドキュメント

- [ ] 8.1 (P) 環境変数とコンフィギュレーション管理の整備
  - .env.exampleテンプレートの完成(全環境変数の文書化)
  - 環境別設定ファイルの作成(dev、staging、production)
  - 設定検証機能の実装(起動時の必須環境変数チェック)
  - _Requirements: 6, 7_

- [ ] 8.2 (P) OpenAPIドキュメント生成と検証
  - FastAPIの自動OpenAPIドキュメント生成確認
  - /docsエンドポイントでのSwagger UI確認
  - リクエスト/レスポンススキーマの完全性検証
  - エラーレスポンスの文書化確認
  - _Requirements: 1_

## タスク完了条件

全てのタスクが完了し、以下の条件を満たすことで実装完了とする:

- 全要件(1-8)が実装タスクに正しくマッピングされている
- 全ユニットテストが成功している
- 全統合テストが成功している
- E2Eテストが成功している
- パフォーマンステストで要件6の基準(ヘルスチェック100ms、検索2秒、ストリーミング3秒)を満たしている
- 全エンドポイントが正常に動作している
- OpenAPIドキュメントが完全に生成されている
