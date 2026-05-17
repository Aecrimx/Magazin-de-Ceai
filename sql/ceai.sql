DROP TYPE IF EXISTS categorii_ceai cascade;
DROP TYPE IF EXISTS tipuri_produse cascade;
DROP TABLE IF EXISTS ceaiuri cascade;

CREATE TYPE categorii_ceai AS ENUM('negru', 'verde', 'alb', 'fructe', 'mix', 'exotic', 'accesorii');
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
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, cafeina, descriere) VALUES
('Cana Chinezeasca Ceramica', 49.99, 0, 'cesti', 'accesorii', '500_cana_chinezeasca_ceramica.jpg', FALSE, 'O cana de ceramica din China'),
('Cana Florala', 39.99, 0, 'cesti', 'accesorii', '500_cana_florala.jpg', FALSE, 'O cana florama'),
('Cana Florala 2', 39.99, 0, 'cesti', 'accesorii', '500_cana_florala2.jpg', FALSE, 'O cana florama 2'),
('Cana Sticla', 44.99, 0, 'cesti', 'accesorii', '500_cana_sticla.jpg', FALSE, 'O cana de sticla'),
('Cana Turceasca', 54.99, 0, 'cesti', 'accesorii', '500_cana_turceasca.jpg', FALSE, 'O cana turceasca');
-- CEAIURI NEGRE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, cafeina, descriere) VALUES
('Ceai Negru', 24.99, 100, 'ceai', 'negru', ARRAY['negru'], '500_ceai-negru.jpg', TRUE, 'Un ceai negru de calitate superioara');

-- CEAIURI EXOTICE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, descriere) VALUES
('Ceai Arome Exotice', 34.99, 50, 'ceai_exotic', 'exotic', ARRAY['portocala', 'lamaie', 'ghimbir'], '500_ceai-arome-exotice.jpg', 'Un ceai cu arome exotice');

-- CEAIURI FLORAL
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, cafeina, descriere) VALUES
('Ceai Floral 1', 29.99, 100, 'ceai', 'mix', ARRAY['trandafir', 'garofita'], '500_ceai-floral1.jpg', FALSE, 'Un ceai floral de calitate superioara');
-- CEAIURI FRUCTE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, cafeina, descriere) VALUES
('Ceai Fructe Mix', 28.99, 300, 'ceai', 'fructe', ARRAY['mere', 'pere', 'afine'], '500_ceai-fructe-mix.jpg', FALSE, 'Un ceai cu fructe'),
('Ceai Fructe', 27.99, 40, 'ceai', 'fructe', ARRAY['capsuni', 'zmeura'], '500_ceai-fructe.jpg', FALSE, 'Un ceai cu fructe'),
('Ceai Fructe 2', 27.99, 50, 'ceai', 'fructe', ARRAY['piersici', 'ananas'], '500_ceai-fructe2.jpg', FALSE, 'Un ceai cu fructe'),
('Ceai Fructe 3', 28.99, 100, 'ceai', 'fructe', ARRAY['cirese', 'citrice'], '500_ceai-fructe3.jpg', FALSE, 'Un ceai cu fructe');

-- CEAIURI MIX FANCY
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, ingrediente, imagine, descriere) VALUES
('Ceai Mix Fancy', 32.99, 350, 'ceai', 'mix', ARRAY['negru', 'flori', 'fructe'], '500_ceai-mix-fancy.jpg', 'Un ceai mix de calitate superioara'),
('Ceai Mix Fancy 2', 32.99, 350, 'ceai', 'mix', ARRAY['verde', 'jasmina', 'menta'], '500_ceai-mix-fancy2.jpg', 'Un ceai mix de calitate superioara'),
('Ceai Mix 3', 31.99, 200, 'ceai', 'mix', ARRAY['oolong', 'fructe', 'flori'], '500_ceai-mix3.jpg', 'Un ceai mix de calitate superioara');

-- CEAIURI SPECIALE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, descriere) VALUES
('Ceai Mov 1', 33.99, 100, 'ceai', 'mix', '500_ceai-mov1.jpg', 'Un ceai de calitate superioara');
-- CEAIURI VERDE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, cafeina, descriere) VALUES
('Ceai Verde Mix 1', 26.99, 100, 'ceai', 'verde', '500_ceai-verde-mix-1.jpg', TRUE, 'Un ceai verde de calitate superioara'),
('Ceai Verde Mix 2', 26.99, 100, 'ceai', 'verde', '500_ceai-verde-mix-2.jpg', TRUE, 'Un ceai verde de calitate superioara'),
('Ceai Verde 1', 25.99, 100, 'ceai', 'verde', '500_ceai_verde1.jpg', TRUE, 'Un ceai verde de calitate superioara'),
('Ceai Verde 2', 25.99, 100, 'ceai', 'verde', '500_ceai_verde2.jpg', TRUE, 'Un ceai verde de calitate superioara'),
('Ceai Verde 3', 25.99, 100, 'ceai', 'verde', '500_ceai_verde3.jpg', TRUE, 'Un ceai verde de calitate superioara');

-- CEAINICE
INSERT INTO ceaiuri (nume, pret, gramaj, tip_produs, categorie, imagine, cafeina, descriere) VALUES
('Ceainic Bebe', 59.99, 0, 'ceainice', 'accesorii', '500_ceainic_bebe.jpg', FALSE, 'Un ceainic in forma de bebe'),
('Ceainic Ceramic', 79.99, 0, 'ceainice', 'accesorii', '500_ceainic_ceramic.jpg', FALSE, 'Un ceainic ceramic'),
('Ceainic Chinezesc 1', 89.99, 0, 'ceainice', 'accesorii', '500_ceainic_chinezesc1.jpg', FALSE, 'Un ceainic chinezesc'),
('Ceainic Chinezesc 2', 89.99, 0, 'ceainice', 'accesorii', '500_ceainic_chinezesc2.jpg', FALSE, 'Un ceainic chinezesc'),
('Ceainic Chinezesc 3', 89.99, 0, 'ceainice', 'accesorii', '500_ceainic_chinezesc3.jpg', FALSE, 'Un ceainic chinezesc');

