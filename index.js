const express = require("express");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const sharp = require("sharp");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

const obGlobal = {
    obErori: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
};

app.use("/resurse", express.static(path.join(__dirname, "resurse")));
// app.use("/dist", express.static(path.join(__dirname, "node_modules/bootstrap/dist"))); // am inclus bootstrap.js din modemodules

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"));
});

function initErori() {
    const continut = fs
        .readFileSync(path.join(__dirname, "resurse/json/erori.json"))
        .toString("utf-8");

    const erori = JSON.parse(continut);
    const caleBaza = erori.cale_baza;

    erori.eroare_default.imagine = path.join(caleBaza, erori.eroare_default.imagine);

    for (const eroare of erori.info_erori) {
        eroare.imagine = path.join(caleBaza, eroare.imagine);
    }

    obGlobal.obErori = erori;
}

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

function getEroareById(identificator) {
    if (!obGlobal.obErori) {
        return {
            titlu: "Eroare",
            text: "A survenit o eroare.",
            imagine: "/resurse/imagini/erori/interzis.png"
        };
    }

    if (typeof identificator === "undefined") {
        return obGlobal.obErori.eroare_default;
    }

    const eroareGasita = obGlobal.obErori.info_erori.find(
        (err) => err.identificator === identificator && err.status === true
    );

    return eroareGasita || obGlobal.obErori.eroare_default;
}

function afisareEroare(res, identificator, titlu, text, imagine) {
    const eroare = getEroareById(identificator);

    const dateRandare = {
        titlu: titlu || eroare.titlu,
        text: text || eroare.text,
        imagine: imagine || eroare.imagine
    };

    if (Number.isInteger(identificator) && identificator >= 400) {
        res.status(identificator);
    }

    if (identificator === 404) {
        res.render("pagini/404", dateRandare);
        return;
    }
    if (identificator === 403) {
        res.render("pagini/403", dateRandare);
        return;
    }
    if (identificator === 400) {
        res.render("pagini/400", dateRandare);
        return;
    }

    res.render("pagini/eroare", dateRandare);
}

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        const numeFisExt = path.basename(caleScss);
        const numeFis = numeFisExt.split(".")[0];
        caleCss = `${numeFis}.css`;
    }

    if (!path.isAbsolute(caleScss)) {
        caleScss = path.join(obGlobal.folderScss, caleScss);
    }

    if (!path.isAbsolute(caleCss)) {
        caleCss = path.join(obGlobal.folderCss, caleCss);
    }

    const caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true }); // pt a putea crea si subfoldere in toata structura arborescenta, fara el eroare
    }

    const numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisCss));
    }

    const rez = sass.compile(caleScss, { sourceMap: true });
    fs.writeFileSync(caleCss, rez.css);
    console.log("SCSS recompilat:", caleScss, "->", caleCss);
}

function initScss() {
    const vFisiere = fs.readdirSync(obGlobal.folderScss);
    for (const numeFis of vFisiere) {
        if (path.extname(numeFis) === ".scss") {
            compileazaScss(numeFis);
        }
    }

    fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
        if (!numeFis) {
            return;
        }

        if (eveniment === "change" || eveniment === "rename") { // fun fact: rename da trigger si la new files.
            const caleCompleta = path.join(obGlobal.folderScss, numeFis);
            if (fs.existsSync(caleCompleta) && path.extname(numeFis) === ".scss") {
                compileazaScss(caleCompleta);
            }
        }
    });
}

// Se va implementa o funcție de verificare a datelor din JSON-ul de erori, care va fi apelata la pornirea serverului. Funcția  va afisa mesaje de eroare (cu text clar, detaliat și relevant care să explice problema, pentru a fi remediată)  în următoare situații:
// (0.025) Nu există fisierul erori.json - caz în care, pe lângă afișarea mesajului, aplicația se va și închide (process.exit())
// (0.025) Nu există una dintre proprietățile: info_erori, cale_baza, eroare_default
// (0.025) Pentru eroarea default lipseste una dintre proprietățile: titlu, text sau imagine.
// (0.025) Folderul specificat în "cale_baza" nu există în sistemul de fișiere
// (0.05) Nu există (în sistemul de fișiere)  vreunul dintre fișierele imagine care sunt asociate erorilor. Veți modifica json-ul de erori astfel încât fiecare eroare să aibă altă imagine.
// (0.2) Pentru un obiect din fișier există o proprietate specificată de mai multe ori (de exemplu apare de două ori proprietatea titlu (atenție verificarea trebuie făcuta pe string, nu pe obiectul rezultat din fișier).
// (0.15) Există mai multe erori (în vectorul de erori) cu același identificator (în mesajul de eroare se vor preciza toate proprietatile erorilor, în afară de identificator, pentru a le găsi ușor)

