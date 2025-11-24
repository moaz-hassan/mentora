# Category and Subcategory API Endpoints

## Category Endpoints

### Get All Categories
```
GET /api/categories
```
- **Authentication**: Not required
- **Response**: Array of categories with their subcategories

### Get Single Category
```
GET /api/categories/:id
```
- **Authentication**: Not required
- **Response**: Single category with subcategories

### Create Category (Admin Only)
```
POST /api/categories
```
- **Authentication**: Required (Admin only)
- **Body**:
```json
{
  "name": "Web Development"
}
```

### Update Category (Admin Only)
```
PUT /api/categories/:id
```
- **Authentication**: Required (Admin only)
- **Body**:
```json
{
  "name": "Updated Category Name"
}
```

### Delete Category (Admin Only)
```
DELETE /api/categories/:id
```
- **Authentication**: Required (Admin only)
- **Note**: Cannot delete if category has associated courses

---

## Subcategory Endpoints

### Get All Subcategories
```
GET /api/subcategories
```
- **Authentication**: Not required
- **Response**: Array of subcategories with parent category info

### Get Single Subcategory
```
GET /api/subcategories/:id
```
- **Authentication**: Not required
- **Response**: Single subcategory with parent category info

### Get Subcategories by Category
```
GET /api/categories/:id/subcategories
```
- **Authentication**: Not required
- **Response**: Array of subcategories for specific category

### Create Subcategory (Admin Only)
```
POST /api/subcategories
```
- **Authentication**: Required (Admin only)
- **Body**:
```json
{
  "name": "React",
  "category_id": "uuid-of-parent-category"
}
```

### Update Subcategory (Admin Only)
```
PUT /api/subcategories/:id
```
- **Authentication**: Required (Admin only)
- **Body**:
```json
{
  "name": "Updated Subcategory Name",
  "category_id": "uuid-of-new-parent-category"
}
```

### Delete Subcategory (Admin Only)
```
DELETE /api/subcategories/:id
```
- **Authentication**: Required (Admin only)
- **Note**: Cannot delete if subcategory has associated courses

---

## Error Responses

### 400 Bad Request
- Duplicate category/subcategory name
- Category/subcategory has associated courses (on delete)
- Validation errors

### 401 Unauthorized
- Missing or invalid authentication token

### 403 Forbidden
- User is not an admin

### 404 Not Found
- Category/subcategory not found
- Parent category not found (for subcategory operations)

---

## Testing with cURL

### Create Category (Admin)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"name": "Web Development"}'
```

### Get All Categories (Public)
```bash
curl http://localhost:5000/api/categories
```

### Create Subcategory (Admin)
```bash
curl -X POST http://localhost:5000/api/subcategories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"name": "React", "category_id": "CATEGORY_UUID"}'
```

### Get Subcategories by Category (Public)
```bash
curl http://localhost:5000/api/categories/CATEGORY_UUID/subcategories
```
