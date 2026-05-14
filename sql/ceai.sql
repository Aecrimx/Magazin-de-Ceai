DROP TYPE IF EXISTS categorii_ceai;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categorii_ceai AS ENUM('negru', 'verde', 'alb', 'fructe', 'mix', 'exotic');
CREATE TYPE tipuri_produse AS ENUM('ceai', 'ceai_exotic', 'cesti', 'ceainice');



CREATE TABLE IF NOT EXISTS ceaiuri (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   gramaj INT NOT NULL CHECK (gramaj>=0),   
   tip_produs tipuri_produse DEFAULT 'ceai',
   categorie categorii_ceai DEFAULT 'negru',
   ingrediente VARCHAR [], --pot sa nu fie specificare deci nu punem NOT NULL; daca e MIX de ceai atunci se separa cu virgula tipurile de ceai
   cafeina BOOLEAN NOT NULL DEFAULT TRUE,
   imagine VARCHAR(300),

   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

-- CESTI
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, cafeina) VALUES
('Cana Chinezeasca Ceramica', 49.99, 0, 'cesti', 'mix', '500_cana_chinezeasca_ceramica.jpg', FALSE),
('Cana Florala', 39.99, 0, 'cesti', 'mix', '500_cana_florala.jpg', FALSE),
('Cana Florala 2', 39.99, 0, 'cesti', 'mix', '500_cana_florala2.jpg', FALSE),
('Cana Sticla', 44.99, 0, 'cesti', 'mix', '500_cana_sticla.jpg', FALSE),
('Cana Turceasca', 54.99, 0, 'cesti', 'mix', '500_cana_turceasca.jpg', FALSE);

-- CEAIURI NEGRE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, cafeina) VALUES
('Ceai Negru', 24.99, 100, 'ceai', 'negru', ARRAY['negru'], '500_ceai-negru.jpg', TRUE);

-- CEAIURI EXOTICE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine) VALUES
('Ceai Arome Exotice', 34.99, 50, 'ceai_exotic', 'exotic', ARRAY['portocala', 'lamaie', 'ghimbir'], '500_ceai-arome-exotice.jpg');

-- CEAIURI FLORAL
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, cafeina) VALUES
('Ceai Floral 1', 29.99, 100, 'ceai', 'mix', ARRAY['trandafir', 'garofita'], '500_ceai-floral1.jpg', FALSE);

-- CEAIURI FRUCTE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, cafeina) VALUES
('Ceai Fructe Mix', 28.99, 100, 'ceai', 'fructe', ARRAY['mere', 'pere', 'afine'], '500_ceai-fructe-mix.jpg', FALSE),
('Ceai Fructe', 27.99, 100, 'ceai', 'fructe', ARRAY['capsuni', 'zmeura'], '500_ceai-fructe.jpg', FALSE),
('Ceai Fructe 2', 27.99, 100, 'ceai', 'fructe', ARRAY['piersici', 'ananas'], '500_ceai-fructe2.jpg', FALSE),
('Ceai Fructe 3', 28.99, 100, 'ceai', 'fructe', ARRAY['cirese', 'citrice'], '500_ceai-fructe3.jpg', FALSE);

-- CEAIURI MIX FANCY
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine) VALUES
('Ceai Mix Fancy', 32.99, 80, 'ceai', 'mix', ARRAY['negru', 'flori', 'fructe'], '500_ceai-mix-fancy.jpg'),
('Ceai Mix Fancy 2', 32.99, 80, 'ceai', 'mix', ARRAY['verde', 'jasmina', 'menta'], '500_ceai-mix-fancy2.jpg'),
('Ceai Mix 3', 31.99, 100, 'ceai', 'mix', ARRAY['oolong', 'fructe', 'flori'], '500_ceai-mix3.jpg');

-- CEAIURI SPECIALE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine) VALUES
('Ceai Mov 1', 33.99, 100, 'ceai', 'mix', '500_ceai-mov1.jpg');

-- CEAIURI VERDE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, cafeina) VALUES
('Ceai Verde Mix 1', 26.99, 100, 'ceai', 'verde', '500_ceai-verde-mix-1.jpg', TRUE),
('Ceai Verde Mix 2', 26.99, 100, 'ceai', 'verde', '500_ceai-verde-mix-2.jpg', TRUE),
('Ceai Verde 1', 25.99, 100, 'ceai', 'verde', '500_ceai_verde1.jpg', TRUE),
('Ceai Verde 2', 25.99, 100, 'ceai', 'verde', '500_ceai_verde2.jpg', TRUE),
('Ceai Verde 3', 25.99, 100, 'ceai', 'verde', '500_ceai_verde3.jpg', TRUE);

-- CEAINICE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, cafeina) VALUES
('Ceainic Bebe', 59.99, 0, 'ceainice', 'mix', '500_ceainic_bebe.jpg', FALSE),
('Ceainic Ceramic', 79.99, 0, 'ceainice', 'mix', '500_ceainic_ceramic.jpg', FALSE),
('Ceainic Chinezesc 1', 89.99, 0, 'ceainice', 'mix', '500_ceainic_chinezesc1.jpg', FALSE),
('Ceainic Chinezesc 2', 89.99, 0, 'ceainice', 'mix', '500_ceainic_chinezesc2.jpg', FALSE),
('Ceainic Chinezesc 3', 89.99, 0, 'ceainice', 'mix', '500_ceainic_chinezesc3.jpg', FALSE);