function verificareErori() { // BONUS ETAPA 4
    const caleErori = path.join(__dirname, "resurse/json/erori.json");
    if (!fs.existsSync(caleErori)) {
        console.error('\x1b[31m%s\x1b[0m', "Eroare: Fișierul erori.json nu există.");
        // \x1b[31m%s\x1b[0m - ANSI color code pt text rosu in consola
        process.exit(1);
    }

    let continutRaw;
    try {
        continutRaw = fs.readFileSync(caleErori).toString("utf-8");
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', "Eroare la citirea fișierului erori.json:", err.message);
        process.exit(1);
    }

    // verificare duplicate attributes
    function verificareDuplicate(jsonString) { // [X]
        // Regex pt obiecte JSON
        const objectRegex = /\{[^{}]+\}/g;
        let objectMatch;

        while ((objectMatch = objectRegex.exec(jsonString)) !== null) {
            const objectString = objectMatch[0];
            const keyRegex = /"(\w+)"\s*:/g;
            // \w+ pt proprietati/atribute (words)
            // \s* pt a ignora spatti, \n, tabs etc
            // g pt toate aparitiile din string
            const map = {};
            let match;

        // verificare atribute duplicat per obiect curent
            while ((match = keyRegex.exec(objectString)) !== null) {
                const key = match[1];
                if (map[key]) {
                    console.error('\x1b[31m%s\x1b[0m', `Eroare: Proprietatea "${key}" este specificată de mai multe ori în același obiect:\n${objectString}`);
                } else {
                    map[key] = 1;
                }
            }
        }
    }
    
    verificareDuplicate(continutRaw);
    let jsonErori;
    try {
        jsonErori = JSON.parse(continutRaw);
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', "Eroare la parsarea fișierului erori.json:", err.message);
        process.exit(1);
    }

    // Proprietati principale
    const propsNecesare = ["info_erori", "cale_baza", "eroare_default"]; // [X]
    propsNecesare.forEach(prop => { // [X]
        if(!jsonErori[prop]) {
            console.error('\x1b[31m%s\x1b[0m', `Eroare: Proprietatea "${prop}" lipsește în fișierul erori.json.`);
        }
    });

    // eroare_default
    const propsEroareDefault = ["titlu", "text", "imagine"]; // [X]
    if(jsonErori.eroare_default) {
        propsEroareDefault.forEach(prop => {
            if(!jsonErori.eroare_default[prop]) {
                console.error('\x1b[31m%s\x1b[0m', `Eroare: Proprietatea "${prop}" lipsește în obiectul "eroare_default" din fișierul erori.json.`);
            }
        });
    }

    // Verificare cale_baza
    if(jsonErori.cale_baza) { // [X]
        const caleBaza = path.join(__dirname, jsonErori.cale_baza);
        if(!fs.existsSync(caleBaza)) {
            console.error('\x1b[31m%s\x1b[0m', `Eroare: Folderul specificat în "cale_baza" (${caleBaza}) nu există în sistemul de fișiere.`);
        }
    }

    // Verificare imagini erori
    if(jsonErori.cale_baza) { // [X]
        const caleBaza = path.join(__dirname, jsonErori.cale_baza);
        // console.log("Cale baza pentru imagini erori:", caleBaza);
        jsonErori.info_erori.forEach(eroare => {
            const caleImagine = path.join(caleBaza, eroare.imagine);
            // console.log(`Cale imagine pentru eroarea ${eroare.identificator}: ${caleImagine}`);
            if(!fs.existsSync(caleImagine)) {
                console.error('\x1b[31m%s\x1b[0m', `Eroare: Fișierul imagine pentru eroarea cu identificator "${eroare.identificator}" nu există la calea ${caleImagine}.`);
            }
        });
    }

    // Verificare duplicate identificatori
    if(jsonErori.info_erori && Array.isArray(jsonErori.info_erori)) { // [X]
        const identificatori = {};
        jsonErori.info_erori.forEach(eroare => {
            if(identificatori[eroare.identificator]) {
                console.error('\x1b[31m%s\x1b[0m', `Eroare: Identificatorul "${eroare.identificator}" este specificat de mai multe ori în fișierul erori.json.`);
            } else {
                identificatori[eroare.identificator] = true;
            }
        });
    }
}


verificareErori();

initErori();
initScss();


app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {
        ip: req.ip // should be passed la toate paginile altfel plange sv
    });
});

app.get("/eroare", function (req, res) {
    afisareEroare(res);
});

app.get("/:pagina", function (req, res) {
    const pagina = req.params.pagina;

    if (pagina === "favicon.ico") {
        return;
    }

    if (pagina.endsWith(".ejs")) {
        afisareEroare(res, 400);
        return;
    }

    res.render(`pagini/${pagina}`, function (err, rezultatRandare) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                afisareEroare(res, 404);
                return;
            }

            afisareEroare(res);
            return;
        }

        res.send(rezultatRandare);
    });
});

app.use(function (req, res) {
    afisareEroare(res, 404);
});

app.listen(8080, function () {
    console.log("Serverul a pornit pe portul 8080!");
});
