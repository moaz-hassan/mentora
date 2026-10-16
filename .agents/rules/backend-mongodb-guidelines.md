# Backend & MongoDB Guidelines for Mentora

## Core 4-Tier Clean Architecture
1. **Controllers (`src/controllers/`)**: Ultra-thin. HTTP request parsing, service invocation, and unified JSON response formatting only. NO business logic, NO DB queries.
2. **Services (`src/services/`)**: Domain business logic, workflow orchestration, rule validation, email dispatch, and queue processing. NO direct database queries.
3. **Repositories (`src/repositories/`)**: Pure data-access layer. All Mongoose queries (`find`, `create`, `findByIdAndUpdate`, `aggregate`, pagination) reside exclusively here.
4. **Models (`src/models/`)**: Pure schema and index declarations only. NO business logic, instance methods, or static workflow functions in model files.

## MongoDB & Contract Standards
- Maintain all existing API JSON contracts so the Next.js frontend continues working seamlessly.
- Use ES Modules (`import`/`export`).
- All Mongoose models support `{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }`.
- Provide a virtual `id` mapping to `_id` and remove `__v` on JSON serialization so frontend components get `item.id`.
- Use Mongoose aggregation pipelines for reporting, analytics, and complex rollups inside repositories.
- Text search utilizes compound `$text` indexes.
