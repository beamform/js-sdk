# Run all quality checks
quality:
    pnpm lint

# Run tests
test:
    pnpm typecheck
    pnpm test

# Format all files
format:
    pnpm format
