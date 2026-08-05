# 06 - Catálogo de Componentes de Interface (Design System)

Este documento especifica a biblioteca de componentes visuais reutilizáveis utilizados nas interfaces Web e PWA Mobile da aplicação.

---

## 1. Componente: `AssetCard`

### Função
Exibir o resumo visual de um ativo patrimonial, destacando a tag, modelo, cliente, localização atual e status operacional.

### Props
```typescript
interface AssetCardProps {
  assetId: string;
  tagName: string;          // Ex: "GER-01"
  categoryName: string;     // Ex: "Gerador Diesel"
  customerName: string;     // Ex: "Hospital Central"
  locationName: string;     // Ex: "Subsolo 2"
  status: 'INSTALLED' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'ARCHIVED';
  qrCodeUrl: string;
  onScanClick?: (assetId: string) => void;
}
```

### Onde é Utilizado
- Lista de Ativos no Dashboard do Gestor.
- Histórico de Ativos no Portal do Cliente.
- Resultados da busca em campo no PWA Técnico.

---

## 2. Componente: `QRCodeBadge`

### Função
Renderizar a tag visual do QR Code com o hash do ativo, permitindo impressão direta em impressoras térmicas ou visualização na tela.

### Props
```typescript
interface QRCodeBadgeProps {
  qrHash: string;
  tagName: string;
  size?: 'sm' | 'md' | 'lg';
  printable?: boolean;
}
```

---

## 3. Componente: `StatusPill`

### Função
Exibir de forma colorida e padronizada o status de uma Ordem de Serviço ou de um Ativo.

### Variantes de Cores
- `INSTALLED` / `CONCLUIDA`: Verde (Success, HSL `hsl(142, 72%, 29%)`)
- `MAINTENANCE` / `EM_ANDAMENTO`: Azul (Info, HSL `hsl(217, 91%, 60%)`)
- `AGUARDANDO_PECAS`: Amarelo/Laranja (Warning, HSL `hsl(38, 92%, 50%)`)
- `CRITICAL` / `ATRASADO`: Vermelho (Danger, HSL `hsl(354, 70%, 54%)`)

---

## 4. Componente: `SignaturePad`

### Função
Permite ao cliente assinar digitalmente com o dedo ou caneta touch na tela do celular/tablet para homologar a conclusão de uma Ordem de Serviço.

### Props
```typescript
interface SignaturePadProps {
  workOrderId: string;
  onSave: (base64Png: string) => void;
  onClear: () => void;
}
```

---

## 5. Componente: `PhotoUploader`

### Função
Permite ao técnico capturar via câmera ou selecionar fotos para comprovação de atendimento (Antes / Depois), com compressão automática antes do upload.

### Props
```typescript
interface PhotoUploaderProps {
  label: string;             // Ex: "Foto Inicial (Antes)"
  required?: boolean;
  maxFiles?: number;
  onUploadSuccess: (urls: string[]) => void;
}
```
