# Design Document

## Overview

This design document outlines the implementation of category and subcategory management endpoints for the learning platform. The system will provide full CRUD operations for administrators while allowing public access to view categories and subcategories. The implementation follows the existing project architecture with routes, controllers, services, and validators.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Routes Layer                          │
│  /api/categories (GET - public, POST/PUT/DELETE - admin)   │
│  /api/subcategories (GET - public, POST/PUT/DELETE - admin)│
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Middleware Layer                            │
│  - Authentication (admin operations only)                    │
│  - Authorization (admin role check)                          │
│  - Validation (express-validator)                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Controller Layer                            │
│  - category.controller.js                                    │
│  - subCategory.controller.js                                │
│  - Request/Response handling                                │
│  - Error forwarding                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  - category.service.js                                       │
│  - subCategory.service.js                                   │
│  - Business logic                                           │
│  - Database operations                                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Layer                               │
│  - Category (Sequelize model)                               │
│  - SubCategory (Sequelize model)                            │
│  - Database schema                                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### API Endpoints

#### Category Endpoints

```
GET    /api/categories           - Get all categories (public)
GET    /api/categories/:id       - Get single category (public)
POST   /api/categories           - Create category (admin only)
PUT    /api/categories/:id       - Update category (admin only)
DELETE /api/categories/:id       - Delete category (admin only)
```

#### Subcategory Endpoints

```
GET    /api/subcategories              - Get all subcategories (public)
GET    /api/subcategories/:id          - Get single subcategory (public)
GET    /api/categories/:id/subcategories - Get subcategories by category (public)
POST   /api/subcategories              - Create subcategory (admin only)
PUT    /api/subcategories/:id          - Update subcategory (admin only)
DELETE /api/subcategories/:id          - Delete subcategory (admin only)
```

### Controller Functions

#### Category Controller

```javascript
// backend/controllers/category.controller.js

export const getAllCategories = async (req, res, next)
export const getCategoryById = async (req, res, next)
export const createCategory = async (req, res, next)
export const updateCategory = async (req, res, next)
export const deleteCategory = async (req, res, next)
```

#### Subcategory Controller

```javascript
// backend/controllers/subCategory.controller.js

export const getAllSubCategories = async (req, res, next)
export const getSubCategoryById = async (req, res, next)
export const getSubCategoriesByCategory = async (req, res, next)
export const createSubCategory = async (req, res, next)
export const updateSubCategory = async (req, res, next)
export const deleteSubCategory = async (req, res, next)
```

### Service Functions

#### Category Service

```javascript
// backend/services/category.service.js

export const getAllCategories = async ()
export const getCategoryById = async (categoryId)
export const createCategory = async (categoryData)
export const updateCategory = async (categoryId, updateData)
export const deleteCategory = async (categoryId)
export const checkCategoryHasCourses = async (categoryId)
```

#### Subcategory Service

```javascript
// backend/services/subCategory.service.js

export const getAllSubCategories = async ()
export const getSubCategoryById = async (subCategoryId)
export const getSubCategoriesByCategory = async (categoryId)
export const createSubCategory = async (subCategoryData)
export const updateSubCategory = async (subCategoryId, updateData)
export const deleteSubCategory = async (subCategoryId)
export const checkSubCategoryHasCourses = async (subCategoryId)
```

## Data Models

### Category Model (Existing)

