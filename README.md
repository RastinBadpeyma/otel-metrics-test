


#  Observability & Telemetry Architecture

##  Overview

In microservices and modular architectures, understanding the lifecycle of a request as it traverses multiple layers is critical. This repository provides a fully instrumented implementation showcasing how telemetry data is generated, collected, and correlated. It features a complete pipeline from the application layer down to the visualization layer, ensuring zero blind spots in production.

### Key Highlights:
- **Centralized Telemetry Pipeline:** Utilizing the OpenTelemetry (OTel) Collector to decouple data generation from data storage.
- **Log-Trace Correlation:** Native integration where logs are automatically tagged with `trace_id` and `span_id`, allowing 1-click jumps from logs to exact execution traces.
- **Deep Instrumentation:** Custom nested spans tracing a multi-layered request (Gateway -> Business Logic -> Database) to visualize latency waterfalls.
- **Load Testing Ready:** Included `k6` scripts to simulate concurrent user traffic and generate realistic monitoring data.

---

##  Architecture & Data Flow

The observability pipeline follows a standardized workflow, ensuring that telemetry data is efficiently processed and routed to the correct backend storage.

**The Workflow:**
1. **Telemetry Generation:** The Application (e.g., Node.js/NestJS) uses the OpenTelemetry SDK to automatically generate metrics and traces. Logs are generated using a structured logger (Pino).
2. **Telemetry Collection (OTel Collector):** Instead of sending data directly to databases, the application pushes all traces and metrics via the OTLP protocol to the **OpenTelemetry Collector**. The Collector acts as a vendor-agnostic router—it receives, batches, and processes the telemetry data.
3. **Data Export & Storage:**
   - **Metrics** are exported by the Collector and scraped by **Prometheus**.
   - **Traces** are exported by the Collector to **Jaeger**.
   - **Logs** are pushed to **Grafana Loki** (either directly via a log driver/agent or through the pipeline).
4. **Visualization & Correlation:** **Grafana** sits on top of Prometheus, Jaeger, and Loki, querying them simultaneously to provide unified dashboards and seamless log-to-trace jumping.

```text
[ Application ] --(OTLP)--> [ OTel Collector ] --(Metrics)--> [ Prometheus ]
       |                            |
       |                            +------------(Traces)---> [ Jaeger ]
       |
       +-------(Structured Logs)----------------------------> [ Loki ]

                                                                   ^
                                                                   |
[ Grafana ] <-----------------(Queries & Visualizes)---------------+

```

---

##  Tech Stack

* **Telemetry Standard:** OpenTelemetry (OTel SDK & API)
* **Pipeline/Router:** OpenTelemetry Collector
* **Tracing Backend:** Jaeger
* **Metrics Storage:** Prometheus
* **Log Aggregation:** Grafana Loki (with Pino logger)
* **Visualization:** Grafana
* **Load Testing:** k6 by Grafana
* **Infrastructure:** Docker & Docker Compose

---

## Getting Started

### Prerequisites

* [Docker](https://www.docker.com/)
* [Node.js](https://nodejs.org/) (v22.x or higher)
* [k6](https://k6.io/docs/get-started/installation/) (for load testing)

### 1. Spin up the Observability Infrastructure

Start the supporting services (OTel Collector, Prometheus, Loki, Jaeger, Grafana) via Docker:

```bash
docker-compose up -d

```

### 2. Run the Application

Install dependencies and start the app in development mode:

```bash
pnpm install
pnpm run start:dev

```

*The API will be available at `http://localhost:3000`.*

---

## Simulating Production Traffic (Load Testing)

To visualize the true power of this stack, run the provided `k6` script to simulate 50 concurrent users interacting with the API. This will generate the necessary load to populate the dashboards.

```bash
k6 run load-test.js

```

*Note: The application intentionally simulates latency bottlenecks and occasional errors to reflect realistic production scenarios.*

---

##  Observability Workflows

Once the load test is running, explore the telemetry data through the following portals:

### 1. The "Waterfall" Trace Analysis (Jaeger)

* **URL:** `http://localhost:16686`
* **Action:** Search for traces in your service. Open a trace to view the **Waterfall Chart**. You will clearly see the execution time of different layers (e.g., Gateway, Service, Database) and pinpoint exact bottlenecks (like a slow SQL query).

### 2. Live Metrics Dashboards (Grafana)

* **URL:** `http://localhost:3001` (Credentials: `admin` / `admin`)
* **Action:**
* Navigate to **Explore -> Prometheus** to query metrics like `rate(custom_work_requests_total[1m])`.
* Build visual panels (Time series, Donut charts) to monitor real-time Success vs. Error rates.



### 3. Log-to-Trace Correlation (Loki -> Jaeger)

* **Action:** In Grafana, go to **Explore** and select the **Loki** data source. Query your application logs. Expand any log entry containing a `trace_id` and click the dynamically generated internal link to instantly view the exact trace associated with that log line.





