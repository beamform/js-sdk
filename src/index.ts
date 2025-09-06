// Client-side (browser) - session token authentication
export { BeamformClient } from './client'
export type { BeamformClientConfig } from './client'

// Server-side - API key authentication  
export { BeamformServerClient } from './server-client'
export type { BeamformServerClientConfig } from './server-client'

// Path filtering types (useful for custom implementations)
export type { ClientPaths, ServerPaths } from './path-filters'

// Utility functions
export { formatError } from './utils'

// Generated OpenAPI types
export type { paths, components } from './generated/schema'