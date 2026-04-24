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
    obGalerie: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
};

app.use("/resurse", express.static(path.join(__dirname, "resurse")));
app.use("/dist", express.static(path.join(__dirname, "node_modules/bootstrap/dist"))); // am inclus bootstrap.js din modemodules

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
    // TASK BONUS galerie backup CSS pana la zi ca sa nu umplem folderul in 5 secunde :)
    const numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const numeFisBackup = numeFisCss.replace(".css", `_${timestamp}.css`);
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisBackup));
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

function initGalerie() {
    const caleGalerieJson = path.join(__dirname, "resurse/json/galerie.json");
    if (!fs.existsSync(caleGalerieJson)) {
        console.error('\x1b[31m%s\x1b[0m', "Eroare: Fișierul galerie.json nu există.");
        obGlobal.obGalerie = null;
        return;
    }

    const galerieRaw = fs.readFileSync(caleGalerieJson, "utf-8");
    const galerieJson = JSON.parse(galerieRaw);

    const caleGalerieRel = (galerieJson.cale_galerie || "resurse/imagini/galerie").replace(/^\/+/, "");
    const caleGalerieAbs = path.join(__dirname, caleGalerieRel);

    if (!fs.existsSync(caleGalerieAbs)) {
        console.error('\x1b[31m%s\x1b[0m', `Eroare: Folderul galeriei (${caleGalerieAbs}) nu există.`);
    }

    obGlobal.obGalerie = {
        caleGalerieRel,
        caleGalerieUrl: `/${caleGalerieRel.replace(/\\/g, "/")}`,
        caleGalerieAbs,
        imagini: Array.isArray(galerieJson.imagini) ? galerieJson.imagini : []
    };
}

function esteInIntervalStrictSameDay(oraCurenta, interval) {
    if (!Array.isArray(interval) || interval.length !== 2) {
        return false;
    }

    const [oraStart, oraStop] = interval;
    const startValid = Number.isInteger(oraStart) && oraStart >= 0 && oraStart <= 23;
    const stopValid = Number.isInteger(oraStop) && oraStop >= 0 && oraStop <= 23;

    if (!startValid || !stopValid || oraStart >= oraStop) {
        return false;
    }

    return oraCurenta >= oraStart && oraCurenta < oraStop;
    // return true; // test
}

function getColoanaZigZag(indexRand) {
    const pattern = [1, 2, 3, 2];
    return pattern[(indexRand - 1) % pattern.length];
}

function construiesteCeluleGalerie(imagini) {
    const celule = [];
    let indexImagine = 0;
    let indexRand = 1;

    while (indexImagine < imagini.length) {
        const coloanaGoala = getColoanaZigZag(indexRand);

        for (let coloana = 1; coloana <= 3; coloana++) {
            if (coloana === coloanaGoala) {
                celule.push({ tip: "gol" });
            } else if (indexImagine < imagini.length) {
                celule.push({ tip: "imagine", imagine: imagini[indexImagine++] });
            } else {
                celule.push({ tip: "gol" });
            }
        }

        indexRand++;
    }

    return celule;
}

function extrageNumeFisierImagine(caleRelativa) {
    const numeFisier = path.basename(caleRelativa || "");
    if (!obGlobal.obGalerie || !numeFisier) {
        return numeFisier;
    }

    if (numeFisier.startsWith("500_")) {
        const faraPrefix = numeFisier.substring(4);
        const caleFaraPrefix = path.join(obGlobal.obGalerie.caleGalerieAbs, faraPrefix);
        if (fs.existsSync(caleFaraPrefix)) {
            return faraPrefix;
        }
    }

    return numeFisier;
}

function construiesteModelGalerie() {
    if (!obGlobal.obGalerie) {
        return {
            oraCurenta: new Date().getHours(),
            imagini: [],
            celule: []
        };
    }

    const oraCurenta = new Date().getHours();
    const imaginiFiltrate = obGlobal.obGalerie.imagini
        .filter((img) => {
            if (!Array.isArray(img.intervale_ore)) {
                return false;
            }

            return img.intervale_ore.some((interval) => esteInIntervalStrictSameDay(oraCurenta, interval));
        })
        .map((img) => {
            const numeFisier = extrageNumeFisierImagine(img.cale_relativa);
            const numeImplicit = path.parse(numeFisier).name || "imagine";
            const altText = typeof img.alt_text === "string" && img.alt_text.trim().length > 0
                ? img.alt_text.trim()
                : numeImplicit;
            const licenta = typeof img.licenta === "string" && img.licenta.trim().length > 0
                ? img.licenta.trim()
                : null;

            return {
                nume: img.nume || numeImplicit,
                descriere: img.descriere || "",
                licenta,
                altText,
                srcOriginal: `${obGlobal.obGalerie.caleGalerieUrl}/${encodeURIComponent(numeFisier)}`,
                srcMediu: `/galerie-img/mediu/${encodeURIComponent(numeFisier)}`,
                srcMic: `/galerie-img/mic/${encodeURIComponent(numeFisier)}`
            };
        });

    return {
        oraCurenta,
        imagini: imaginiFiltrate,
        celule: construiesteCeluleGalerie(imaginiFiltrate)
    };
}