```javascript
{
  id: STRING(50) PRIMARY KEY,
  name: STRING(100) UNIQUE NOT NULL,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### SubCategory Model (Existing)

```javascript
{
  id: STRING(50) PRIMARY KEY,
  category_id: STRING(50) FOREIGN KEY NOT NULL,
  name: STRING(100) UNIQUE NOT NULL,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Request/Response Formats

#### Create Category Request

```javascript
{
  name: string (required, 1-100 chars)
}
```

#### Create Subcategory Request

```javascript
{
  category_id: string (required, valid UUID),
  name: string (required, 1-100 chars)
}
```

#### Success Response Format

```javascript
{
  success: true,
  message: string,
  data: Category | SubCategory | Array
}
```

#### Error Response Format

```javascript
{
  success: false,
  message: string,
  errors: Array (for validation errors)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin-only write operations
*For any* create, update, or delete operation on categories or subcategories, the request should be rejected if the user is not authenticated as an admin
**Validates: Requirements 1.2, 1.3, 2.3, 2.4, 3.4, 3.5, 4.4, 4.5, 5.3, 5.4, 6.4, 6.5**

### Property 2: Public read access
*For any* GET request to categories or subcategories endpoints, the request should succeed without authentication
**Validates: Requirements 7.2**

### Property 3: Unique category names
*For any* category creation or update, if the name already exists, the operation should be rejected with a 400 error
**Validates: Requirements 1.4, 2.5**

### Property 4: Unique subcategory names within category
*For any* subcategory creation or update, if the name already exists within the same category, the operation should be rejected with a 400 error
**Validates: Requirements 4.3**

### Property 5: Valid parent category reference
*For any* subcategory creation or update, if the category_id does not reference an existing category, the operation should be rejected with a 404 error
**Validates: Requirements 4.2, 8.4**

### Property 6: Prevent deletion with associated courses
*For any* category or subcategory deletion, if there are courses associated with it, the operation should be rejected with a 400 error
**Validates: Requirements 3.2, 6.2**

### Property 7: Successful CRUD operations
*For any* valid create, read, update, or delete operation by an admin, the operation should succeed and return the appropriate success response
**Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 7.3**

### Property 8: Validation error messages
*For any* request with invalid data, the system should return detailed validation error messages indicating which fields are invalid
**Validates: Requirements 8.5**

### Property 9: Category retrieval with subcategories
*For any* GET request for a single category, the response should include all associated subcategories
**Validates: Requirements 7.1, 7.3**

### Property 10: Empty list handling
*For any* GET all request when no categories or subcategories exist, the system should return an empty array
**Validates: Requirements 7.5**

## Error Handling

### Error Categories

1. **Authentication Errors (401)**: User not authenticated
2. **Authorization Errors (403)**: User not admin
3. **Validation Errors (400)**: Invalid input data
4. **Not Found Errors (404)**: Resource doesn't exist
5. **Conflict Errors (400)**: Duplicate names, courses associated
6. **Server Errors (500)**: Database or unexpected errors

### Error Handling Strategy

All controllers will use try-catch blocks and forward errors to the error middleware:

```javascript
try {
  // Operation
  res.status(200).json({ success: true, data: result });
} catch (error) {
  next(error);
}
```

Service layer will throw custom errors with statusCode:

```javascript
if (!category) {
  const error = new Error("Category not found");
  error.statusCode = 404;
  throw error;
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Service functions handle valid inputs correctly
- Service functions throw appropriate errors for invalid inputs
- Controllers properly call service functions
- Validators correctly validate input data
- Error responses have correct format

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using **fast-check** as the PBT library.

Each property test should:
- Generate random valid and invalid inputs
- Test authorization and authentication requirements
- Verify error handling for edge cases
- Run a minimum of 100 iterations per property

Property tests will be tagged with comments:
```javascript
// Feature: category-management, Property 1: Admin-only write operations
```

### Integration Testing

Integration tests will verify:
- Complete CRUD flows for categories
- Complete CRUD flows for subcategories
- Authentication and authorization middleware
- Cascading operations (category with subcategories)
- Error scenarios end-to-end

## Implementation Details

### Validation Rules

#### Category Validation

```javascript
// Create/Update
- name: required, string, 1-100 characters, trimmed
- name: must be unique (case-insensitive)
```

#### Subcategory Validation

```javascript
// Create/Update
- name: required, string, 1-100 characters, trimmed
- category_id: required, valid UUID format
- category_id: must reference existing category
- name: must be unique within category (case-insensitive)
```

### Database Queries

#### Check for Associated Courses

```javascript
// For category
const courseCount = await Course.count({
  where: { category_id: categoryId }
});

// For subcategory
const courseCount = await Course.count({
  where: { subcategory_id: subCategoryId }
});
```

#### Get Category with Subcategories

```javascript
const category = await Category.findByPk(categoryId, {
  include: [{ model: SubCategory }]
});
```

### Route Protection

Admin-only routes will use middleware chain:

```javascript
router.post(
  "/",
  authenticate,           // Verify JWT token
  authorize("admin"),     // Check admin role
  createCategoryValidator, // Validate input
  validateResult,         // Check validation errors
  createCategory          // Controller function
);
```

Public routes will only use validation:

```javascript
router.get(
  "/:id",
  categoryIdValidator,
  validateResult,
  getCategoryById
);
```

### Response Formatting

All successful responses follow this format:

```javascript
res.status(statusCode).json({
  success: true,
  message: "Operation successful",
  data: result
});
```

For list endpoints:

```javascript
res.status(200).json({
  success: true,
  count: results.length,
  data: results
});
```

## Security Considerations

1. **Authentication**: JWT token validation for admin operations
2. **Authorization**: Role-based access control (admin only)
3. **Input Sanitization**: Trim and validate all string inputs
4. **SQL Injection**: Use Sequelize parameterized queries
5. **Rate Limiting**: Consider adding rate limiting for public endpoints
6. **CORS**: Ensure proper CORS configuration

## Performance Considerations

1. **Database Indexes**: Ensure indexes on name fields for uniqueness checks
2. **Eager Loading**: Load subcategories with categories when needed
3. **Caching**: Consider caching category list (rarely changes)
4. **Pagination**: Not needed initially (small dataset expected)

## Accessibility

Not applicable for backend API endpoints.

## Integration Points

### Course Model Integration

The Course model should reference categories and subcategories:

```javascript
// In course.model.js (if not already present)
category_id: {
  type: DataTypes.STRING(50),
  references: {
    model: 'categories',
    key: 'id'
  }
},
subcategory_id: {
  type: DataTypes.STRING(50),
  references: {
    model: 'sub_categories',
    key: 'id'
  }
}
```

### Model Associations

```javascript
// In models/index.model.js
Category.hasMany(SubCategory, { foreignKey: 'category_id' });
SubCategory.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasMany(Course, { foreignKey: 'category_id' });
Course.belongsTo(Category, { foreignKey: 'category_id' });

SubCategory.hasMany(Course, { foreignKey: 'subcategory_id' });
Course.belongsTo(SubCategory, { foreignKey: 'subcategory_id' });
```
