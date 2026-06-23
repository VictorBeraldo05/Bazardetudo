INSERT INTO categories (id, name, slug, description)
VALUES
  (gen_random_uuid(), 'Decoracao', 'decoracao', 'Itens sofisticados para casa'),
  (gen_random_uuid(), 'Eletrodomesticos', 'eletrodomesticos', 'Eletros para rotina, cozinha e lavanderia'),
  (gen_random_uuid(), 'Material Escolar', 'material-escolar', 'Papelaria, escrita e apoio para estudos'),
  (gen_random_uuid(), 'Suplementos', 'suplementos', 'Nutricao esportiva e performance'),
  (gen_random_uuid(), 'Moveis', 'moveis', 'Moveis selecionados por lote')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (id, category_id, name, slug, description)
SELECT gen_random_uuid(), c.id, sub.name, sub.slug, sub.description
FROM categories c
JOIN (
  VALUES
    ('decoracao', 'Espelhos', 'espelhos', 'Espelhos decorativos'),
    ('decoracao', 'Tapetes', 'tapetes', 'Tapetes e passadeiras'),
    ('decoracao', 'Iluminacao', 'iluminacao', 'Luminarias, lustres e abajures'),
    ('decoracao', 'Quadros', 'quadros', 'Quadros e paines decorativos'),
    ('decoracao', 'Organizacao', 'organizacao', 'Nichos, cestos e organizadores'),
    ('decoracao', 'Sala', 'sala', 'Itens para sala e apoio'),
    ('eletrodomesticos', 'Geladeiras', 'geladeiras', 'Refrigeradores e freezers'),
    ('eletrodomesticos', 'Lavadoras', 'lavadoras', 'Lavadoras e secadoras'),
    ('eletrodomesticos', 'Fornos e Micro-ondas', 'fornos-microondas', 'Fornos eletricos e micro-ondas'),
    ('eletrodomesticos', 'Air Fryer', 'air-fryer', 'Fritadeiras e preparos rapidos'),
    ('eletrodomesticos', 'Fogoes e Cooktops', 'fogoes-cooktops', 'Coccao principal'),
    ('eletrodomesticos', 'Pequenos Eletros', 'pequenos-eletros', 'Cafeteiras, liquidificadores e afins'),
    ('material-escolar', 'Canetas', 'canetas', 'Escrita e marcacao'),
    ('material-escolar', 'Cadernos e Planners', 'cadernos-planners', 'Organizacao e estudos'),
    ('material-escolar', 'Mochilas e Estojos', 'mochilas-estojos', 'Transporte e apoio'),
    ('material-escolar', 'Desenho e Pintura', 'desenho-pintura', 'Criatividade e artes'),
    ('material-escolar', 'Escritorio', 'escritorio', 'Itens de escritorio e papelaria'),
    ('suplementos', 'Creatina', 'creatina', 'Creatinas e apoio de forca'),
    ('suplementos', 'Whey Protein', 'whey-protein', 'Proteinas e recuperacao'),
    ('suplementos', 'Pre-treino', 'pre-treino', 'Energia e foco'),
    ('suplementos', 'Hipercaloricos', 'hipercaloricos', 'Ganho de massa e calorias'),
    ('suplementos', 'Vitaminas', 'vitaminas', 'Vitaminas e minerais'),
    ('moveis', 'Sofas', 'sofas', 'Sofas e estofados'),
    ('moveis', 'Camas', 'camas', 'Camas, box e colchoes'),
    ('moveis', 'Mesas', 'mesas', 'Mesas e apoios'),
    ('moveis', 'Poltronas', 'poltronas', 'Poltronas, cadeiras e puffs'),
    ('moveis', 'Armarios', 'armarios', 'Armarios, guarda-roupas e roupeiros'),
    ('moveis', 'Aparadores e Racks', 'aparadores-racks', 'Racks, buffets e aparadores')
) AS sub(category_slug, name, slug, description) ON sub.category_slug = c.slug
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
