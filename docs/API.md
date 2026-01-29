# BioinformaticsHub API Documentation

## Profile Management

### `PATCH /api/user/profile`
Updates the authenticated user's profile information and preferences.

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "string (optional, min 2 chars)",
  "marketingEmails": "boolean (optional)",
  "securityEmails": "boolean (optional)",
  "language": "string (optional, e.g. 'en', 'es')"
}
```

**Response**:
- `200 OK`: Returns the updated user object.
- `401 Unauthorized`: If not logged in.
- `400 Bad Request`: If validation fails.

---

### `PATCH /api/profile/password`
Updates the user's password.

**Auth Required**: Yes

**Request Body**:
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 chars)"
}
```

**Response**:
- `200 OK`: `{ "success": true }`
- `400 Bad Request`: If passwords don't match criteria.
- `401 Unauthorized`: If current password is incorrect.

---

### `POST /api/profile/password/reset`
Initiates a password reset flow (sends email).

**Auth Required**: Yes (or No if public reset flow) - Currently requires session in implementation? Checked code: No, it checks `email` specific logic.
*Correction*: The implementation accepts `{ email }`. It does not explicitly check `auth()` session for the request itself, allowing "Forgot Password" from public pages, but in the Profile page we use it with session email.

**Request Body**:
```json
{
  "email": "string (required)"
}
```

**Response**:
- `200 OK`: `{ "success": true, "message": "..." }`
- `400 Bad Request`: If email missing.

---

## Payment Methods

### `GET /api/profile/payment-methods`
Lists all saved payment methods for the current user.

**Auth Required**: Yes

**Response**:
- `200 OK`: Array of PaymentMethod objects.
  ```json
  [
    {
      "id": "cm...",
      "brand": "Visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2028,
      "isDefault": false
    }
  ]
  ```

### `POST /api/profile/payment-methods`
Attaches a new payment method (via Stripe).

**Auth Required**: Yes

**Request Body**:
```json
{
  "paymentMethodId": "string (required, from Stripe Elements)"
}
```

**Response**:
- `200 OK`: The created PaymentMethod object.
- `500 Internal Error`: If Stripe interaction fails.

### `DELETE /api/profile/payment-methods/[id]`
Removes a payment method.

**Auth Required**: Yes

**Response**:
- `200 OK`: `{ "success": true }`
- `403 Forbidden`: If trying to delete someone else's method.
