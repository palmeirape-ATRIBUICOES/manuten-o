# 09 - Gestão de Mídia e Armazenamento (Storage)

## 1. Visão Geral de Arquivos

A aplicação lida com mídias críticas de comprovação técnica (fotos de evidência antes/depois, assinaturas dos clientes e laudos em PDF).

O armazenamento é gerenciado via **Object Storage compatível com S3 (ex: Supabase Storage, AWS S3)**.

---

## 2. Estrutura de Buckets e Diretórios

Os arquivos são organizados hierarquicamente por `tenant_id` para garantir o isolamento estrito de arquivos:

```
storage-bucket/
├── {tenant_id}/
│   ├── assets/
│   │   └── {asset_id}/
│   │       ├── main_photo.webp
│   │       └── manual_tecnico.pdf
│   ├── work-orders/
│   │   └── {work_order_id}/
│   │       ├── photos/
│   │       │   ├── before_01.webp
│   │       │   ├── after_01.webp
│   │       │   └── after_02.webp
│   │       ├── signature.png
│   │       └── laudo_tecnico_final.pdf
│   └── company/
│       └── logo_header.png
```

---

## 3. Políticas de Compressão e Formato

1. **Fotos de Evidência (Antes/Depois)**:
   - **Formato Obrigatório**: WebP (com fallback para JPEG).
   - **Resolução Máxima**: 1920x1080px (Full HD).
   - **Compressão**: Aplicada no lado do cliente (PWA) antes do upload (limite max: 500 KB por imagem).
2. **Assinaturas Digitais**:
   - Formato PNG com fundo transparente.
3. **Laudos e Certificados de Garantia**:
   - Formato PDF/A (arquivamento de longo prazo imutável).

---

## 4. Segurança e URLs Assinadas (Signed URLs)

- Todos os buckets são **PRIVADOS por padrão**.
- O acesso de leitura é concedido temporariamente via **Signed URLs** com validade máxima de **15 minutos**.
- Imagens públicas do portal de transparência são servidas através da CDN do SaaS com hash de autorização.
