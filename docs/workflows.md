# Workflows

FLIHub workflows use a lightweight typed pipeline rather than a large workflow-engine framework.

## Pattern

External input -> Zod schema -> Validated DTO -> Domain objects -> Workflow pipeline -> Result DTO.

Pipeline stages support async operations, are independently testable, preserve TypeScript types between stages, and return discriminated `WorkflowResult` values for predictable success or failure.

## League example

Tournament registration input -> Validate -> Resolve player and tournament -> Check player activity -> Check duplicate registration and capacity -> Create registration -> Return result DTO.

## Business example

Reimbursement request -> Validate -> Resolve department -> Resolve project if applicable -> Validate items through domain objects -> Calculate total -> Submit claim -> Return result DTO.

## Design constraints

Workflows should orchestrate domain behavior without becoming giant service classes. Business rules belong in domain objects when a specific object owns the behavior.
