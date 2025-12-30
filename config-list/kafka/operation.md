### 创建日志表
```sql
CREATE TABLE logs_db.access_logs
(
    `timestamp` DateTime64(3) CODEC(Delta(8), LZ4),
    `app_name` LowCardinality(String),
    `trace_id` String CODEC(ZSTD(1)),
    `level` LowCardinality(String),
    `type` LowCardinality(String),
    `request_method` LowCardinality(String),
    `request_url` String CODEC(ZSTD(1)),
    `request_query` String,
    `request_body` Nullable(String) CODEC(ZSTD(1)),
    `response_status_code` Nullable(UInt16),
    `response_duration_ms` Nullable(Float64),
    `error_status_code` Nullable(UInt16),
    `error_message` Nullable(String) CODEC(ZSTD(1)),
    `error_stack` Nullable(String) CODEC(ZSTD(1)),
    `user_id` Nullable(String),
    `tenant_id` Nullable(String),
    `client_ip` String,
    `client_user_agent` String CODEC(ZSTD(1)),
    `extra` Map(String, String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (level, type, timestamp, trace_id)
SETTINGS index_granularity = 8192
```

### 创建规则
```sql
CREATE TABLE logs_db.kafka_logs_queue (
    raw_json String
) ENGINE = Kafka
SETTINGS
    kafka_broker_list = 'kafka1:19092,kafka2:19092,kafka3:19092',
    kafka_topic_list = 'test',
    kafka_group_name = 'clickhouse-access-logs-group',
    kafka_format = 'RawBLOB',
    kafka_num_consumers = 3,
    kafka_skip_broken_messages = 10,
    kafka_commit_every_batch = 1;
```

### 创建视图
```sql
CREATE MATERIALIZED VIEW logs_db.access_logs_mv
TO logs_db.access_logs
AS
SELECT
    -- 时间戳处理：如果日志里有 timestamp 字段就解析，没有就用当前时间
    if(
        isValidJSON(raw_json) AND JSONHas(raw_json, 'timestamp'),
        parseDateTime64BestEffort(JSONExtractString(raw_json, 'timestamp'), 3),
        now64(3)
    ) AS timestamp,

    JSONExtractString(raw_json, 'env') AS env,
    JSONExtractString(raw_json, 'appName') AS app_name,
    JSONExtractString(raw_json, 'traceId') AS trace_id,
    JSONExtractString(raw_json, 'level') AS level,
    JSONExtractString(raw_json, 'type') AS type,

    -- request 嵌套字段
    JSONExtractString(raw_json, 'request', 'method') AS request_method,
    JSONExtractString(raw_json, 'request', 'url') AS request_url,
    JSONExtractString(raw_json, 'request', 'query') AS request_query,
    JSONExtractString(raw_json, 'request', 'body') AS request_body,

    -- response 嵌套字段
    JSONExtractUInt(raw_json, 'response', 'statusCode') AS response_status_code,
    JSONExtractFloat(raw_json, 'response', 'durationMs') AS response_duration_ms,

    -- error 嵌套字段
    JSONExtractUInt(raw_json, 'error', 'statusCode') AS error_status_code,
    JSONExtractString(raw_json, 'error', 'message') AS error_message,
    JSONExtractString(raw_json, 'error', 'stack') AS error_stack,

    -- 顶层 userId / tenantId
    JSONExtractString(raw_json, 'userId') AS user_id,
    JSONExtractString(raw_json, 'tenantId') AS tenant_id,

    -- client 嵌套字段
    JSONExtractString(raw_json, 'client', 'ip') AS client_ip,
    JSONExtractString(raw_json, 'client', 'userAgent') AS client_user_agent,

    -- 预留扩展字段
    map() AS extra

FROM logs_db.kafka_logs_queue;
```
