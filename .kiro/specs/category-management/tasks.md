# Implementation Plan

- [x] 1. Create category validators


  - Create `backend/validators/category.validator.js`
  - Implement `createCategoryValidator` with name validation (required, 1-100 chars, trimmed)
  - Implement `updateCategoryValidator` with optional name validation and required ID param
  - Implement `categoryIdValidator` for ID parameter validation
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 2. Create subcategory validators


  - Create `backend/validators/subCategory.validator.js`
  - Implement `createSubCategoryValidator` with name and category_id validation
  - Implement `updateSubCategoryValidator` with optional fields and required ID param
  - Implement `subCategoryIdValidator` for ID parameter validation
  - _Requirements: 8.3, 8.4, 8.5_

- [x] 3. Implement category service layer


  - Create `backend/services/category.service.js`
  - Implement `getAllCategories` to fetch all categories with subcategories
  - Implement `getCategoryById` to fetch single category with subcategories
  - Implement `createCategory` with duplicate name check
  - Implement `updateCategory` with existence and duplicate name checks
  - Implement `deleteCategory` with course association check
  - Implement `checkCategoryHasCourses` helper function
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.5, 3.1, 3.2, 3.3, 7.1, 7.3, 7.4, 7.5_

- [x] 4. Implement subcategory service layer


  - Create `backend/services/subCategory.service.js`
  - Implement `getAllSubCategories` to fetch all subcategories
  - Implement `getSubCategoryById` to fetch single subcategory
  - Implement `getSubCategoriesByCategory` to fetch subcategories by category ID
  - Implement `createSubCategory` with parent category check and duplicate name check
  - Implement `updateSubCategory` with existence checks and optional parent category update
  - Implement `deleteSubCategory` with course association check
  - Implement `checkSubCategoryHasCourses` helper function
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.5, 6.1, 6.2, 6.3, 7.1, 7.3, 7.4, 7.5_

- [x] 5. Implement category controller


  - Create `backend/controllers/category.controller.js`
  - Implement `getAllCategories` controller function
  - Implement `getCategoryById` controller function
  - Implement `createCategory` controller function
  - Implement `updateCategory` controller function
  - Implement `deleteCategory` controller function
  - Add proper error handling and response formatting for all functions
  - _Requirements: 1.1, 2.1, 3.1, 7.1, 7.3_

- [x] 6. Implement subcategory controller


  - Create `backend/controllers/subCategory.controller.js`
  - Implement `getAllSubCategories` controller function
  - Implement `getSubCategoryById` controller function
  - Implement `getSubCategoriesByCategory` controller function
  - Implement `createSubCategory` controller function
  - Implement `updateSubCategory` controller function
  - Implement `deleteSubCategory` controller function
  - Add proper error handling and response formatting for all functions
  - _Requirements: 4.1, 5.1, 6.1, 7.1, 7.3_

- [x] 7. Create category routes


  - Update `backend/routes/category.routes.js`
  - Define GET /api/categories (public)
  - Define GET /api/categories/:id (public)
  - Define POST /api/categories (admin only with authentication and authorization)
  - Define PUT /api/categories/:id (admin only with authentication and authorization)
  - Define DELETE /api/categories/:id (admin only with authentication and authorization)
  - Wire up validators and controllers for each route
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 2.4, 3.1, 3.4, 3.5, 7.1, 7.2, 7.3_

- [x] 8. Create subcategory routes


  - Update `backend/routes/subCategory.routes.js`
  - Define GET /api/subcategories (public)
  - Define GET /api/subcategories/:id (public)
  - Define GET /api/categories/:id/subcategories (public)
  - Define POST /api/subcategories (admin only with authentication and authorization)
  - Define PUT /api/subcategories/:id (admin only with authentication and authorization)
  - Define DELETE /api/subcategories/:id (admin only with authentication and authorization)
  - Wire up validators and controllers for each route
  - _Requirements: 4.1, 4.4, 4.5, 5.1, 5.3, 5.4, 6.1, 6.4, 6.5, 7.1, 7.2, 7.3_

- [x] 9. Register routes in main app


  - Update `backend/app.js` to import and use category and subcategory routes
  - Mount category routes at `/api/categories`
  - Mount subcategory routes at `/api/subcategories`
  - Ensure routes are registered in correct order (before error middleware)
  - _Requirements: 7.1_

- [x] 10. Update model associations


  - Update `backend/models/index.model.js` to define associations
  - Add Category hasMany SubCategory relationship
  - Add SubCategory belongsTo Category relationship
  - Add Category hasMany Course relationship (if not exists)
  - Add SubCategory hasMany Course relationship (if not exists)
  - _Requirements: 3.2, 6.2, 7.1, 7.3_

- [ ] 11. Testing and validation
  - [ ]* 11.1 Write property test for admin-only operations
    - **Property 1: Admin-only write operations**
    - **Validates: Requirements 1.2, 1.3, 2.3, 2.4, 3.4, 3.5, 4.4, 4.5, 5.3, 5.4, 6.4, 6.5**
    - Test that non-admin users cannot create, update, or delete categories/subcategories

  - [ ]* 11.2 Write property test for public read access
    - **Property 2: Public read access**
    - **Validates: Requirements 7.2**
    - Test that GET requests work without authentication

  - [ ]* 11.3 Write property test for unique category names
    - **Property 3: Unique category names**
    - **Validates: Requirements 1.4, 2.5**
    - Test that duplicate category names are rejected

  - [ ]* 11.4 Write property test for unique subcategory names
    - **Property 4: Unique subcategory names within category**
    - **Validates: Requirements 4.3**
    - Test that duplicate subcategory names within same category are rejected

  - [ ]* 11.5 Write property test for valid parent category
    - **Property 5: Valid parent category reference**
    - **Validates: Requirements 4.2, 8.4**
    - Test that invalid category_id references are rejected

  - [ ]* 11.6 Write property test for deletion protection
    - **Property 6: Prevent deletion with associated courses**
    - **Validates: Requirements 3.2, 6.2**
    - Test that categories/subcategories with courses cannot be deleted

  - [ ]* 11.7 Write unit tests for service layer
    - Test all CRUD operations in category service
    - Test all CRUD operations in subcategory service
    - Test error handling for edge cases
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [ ]* 11.8 Write integration tests for API endpoints
    - Test complete CRUD flows for categories
    - Test complete CRUD flows for subcategories
    - Test authentication and authorization
    - Test validation errors
    - _Requirements: All requirements_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
