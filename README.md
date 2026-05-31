

## Architecture

```
                                        ┌─────────────────┐
                                 Traces │   Jaeger        │
                              ┌────────►│   :16686        │
                              │         └─────────────────┘
┌─────────────────┐   OTLP    │          ┌─────────────────┐
│   NestJS App    │──────────►│  OTel    │   Loki          │
│                 │           │Collector ├────────►│  :3100|          │
│ Metrics         │  :4317    │          └─────────────────┘
│ Logs            │  :4318    │         ┌─────────────────┐
│ Traces          │           │ Metrics │   Prometheus    │
└─────────────────┘           └────────►│   :9090         │
                                        │   scrape :8889  │
                                        └────────┬────────┘
                                                 │
                                        ┌────────▼────────┐
                                        │    Grafana      │
                                        │    :3001        │
                                        └─────────────────┘
```

## Services

| Service | Port | Description |
|---|---|---|
| NestJS App | `3000` | Application |
| OTel Collector | `4317` `4318` | OTLP gRPC / HTTP receiver |
| Jaeger | `16686` | Trace visualization UI |
| Loki | `3100` | Log aggregation |
| Prometheus | `9090` | Metrics storage |
| Grafana | `3001` | Dashboard UI |

