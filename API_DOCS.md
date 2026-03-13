# Shop OS — Complete API Documentation

Base URL: `https://api.shopos.in/api`

All protected endpoints require: `Authorization: Bearer <token>`

---

## AUTH

### POST /auth/register
Register new shop + admin user.
```json
{ "shopName": "Kirana King", "ownerName": "Kiran", "email": "k@k.com", "password": "secure123", "phone": "9876543210" }
```
Response: `{ token, user, shop }`

### POST /auth/login
```json
{ "email": "k@k.com", "password": "secure123" }
```
Response: `{ token, user, shop }`

### POST /auth/forgot-password
```json
{ "email": "k@k.com" }
```

### POST /auth/reset-password
```json
{ "token": "reset-token", "password": "newpassword" }
```

---

## PRODUCTS

### GET /products
Query: `?page=1&limit=20&search=rice&category=<id>&lowStock=true`

### POST /products *(Admin/Manager)*
```json
{
  "name": "Basmati Rice 5kg", "sku": "PRD-001", "barcode": "8901234567890",
  "categoryId": "cat_id", "costPrice": 180, "sellingPrice": 320,
  "taxRate": 5, "stock": 100, "lowStockAlert": 10, "unit": "bag"
}
```

### PUT /products/:id *(Admin/Manager)*
### DELETE /products/:id *(Admin only)*

### GET /products/:id/stock-history
### POST /products/:id/adjust-stock *(Admin/Manager)*
```json
{ "quantity": -5, "note": "Damaged goods removed" }
```

---

## ORDERS

### POST /orders
```json
{
  "customerId": "cust_id",  // optional
  "items": [
    { "productId": "prod_id", "name": "Basmati Rice", "quantity": 2, 
      "costPrice": 180, "unitPrice": 320, "taxRate": 5 }
  ],
  "discountAmount": 50,
  "paymentMethod": "UPI",  // CASH | UPI | CARD | BANK_TRANSFER | CREDIT
  "notes": "Bulk order"
}
```

### GET /orders
Query: `?page=1&limit=20&startDate=2026-01-01&endDate=2026-03-08&customerId=&status=`

### GET /orders/:id
### PUT /orders/:id/cancel *(Admin/Manager)*

---

## CUSTOMERS

### GET /customers?search=&page=1&limit=20
### POST /customers
```json
{ "name": "Rajan Patel", "phone": "9876543210", "email": "r@r.com", "address": "..." }
```
### PUT /customers/:id
### GET /customers/:id/orders
### POST /customers/:id/payment  *(Record outstanding payment)*

---

## SUPPLIERS

### GET /suppliers
### POST /suppliers
```json
{ "name": "ABC Traders", "phone": "9876543210", "email": "abc@traders.com", "gstNumber": "..." }
```
### GET /suppliers/:id/purchases

---

## PURCHASES

### POST /purchases *(Auto-increments stock)*
```json
{
  "supplierId": "sup_id",
  "billNumber": "BILL-001",
  "purchaseDate": "2026-03-08",
  "items": [
    { "productId": "prod_id", "quantity": 50, "costPrice": 175 }
  ],
  "paidAmount": 8750
}
```
### GET /purchases?page=1&limit=20&supplierId=
### GET /purchases/:id

---

## EXPENSES

### POST /expenses
```json
{ "category": "RENT", "amount": 15000, "description": "March rent", "date": "2026-03-01" }
```
*Categories: RENT | ELECTRICITY | SALARY | MAINTENANCE | MARKETING | TRANSPORT | OTHER*

### GET /expenses?startDate=&endDate=&category=
### DELETE /expenses/:id

---

## ANALYTICS

### GET /analytics/dashboard
Returns: today sales, monthly revenue, profit, top products, low stock, recent orders, monthly chart.

### GET /analytics/sales-report?startDate=&endDate=
### GET /analytics/profit-report?month=2026-02
### GET /analytics/inventory-report

---

## AI

### POST /ai/chat
```json
{ "message": "What's my profit this month?" }
```
Response: `{ "reply": "Your net profit is ₹40,500..." }`

### GET /ai/insights
Response: `{ "insights": [{ "type": "warning", "icon": "⚠️", "message": "..." }] }`

---

## REPORTS (Export)

### GET /reports/sales?format=csv&startDate=&endDate=
### GET /reports/inventory?format=csv
### GET /reports/customers?format=csv
### GET /reports/profit?format=pdf&month=2026-02

---

## USERS / STAFF

### GET /users *(Admin only)*
### POST /users *(Invite staff)*
```json
{ "name": "Staff Name", "email": "staff@shop.com", "role": "EMPLOYEE" }
```
*Roles: ADMIN | MANAGER | EMPLOYEE*

### PUT /users/:id/role
### DELETE /users/:id

---

## SUBSCRIPTIONS

### GET /subscriptions/plans
### POST /subscriptions/create-checkout  *(Stripe/Razorpay)*
```json
{ "plan": "PRO", "billingCycle": "monthly" }
```
### POST /subscriptions/webhook  *(Payment provider callback)*
### DELETE /subscriptions/cancel

---

## NOTIFICATIONS

### GET /notifications?page=1&limit=20
### PUT /notifications/:id/read
### PUT /notifications/read-all

---

## ERROR RESPONSES

```json
{ "error": "Descriptive error message" }
```

HTTP Status codes:
- 200 OK
- 201 Created
- 400 Bad Request (validation error)
- 401 Unauthorized (no/invalid token)
- 403 Forbidden (insufficient role)
- 404 Not Found
- 429 Too Many Requests (rate limited)
- 500 Internal Server Error
