# ACME Salary Management - Engineering Artifacts

## 1. Requirements Document

## Goal

Build a web-based salary management system for ACME Corp's HR Manager to
replace tedious, error-prone Excel workflows.

The system manages compensation data for 10,000 employees across
multiple countries and departments.

------------------------------------------------------------------------

# Scope & Core Features

## Employee Management

CRUD operations for employee records:

-   Personal information
-   Department
-   Country
-   Job level
-   Employment status

------------------------------------------------------------------------

## Salary Management

Features:

-   Track base salary
-   Track bonuses
-   Maintain salary history
-   Audit every compensation change

------------------------------------------------------------------------

## Bulk Operations

### Employee Bulk Import

-   CSV-based employee upload
-   Validation
-   Large scale processing

### Bulk Salary Adjustments

Supports:

-   Annual increments
-   Organization-wide revisions
-   Promotion adjustments

------------------------------------------------------------------------

## Analytics & Reporting

Dashboard provides:

-   Headcount
-   Total payroll
-   Average salary
-   Median salary
-   Salary band distribution

Filters:

-   Department
-   Country

------------------------------------------------------------------------

## Data Seeding

Automated script generates:

-   10,000 realistic employees
-   Multiple countries
-   Multiple departments
-   Job levels L1-L7
-   Realistic salary bands

------------------------------------------------------------------------

# Out of Scope

## Payroll Processing

Not included:

-   Bank transfers
-   Tax withholding
-   Payroll execution

Reason:

Focus remains on compensation management and visibility.

------------------------------------------------------------------------

## Employee Self Service

Only HR Manager access is supported.

No employee portal.

Reason:

Avoid scope expansion.

------------------------------------------------------------------------

## Complex RBAC

Implemented:

-   JWT authentication
-   Single HR Admin role

Not included:

-   Multi tenant permissions
-   Complex authorization matrix

------------------------------------------------------------------------

## Multi Currency Conversion

Salary values are normalized in USD.

No real-time FX integration.

------------------------------------------------------------------------

# 2. Architecture & Design Notes

## Technology Stack

### Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   TanStack Query
-   Lucide Icons
-   Recharts

### Backend

-   Python
-   FastAPI
-   SQLAlchemy Async
-   Pydantic

### Database

Development:

SQLite

Production:

PostgreSQL using Neon.tech

------------------------------------------------------------------------

# Design Patterns

## Repository Pattern

Database access is abstracted through repositories.

Benefits:

-   Better testing
-   Separation of persistence logic
-   Easy technology changes

------------------------------------------------------------------------

## Separation of Concerns

Layers:

### Models

Database schema and relationships.

### Schemas

API validation and serialization.

### Services

Business workflows and logic.

------------------------------------------------------------------------

## Server Driven UI State

TanStack Query manages:

-   Cache
-   Refetching
-   Invalidation
-   Server synchronization

------------------------------------------------------------------------

# Architecture Flow

React Frontend \| TanStack Query \| FastAPI APIs \| Service Layer \|
Repository Layer \| SQLAlchemy Async \| SQLite/PostgreSQL

------------------------------------------------------------------------

# 3. Trade-off Explanations

## SQLite vs PostgreSQL

Decision:

SQLite for local development. PostgreSQL for production.

Reason:

SQLite requires zero setup.

PostgreSQL provides:

-   Persistent storage
-   Production reliability
-   Cloud compatibility

------------------------------------------------------------------------

## Eager Loading vs Lazy Loading

Decision:

Use:

-   selectinload
-   joinedload

Reason:

Lazy loading causes N+1 queries.

Example:

1 employee query

-   

10000 relationship queries

Eager loading avoids this and improves performance.

------------------------------------------------------------------------

## Monorepo vs Polyrepo

Decision:

Single repository.

Benefits:

-   Easier review
-   Easier setup
-   Better project context

------------------------------------------------------------------------

# Performance Considerations

## Pagination

Employee APIs use:

page and page_size

Benefits:

-   Smaller payloads
-   Faster rendering
-   Better scalability

------------------------------------------------------------------------

## Database Indexing

Indexes added on:

-   employee_code
-   email
-   department_id
-   country_id
-   employment_status

------------------------------------------------------------------------

## Async Processing

Uses:

-   FastAPI async
-   SQLAlchemy async
-   asyncpg

Benefits:

-   Non blocking operations
-   Better concurrency

------------------------------------------------------------------------

## Database Aggregation

Analytics calculations are executed inside SQL using:

-   COUNT
-   SUM
-   AVG

Avoids loading all records into Python memory.

------------------------------------------------------------------------

# AI Tool Usage

AI was used as an accelerator for:

-   Boilerplate generation
-   Debugging
-   UI component creation

All generated logic was manually reviewed.

Special focus:

-   Authentication
-   Transactions
-   Async correctness

------------------------------------------------------------------------

# Example AI Prompts

## Async Debugging

Debug FastAPI async dependency injection issues involving
asynccontextmanager and provide the correct async generator pattern.

------------------------------------------------------------------------

## N+1 Query Debugging

Fix MissingGreenlet errors during SQLAlchemy relationship serialization
using selectinload.

------------------------------------------------------------------------

## Seed Data Generation

Generate 10,000 realistic employee records using Faker with departments,
countries and salary levels.

------------------------------------------------------------------------

## UI Generation

Create a React table with:

-   Sticky header
-   Pagination
-   Dynamic page ranges

------------------------------------------------------------------------

# Testing Strategy

## Backend Tests

Covered:

-   Repository layer
-   Business logic
-   Salary calculations
-   CSV parsing

Database:

-   In-memory SQLite

Benefits:

-   Fast
-   Deterministic
-   Isolated

------------------------------------------------------------------------

## Frontend Strategy

Focused on:

-   TanStack Query caching
-   Component isolation
-   Predictable server state

------------------------------------------------------------------------

# Final Summary

ACME Salary Management provides:

-   Employee management
-   Salary history tracking
-   Bulk operations
-   Analytics dashboard
-   Scalable architecture

The system balances:

-   Performance
-   Maintainability
-   Simplicity
-   Future scalability
