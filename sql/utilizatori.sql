CREATE TYPE roluri AS ENUM('admin', 'moderator', 'comun');


CREATE TABLE IF NOT EXISTS utilizatori (
   id serial PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   nume VARCHAR(100) NOT NULL,
   prenume VARCHAR(100) NOT NULL,
   parola VARCHAR(500) NOT NULL, -- o vom cripta in baza dxe date, d-aia e de 500
   rol roluri NOT NULL DEFAULT 'comun',
   email VARCHAR(100) NOT NULL,
   culoare_chat VARCHAR(50) NOT NULL,
   data_adaugare TIMESTAMP DEFAULT current_timestamp,
   cod character varying(200), -- token user
   confirmat_mail boolean DEFAULT false,
   poza VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS accesari (
   id serial PRIMARY KEY,
   ip VARCHAR(100) NOT NULL,
   user_id INT NULL REFERENCES utilizatori(id),
   pagina VARCHAR(500) NOT NULL,
   data_accesare TIMESTAMP DEFAULT current_timestamp
);
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nume_utilizator;
-- După ce ați creat tabelul, creati un utilizator nou cu comanda:
-- CREATE USER Veronica WITH ENCRYPTED PASSWORD 'parola';
-- GRANT ALL PRIVILEGES ON DATABASE nume_baza_date TO nume_utilizator ;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nume_utilizator;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nume_utilizator;