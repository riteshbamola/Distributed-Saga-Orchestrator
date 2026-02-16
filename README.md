# Distributed Saga Orchestrator (Learning Project)

This repository is a **learning-focused implementation of the Saga pattern** using a **centralized orchestrator** and multiple Node.js microservices communicating over Kafka.

The goal is to understand:
- How to coordinate distributed transactions across services
- How to model saga steps and compensating actions
- How to pass events between services using Kafka topics

> ⚠️ This is **not intended for production use**. It’s a playground for learning concepts.

---

## Architecture Overview

The system models a simple e‑commerce order flow:

1. **Order Service**
   - Accepts new orders
   - Validates basic fields
   - Persists the order
   - Publishes `order.created` to Kafka

2. **Orchestrator Service**
   - Listens to saga-related topics
   - Maintains saga and saga steps in its own store
   - Drives the flow:
     - `order.created` → publish `inventory.reserve`
     - `inventory.reserved` → publish `payment.request`
     - `payment.success` → publish `inventory.completed`
     - `payment.failed` → publish `inventory.release`
     - `inventory.failed` → publish `order.cancel`
     - `inventory.completed` → publish `order.confirm`

3. **Inventory Service** (if present)
   - Listens to inventory-related topics (`inventory.reserve`, `inventory.release`, etc.)
   - Emits `inventory.reserved`, `inventory.completed`, `inventory.failed`, ...

4. **Payment Service**
   - Listens to `payment.request`
   - Creates a payment record
   - Emits **either** `payment.success` or `payment.failed`

### Kafka Topics (main ones)

- Order:
  - `order.created`
  - `order.cancel`
  - `order.confirm`
- Inventory:
  - `inventory.reserve`
  - `inventory.reserved`
  - `inventory.completed`
  - `inventory.failed`
  - `inventory.release`
- Payment:
  - `payment.request`
  - `payment.success`
  - `payment.failed`

The **orchestrator** owns the saga state and decides which topic to publish next based on previous steps’ outcomes.

---

## Tech Stack

- **Language**: TypeScript / Node.js
- **Messaging**: Kafka (`kafkajs`)
- **Database**: (depends on your local setup, e.g. Postgres/MySQL/SQLite)
- **Runtime**: Node.js (v18+ recommended)

---

## Project Structure (high level)

```text
microservices-saga-orchestration/
  order-service/
    src/
      service.ts
      kafka.ts
      model.ts
      types/
        types.ts
  payment-service/
    src/
      service.ts
      kafka.ts
      model.ts
      types/
        types.ts
  orchestrator-service/
    src/
      kafka.ts
      saga.ts
      handlers.ts
      models.ts
      types/
        types.ts
  inventory-service/   # (if implemented)
    ...
```

---

## Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- **Kafka** running locally
  - Example: `localhost:9092`
  - You can use Docker (e.g. Confluent or Bitnami images) to spin up Kafka + ZooKeeper

---

## Setup & Installation

From the repo root:

```bash
# Install dependencies for each service (example with npm)
cd microservices-saga-orchestration/order-service
npm install

cd ../payment-service
npm install

cd ../orchestrator-service
npm install

# (and inventory-service if present)
```

Make sure your **Kafka broker URL** in each `kafka.ts` file matches your local setup (default here is `localhost:9092`).

---

## Running the Services

In separate terminals (from each service directory):

```bash
# 1. Start Kafka/ZooKeeper first (via Docker or local install)
#    Make sure it is reachable at localhost:9092

# 2. Orchestrator
cd microservices-saga-orchestration/orchestrator-service
npm run dev    # or npm start / ts-node, depending on your setup

# 3. Order Service
cd microservices-saga-orchestration/order-service
npm run dev

# 4. Payment Service
cd microservices-saga-orchestration/payment-service
npm run dev

# 5. Inventory Service (if implemented)
cd microservices-saga-orchestration/inventory-service
npm run dev
```

> Check each service’s `package.json` for the exact start script (`npm run dev`, `npm start`, etc.).

---

## Example Flow (Happy Path)

1. **Create an order** via the Order Service (HTTP endpoint, CLI, or directly calling the service method, depending on how you wired it).
2. Order Service:
   - Validates and stores the order
   - Publishes `order.created` to Kafka
3. Orchestrator:
   - Handles `order.created`
   - Creates saga + saga steps
   - Publishes `inventory.reserve`
4. Inventory Service:
   - Reserves stock
   - Publishes `inventory.reserved`
5. Orchestrator:
   - Handles `inventory.reserved`
   - Marks the inventory step as completed
   - Publishes `payment.request`
6. Payment Service:
   - Processes payment
   - Publishes `payment.success`
7. Orchestrator:
   - Handles `payment.success`
   - Publishes `inventory.completed`
8. Inventory Service:
   - Finalizes inventory
   - Orchestrator eventually publishes `order.confirm`
9. Order Service:
   - Consumes `order.confirm`
   - Logs/updates order as confirmed

For **failure scenarios**, the orchestrator will instead publish:
- `payment.failed` → `inventory.release`
- `inventory.failed` → `order.cancel`

---

## Learning Focus

This project is built **for learning**, not production:

- No advanced error handling, retries, or idempotency
- No security/auth
- Minimal validation and logging

It’s a great base to experiment with:
- Adding retries and backoff
- Implementing idempotent consumers
- Enriching saga state tracking
- Observability (structured logs, tracing, etc.)

---

## License

This project is for educational purposes. You can adapt or extend it freely for your own learning or demos.