function numarAleatorIntre(minim, maxim) {
    return Math.floor(Math.random() * (maxim - minim + 1)) + minim;
}

function amestecaVector(vect) {
    const copie = [...vect];

    for (let indexCurent = copie.length - 1; indexCurent > 0; indexCurent--) {
        const indexAleator = Math.floor(Math.random() * (indexCurent + 1));
        [copie[indexCurent], copie[indexAleator]] = [copie[indexAleator], copie[indexCurent]];
    }

    return copie;
}

function genereazaCssGalerieAnimata(numarImagini) {
    const caleScss = path.join(obGlobal.folderScss, "galerie_animata.scss");
    const caleCss = path.join(obGlobal.folderCss, "galerie_animata.css");

    if (!fs.existsSync(caleScss)) {
        console.error('\x1b[31m%s\x1b[0m', `Eroare: Fișierul SASS pentru galeria animată nu există (${caleScss}).`);
        return;
    }

    const continutScss = fs.readFileSync(caleScss, "utf-8");
    const sursaScss = `$numar-imagini: ${numarImagini};\n${continutScss}`;

    const caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    if (fs.existsSync(caleCss)) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const numeFisBackup = path.basename(caleCss).replace(".css", `_${timestamp}.css`);
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisBackup));
    }

    const rezultat = sass.compileString(sursaScss, {
        syntax: "scss",
        style: "expanded"
    });

    fs.writeFileSync(caleCss, rezultat.css);
    console.log("CSS galerie animată generat:", caleCss, `(imagini: ${numarImagini})`);
}

function construiesteModelGalerieAnimata(modelGalerie) {
    const modelDeBaza = modelGalerie || construiesteModelGalerie();
    const imaginiDisponibile = Array.isArray(modelDeBaza.imagini) ? modelDeBaza.imagini : [];

    if (imaginiDisponibile.length === 0) {
        return {
            oraCurenta: modelDeBaza.oraCurenta,
            numarImagini: 0,
            imagini: []
        };
    }

    const maximPosibil = Math.min(12, imaginiDisponibile.length);
    const minimPosibil = Math.min(6, maximPosibil);
    const numarImagini = maximPosibil >= 6 ? numarAleatorIntre(minimPosibil, maximPosibil) : maximPosibil;
    const imaginiSelectate = amestecaVector(imaginiDisponibile).slice(0, numarImagini);

    genereazaCssGalerieAnimata(numarImagini);

    return {
        oraCurenta: modelDeBaza.oraCurenta,
        numarImagini,
        imagini: imaginiSelectate
    };
}

async function trimiteVariantaResponsive(req, res) {
    const dimensiuni = {
        mic: 350,
        mediu: 700
    };

    const dimensiune = req.params.dimensiune;
    const latime = dimensiuni[dimensiune];

    if (!latime) {
        afisareEroare(res, 404);
        return;
    }

    const numeFisier = path.basename(req.params.fisier || "");
    const ext = path.extname(numeFisier).toLowerCase();
    const extensiiPermise = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

    if (!extensiiPermise.includes(ext)) {
        afisareEroare(res, 400);
        return;
    }

    if (!obGlobal.obGalerie) {
        afisareEroare(res, 404);
        return;
    }

    const caleSursa = path.join(obGlobal.obGalerie.caleGalerieAbs, numeFisier);
    if (!fs.existsSync(caleSursa)) {
        afisareEroare(res, 404);
        return;
    }

    const folderCache = path.join(__dirname, "temp/galerie");
    if (!fs.existsSync(folderCache)) {
        fs.mkdirSync(folderCache, { recursive: true });
    }

    const caleDestinatie = path.join(folderCache, `${dimensiune}_${numeFisier}`);

    const trebuieRegenerata = !fs.existsSync(caleDestinatie)
        || fs.statSync(caleDestinatie).mtimeMs < fs.statSync(caleSursa).mtimeMs;

    if (trebuieRegenerata) {
        await sharp(caleSursa)
            .resize({
                width: latime,
                withoutEnlargement: true
            })
            .toFile(caleDestinatie);
    }

    res.sendFile(caleDestinatie);
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
initGalerie();


app.get(["/", "/index", "/home"], function (req, res) {
    const galerie = construiesteModelGalerie();
    const galerieAnimata = construiesteModelGalerieAnimata(galerie);

    res.render("pagini/index", {
        galerie,
        galerieAnimata,
        ip: req.ip // should be passed la toate paginile altfel plange sv
    });
});

app.get("/galerie", function (req, res) {
    res.render("pagini/galerie", {
        galerie: construiesteModelGalerie(),
        ip: req.ip
    });
});

app.get("/galerie-img/:dimensiune/:fisier", async function (req, res) {
    try {
        await trimiteVariantaResponsive(req, res);
    } catch (err) {
        console.error("Eroare la generarea imaginii responsive:", err.message);
        afisareEroare(res);
    }
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
