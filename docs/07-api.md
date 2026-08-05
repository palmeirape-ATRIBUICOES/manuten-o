# 07 - Documentação da API REST

Este documento estabelece a especificação dos endpoints da API REST do **SaaS Asset Management**.

---

## 1. Headers Padrão

Todas as requisições autenticadas devem incluir:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Tenant-ID: <TENANT_UUID>
```

---

## 2. Endpoints Principais

### 2.1. Módulo de Ativos (`/api/v1/assets`)

#### `GET /api/v1/assets`
Retorna a lista paginada de ativos do tenant autenticado.

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `status` (string, optional: `INSTALLED`, `MAINTENANCE`, `DECOMMISSIONED`)
- `customer_id` (uuid, optional)

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": "c39e80a0-7b24-4f8e-9d22-123456789abc",
      "tag_name": "GER-01",
      "qr_code_hash": "a1b2c3d4e5f67890",
      "serial_number": "SN-99887766",
      "status": "INSTALLED",
      "category": {
        "id": "e44d80a0-7b24-4f8e-9d22-111122223333",
        "name": "Geradores Diesel"
      },
      "customer": {
        "id": "f55d80a0-7b24-4f8e-9d22-444455556666",
        "name": "Hospital Central"
      },
      "installation_date": "2025-01-15",
      "warranty_expiry": "2027-01-15"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

#### `GET /api/v1/assets/qr/:qr_hash`
Busca um ativo pelo código impresso no etiqueta QR Code.

**Response 200 OK**:
```json
{
  "id": "c39e80a0-7b24-4f8e-9d22-123456789abc",
  "tag_name": "GER-01",
  "custom_attributes": {
    "potencia_kva": 500,
    "tensao_v": 380,
    "combustivel": "DIESEL_S10"
  },
  "open_work_orders_count": 1
}
```

---

### 2.2. Módulo de Ordens de Serviço (`/api/v1/work-orders`)

#### `POST /api/v1/work-orders`
Abre uma nova Ordem de Serviço para um ativo.

**Request Body**:
```json
{
  "asset_id": "c39e80a0-7b24-4f8e-9d22-123456789abc",
  "type": "CORRECTIVE",
  "priority": "HIGH",
  "technician_id": "b88e80a0-7b24-4f8e-9d22-999988887777",
  "notes": "Equipamento apresentando ruído anormal no rolamento."
}
```

#### `PATCH /api/v1/work-orders/:id/complete`
Conclui a Ordem de Serviço colhendo checklist, fotos e assinatura.

**Request Body**:
```json
{
  "checklists": [
    { "id": "chk-1", "is_checked": true, "observation": "Verificado sem folgas" }
  ],
  "photos": {
    "before_urls": ["https://storage.saas.com/photos/before_1042.jpg"],
    "after_urls": ["https://storage.saas.com/photos/after_1042.jpg"]
  },
  "signature_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

## 3. Tratamento de Erros (RFC 7807)

```json
{
  "type": "https://api.saas.com/errors/asset-not-found",
  "title": "Ativo Não Encontrado",
  "status": 404,
  "detail": "Nenhum ativo foi localizado para o QR Code fornecido.",
  "instance": "/api/v1/assets/qr/invalid_hash"
}
```
