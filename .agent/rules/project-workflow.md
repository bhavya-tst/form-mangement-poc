---
trigger: model_decision
description: Apply when planning new features, handling unclear requirements, or making architectural decisions. Covers implementation planning, agent permissions, refactoring guidelines, and best practices for root cause analysis.
---

# Project Workflow & Management

## Plan Before Implementation
- **Rule**: Create a plan for the implementation and get user approval for the same before writing code
- **Process**:
  1. Understand current architecture
  2. Identify files to be modified
  3. Search for existing similar implementations
  4. Search for existing libraries if applicable
  5. Think through architectural implications
  6. Consider edge cases
  7. Identify best approach
  8. write a step-by-step clear plan
  9. **Get user approval before coding**
- **Requirement**: Ask clarifying questions if the task is unclear. DO NOT MAKE ASSUMPTIONS.
- **Pattern**: Propose the plan, explain reasoning, wait for approval, then execute
- **Violation**: ❌ Jumping directly to implementation, making assumptions, skipping architecture review

---

## Strict Agent Permissions & Protocol

- **ENV Files**: **DO NOT** modify `.env` files or create new environment variables without explicit user approval.
- **Migrations**: **DO NOT** run `db:migrate` or similar database-altering commands without explicit user approval.
- **Dependencies**: **DO NOT** install new packages or update `package.json` without explicit user approval.
- **Production State**: Agents must never touch production configurations or environments unless specifically instructed for a deployment task.
- **Violation**: ❌ Running destructive CLI commands; mutating environment state silently.

---

## Avoid Large Refactors Unless Instructed
- **Rule**: Do not perform large-scale refactoring without explicit instruction
- **Reasoning**: Unasked refactors can introduce unexpected changes and break existing functionality
- **Violation**: ❌ Restructuring project layout, reorganizing file structure, or major API changes without user request

---

## Documentation & Communication

### Clarify Ambiguous Tasks
- **Rule**: Ask follow-up questions when task requirements are unclear
- **Process**:
    1. Identify unclear aspects
    2. Ask specific, focused questions
    3. Get clarity before proceeding
    4. Document assumptions
- **Violation**: ❌ Making incorrect assumptions, implementing wrong solution, wasting time on rework

### No Dummy Implementations
- **Rule**: Implement complete, production-ready solutions
- **Requirement**: Never provide placeholder implementations with statements like "This is how it _would_ look like"
- **Pattern**: Fully implement the requested feature with proper error handling, validation, and edge cases
- **Violation**: ❌ Providing skeleton code, incomplete implementations, or "mock" versions

### Break Down Large Tasks
- **Rule**: Decompose large or vague tasks into smaller, manageable subtasks
- **Process**:
  1. Analyze the overall scope
  2. Identify logical subtasks
  3. Sequence them appropriately
  4. Present breakdown to user
  5. Get approval on approach
- **When to Apply**: Tasks that are very large in scope or too vague to start immediately
- **Benefit**: Reduces risk, enables better progress tracking, provides clear milestones
- **Violation**: ❌ Attempting to implement large, undefined tasks in one go

---

## Best Practices & Principles

### Root Cause Analysis
- **Rule**: Identify and fix root causes, not symptoms
- **Process**:
  1. Identify the issue
  2. Investigate underlying cause
  3. Understand why it's happening
  4. Fix the root cause
- **Violation**: ❌ Throwing random solutions at a problem, giving up with vague excuses like "library isn't working"

### Read-First Approach
- **Rule**: Understand existing code before making modifications
- **Why**:
  - Prevents breaking existing functionality
  - Maintains consistency with codebase style
  - Identifies reusable code blocks or functions
  - Ensures architectural alignment
- **Pattern**: Always read full context before editing any file
- **Violation**: ❌ Making blind edits without understanding context

### Handle Edge Cases
- **Rule**: Anticipate and handle system failures, concurrency issues, and invalid states.
- **Examples**:
  - Database connection timeouts or deadlocks
  - Race conditions in inventory/payment processing
  - External API downtime or rate limiting
  - Malformed JSON payloads or large file uploads
  - Token expiration during long-running processes
- **Pattern**:
  - Use database transactions for atomicity
  - Implement retry mechanisms with exponential backoff for external calls
  - Validate all inputs (headers, body, query params)
  - Return appropriate HTTP status codes (4xx vs 5xx)
- **Violation**: ❌ Happy-path-only implementations, crashing on DB errors, ignoring race conditions

### Expertise & Polyglot Development
- **Rule**: Apply expertise across diverse technologies and domains
- **Areas of Expertise**:
  - Software architecture and system design
  - Development across multiple languages and frameworks
  - Database design
  - Technical writing and documentation
- **Requirement**: Draw on comprehensive knowledge to solve problems optimally