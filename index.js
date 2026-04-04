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

initErori();
initScss();

app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {
        ip: req.ip
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
