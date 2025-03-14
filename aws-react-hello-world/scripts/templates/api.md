---
title: "{{title}}"
category: "{{category}}"
order: {{order}}
tags: [{{tags}}]
---

# {{title}}

## API Overview

[Provide a brief overview of this API, its purpose, and key features]

## Endpoints

### Endpoint 1: `GET /api/resource`

**Description**: [Describe what this endpoint does]

**Parameters**:
- `param1` (string, required): Description of parameter
- `param2` (number, optional): Description of parameter

**Request Example**:
```http
GET /api/resource?param1=value&param2=123
```

**Response Example**:
```json
{
  "id": "resource-id",
  "name": "Resource Name",
  "status": "active"
}
```

**Status Codes**:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Server Error

### Endpoint 2: `POST /api/resource`

**Description**: [Describe what this endpoint does]

**Request Body**:
```json
{
  "name": "New Resource",
  "type": "example"
}
```

**Response Example**:
```json
{
  "id": "new-resource-id",
  "name": "New Resource",
  "type": "example",
  "createdAt": "2025-03-13T10:30:00Z"
}
```

**Status Codes**:
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 500: Server Error

## Authentication

[Describe authentication requirements and methods]

## Error Handling

[Explain how errors are returned and how to handle them]

## Rate Limiting

[Describe any rate limiting policies]

## Examples

### Example 1: [Title]

```typescript
// Code example for using this API
async function fetchResource(id) {
  const response = await fetch(`/api/resource/${id}`);
  const data = await response.json();
  return data;
}
```

## Best Practices

- [List best practices for using this API]
- [Security considerations]
- [Performance tips]

## Related Documentation

- [Link to related API documentation]
- [Link to models or schemas used by this API]
