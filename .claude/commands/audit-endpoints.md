---
description: Dynamic audit of OpenAPI wrapper endpoint implementations
argument-hint: [filter]
allowed-tools: Bash(just generate:*), Read(*), Grep(*), Glob(*)
model: claude-opus-4-1-20250805
---

# Audit OpenAPI Endpoint Wrappers

## Usage

```
/audit-endpoints [filter]
```

## Process Overview

### Phase 1: Dynamic Discovery

1. **Regenerate Schema**: Run `just generate` to ensure latest OpenAPI schema is used
2. **Parse OpenAPI Schema**: Extract all endpoints from `/src/generated/schema.d.ts`
3. **Categorize Endpoints**: Determine auth type by authentication requirements
   - Endpoints requiring API key authentication = server auth
   - Endpoints requiring session token authentication = browser auth
   - Endpoints with no authentication requirements = both, add wrapper to both clients
4. **Extract Endpoint Metadata**: For each endpoint, collect parameters, request/response types, and operation details

### Phase 2: Implementation Validation

For each endpoint, validate against established patterns:

#### Wrapper Implementation Patterns

- **File Location**: Server endpoints in `/src/server/*.ts`, browser in `/src/browser/*.ts`
- **Method Naming**: Use camelCase operation IDs from schema (e.g., `createKey`, `getCurrentSession`)
- **Parameter Structure**:
  - Single parameter object: `(params: PathParams & QueryParams & { data?: RequestBody })`
  - Optional parameters use `?` or `undefined` handling
- **Type Definitions**: All types imported from `../generated/schema`
- **Error Handling**: Consistent pattern: `throw new Error(\`Failed to [action]: \${formatError(error)}\`)`
- **Client Integration**: Use `client.METHOD(path, { params, body })` pattern

#### Parameter Handling Patterns

- **Path Parameters**: Pass via `params: { path: pathParams }`
- **Query Parameters**: Pass via `params: { query: cleanQueryParams }` with filtering out undefined values
- **Headers**: Pass via `params: { header: headers }` for headers like `Idempotency-Key`
- **Request Body**: Pass via `body: requestData`

#### Response Handling Patterns

- **Success Response**: Return `data` directly with proper typing
- **Error Response**: Use `formatError(error)` utility for consistent error messages
- **Void Responses**: Return `Promise<void>` for 204 No Content responses

#### Test Implementation Patterns

- **Test Structure**: One `describe` block per method, success and error test cases
- **Mock Setup**: Use `vi.fn().mockResolvedValue({ data, error })` pattern
- **Assertions**: Verify endpoint URL, parameters, and response handling
- **Error Testing**: Test error message formatting with `formatError`

## Audit Checklist

For each discovered endpoint, validate:

### ✅ Implementation Existence

- [ ] Wrapper method exists in appropriate file (`/src/server/` or `/src/browser/`)
- [ ] Method name matches operation ID from schema (camelCase)
- [ ] Method is exported in interface and implementation

### ✅ Parameter Handling

- [ ] All path parameters from schema are handled
- [ ] Query parameters filtered for `undefined` values
- [ ] Headers handled correctly (especially `Idempotency-Key`)
- [ ] Request body structure matches schema

### ✅ Type Safety

- [ ] Parameter types reference OpenAPI schema paths
- [ ] Response types reference correct schema response
- [ ] Proper imports from `../generated/schema`
- [ ] Parameter type naming follows pattern:
  - Query parameters: `*Query` (e.g., `ListKeysQuery`, `InboxQuery`)
  - Path parameters: `*Params` or `*PathParams` (e.g., `GetKeyParams`, `ListSessionsPathParams`)
  - Combined parameters: Use `&` to join types (e.g., `PathParams & Partial<Query>`)

### ✅ Error Handling

- [ ] Uses `formatError(error)` utility
- [ ] Error message follows pattern: `"Failed to [action]: ${formatError(error)}"`
- [ ] Returns proper Promise types (`void` for 204 responses)

### ✅ Test Coverage

- [ ] Test file exists with same name pattern
- [ ] Success case test with proper mocking
- [ ] Error case test with error message validation
- [ ] Parameter variation tests (optional params)
- [ ] Mock verifies correct endpoint URL and parameters

## Output Format

### Summary Report

```
Endpoint Audit Results (Discovered X endpoints)
===============================================

✅ Passed: X endpoints
❌ Failed: X endpoints
⚠️  Issues: X total

By Category:
- Server: X/X endpoints ✅
- Browser: X/X endpoints ✅
```

### Detailed Results

```
❌ POST /v1/auth/keys - createKey
Issues:
- Missing request body parameter handling
- Test coverage: No error case tests

✅ GET /v1/auth/session/current - getCurrentSession
All checks passed

⚠️  GET /v1/auth/keys - listKeys
Issues:
- Optional pageSize parameter not handled correctly
```

## Command Implementation

1. **Schema Regeneration**: Run `just generate` to rebuild schema from latest OpenAPI spec
2. **Dynamic Discovery**: Parse schema to find all endpoints
3. **Pattern Validation**: Check each endpoint against established patterns
4. **Generate Report**: Show discovered endpoints and validation results
5. **Provide Fixes**: Suggest specific remediation for failures

## Remediation Process

One endpoint per commit. Implementation + tests together. Quality gates required.

### Fix Workflow (Per Endpoint)

1. **Update Implementation**: Fix wrapper method to match established patterns
2. **Update Tests**: Add/modify tests to cover the fixed implementation
3. **Run Quality Checks**: `just generate && just quality && just test`
4. **Commit**: Single commit with conventional format

### Quality Gates

All checks must pass before commit:

- ✅ `just generate` - Regenerate types from OpenAPI spec
- ✅ `just quality` - Linting
- ✅ `just test` - Type checking and tests
