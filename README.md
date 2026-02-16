# Distributed Saga Orchestrator 🚀

A learning-focused implementation of the Saga Pattern using a Centralized Orchestrator and Node.js microservices communicating via Kafka.

## 🏗️ Architecture Overview

![Architecture Diagram](images/architecture.png)

The system coordinates a distributed transaction across four main components:

- **Order Service**: Initiates the saga by persisting a new order and emitting `order.created`.
- **Orchestrator (The Brain)**: The state machine. It listens to all events, persists the current saga state in PostgreSQL, and directs the next step.
- **Inventory Service**: Handles stock reservation (`inventory.reserve`) and commits or releases stock based on the saga outcome.
- **Payment Service**: Processes payments and returns `payment.success` or `payment.failed`.

## 🔄 Transaction Flow

| Step | Service | Action | Success Path | Failure (Compensating) |
|------|---------|--------|--------------|------------------------|
| 1 | Order | Create Order | `order.created` | N/A |
| 2 | Inventory | Reserve Stock | `inventory.reserved` | `inventory.failed` → `order.cancel` |
| 3 | Payment | Process Pay | `payment.success` | `payment.failed` → `inventory.release` |
| 4 | Inventory | Finalize | `inventory.completed` | N/A |
| 5 | Order | Confirm | Transaction Complete | Transaction Rolled Back |

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+) w/ TypeScript
- **Messaging**: Kafka (`kafkajs`)
- **Database**: PostgreSQL (Orchestrator state tracking)
- **Infrastructure**: Docker (for Kafka & Zookeeper)

## 🚀 Quick Start

**Spin up Infrastructure:**
- Ensure Kafka is running at `localhost:9092`.

**Install & Start:**
Run the following in `orchestrator-service`, `order-service`, `inventory-service`, and `payment-service`:

```bash
npm install
npm run dev
```

## 🎯 Learning Objectives

This "playground" is designed to help me master:

- **State Management**: Tracking distributed state in a centralized store.
- **Compensating Transactions**: Designing "undo" logic for partial failures.
- **Event-Driven Communication**: Leveraging Kafka topics for decoupled service interaction.

⚠️ **Note**: This is an educational project. It focuses on the core pattern rather than production concerns like idempotency or complex retries.
