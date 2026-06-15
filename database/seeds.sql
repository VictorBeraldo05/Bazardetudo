INSERT INTO categories (id, name, slug, description)
VALUES
  (gen_random_uuid(), 'Decoracao', 'decoracao', 'Itens sofisticados para casa'),
  (gen_random_uuid(), 'Eletrodomesticos', 'eletrodomesticos', 'Eletros com pequenas avarias'),
  (gen_random_uuid(), 'Moveis', 'moveis', 'Moveis selecionados por lote')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO settings (id, key, value, description)
VALUES
  (gen_random_uuid(), 'store.name', 'Bazar de Tudo', 'Nome da loja'),
  (gen_random_uuid(), 'store.brand', 'bazardetudo.com', 'Marca institucional'),
  (gen_random_uuid(), 'store.whatsapp', '(19) 99825-3607', 'Canal principal de atendimento')
ON CONFLICT (key) DO NOTHING;

INSERT INTO coupons (id, code, discount_type, value, status)
VALUES
  (gen_random_uuid(), 'BEMVINDO10', 'percentage', 10, 'active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO customers (id, full_name, email, phone, password_hash, is_active, is_admin)
VALUES
  (
    gen_random_uuid(),
    'Admin BDT',
    'admin@bazardetudo.com',
    '5519998253607',
    '$pbkdf2-sha256$29000$KWWstbZWqpXSWgthbK2VUg$to1j/n9rSHcIt3Vzl1VYVtZb8WiANxsUKSNwxGcoSRc',
    TRUE,
    TRUE
  )
ON CONFLICT (email) DO NOTHING;
