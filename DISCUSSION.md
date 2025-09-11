## Technical Discussion Topics

### Data Management & Performance
- **FE vs BE enrichment** - Scalability, caching business data in Redis vs server - multiple calls to DB
- **React Query** - Deduplication and caching benefits
- **toSorted vs spread** - Browser compatibility considerations
- **Memoized components** - React performance optimization
- **Break down components** - smaller components + custom hook + utility function + type file
- **BE and FE interface types**
- **socket events** connection retries + events

### Alternative Technologies
- **Server-Sent Events** - Alternative to WebSocket

### User Interface
- **Search debouncing**
- **Search sanitization**
- **Pagination strategy** - Frontend vs Backend (scale vs convenience/maintenance)
- **accessibility**
- **CSS variables**
- **clean up setTimeout if needed**
- **loading/empty state**
- **WebSocket error states** - Connection failure handling (e.g lose internet) + classify error + client vs server error
- **Error boundaries** - React error catching
- **Error vs 0 display** - How to show failed business data updates

### API Optimization
- **Parallel API calls** - p-limit, rate limiting, browser considerations
- **Batch endpoints** - Accept list instead of individual calls for transaction counts

### BE
- **database connections**
- **error handling** - DRY + type + rollback strategy
- **params validation**
- **type check**
- **security concerns**
