const express= require("express");
const path= require("path");
const fs = require("fs");
const sass = require("sass");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

//pt taskul cu foldere
// let vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
// for(let folder of vect_foldere){
//     let caleFolder=path.join(__dirname, folder);
//     if(!fs.existsSync(caleFolder)){
//         fs.mkdir(caleFolder);
//     }
// }


// incepem sa definim http requests
// app.get("/cale", function(req, res){
//     res.send("Salut, ai ajuns pe <b style='color = red;'>server!</b>");
//     console.log("Am primit o cerere GET pe /cale");
// });


// app.get("/cale2", function(req, res){
//     res.write("ceva\n");
//     res.write("altceva");
//     res.end();

// });

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
}


app.get("/cale/:a/:b", function(req, res){
    res.send(parseInt(req.params.a) + parseInt(req.params.b));
    console.log("cerere parsata");
});// parametrii in cerere


app.get(["/", "/index", "/home"], function(req, res){ //acel vector ne lasa sa avem "alias-uri" pt main page
    // res.sendFile(path.join(__dirname, "index.html")); 
    res.render("pagini/index", {
        ip: req.ip // si in ejs putem folosi <%- locals.ip> ca sa il vedem
        //parametrul transmis in render se numeste locals
    });   
})
//e gresit sa returnam pt fiecare get un alt fisier.
// o metoda mai smart este:
app.use("/resurse", express.static(path.join(__dirname, "resurse")));
// asa nu trb sa scriem pt fiecare fisier css un sendFile
//mereu concatanam cu __Dirname si nu cu current working directory pt ca dirname e relativ la entry point, cwd e locatia de unde se apeleaza

//pt task-ul cu favicon.ico
app.get("/favicon.ico", function(req, res){
    res.sendFIle(path.joib(__dirname, "resurse/imagini/favicon/favicon.ico"))
});


app.get("/:a/:b", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"));
    console.log(parseInt(req.params.a) + parseInt(req.params.b));
}) // asta e gresit pt ca 




function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()

app.get("/eroare", function(req, res){
    res.render("pagini/eroare", {
        imagine: obGlobal.ObErori.eroare_default.imagine,
        titlu: obGlobal.obErori.eroare_default.titlu,
        text: obGlobal.obErori.eroare_default.text,
    });
}) // testam o eroare.

//cum facem mai multe pagini fara sa facme cpy paste app.get? see line 141 inainte de app.listen





function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

function afisareEroare(res, identificator, titlu, text, imagine){
    //TO DO cautam eroarea dupa identificator
    //daca sunt setate titlu, text, imagine, le folosim, 
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
}


// nodemon . pt a da run

app.get("/*pagina", function(req,res){ //intern acm va cauta pagina respectiva
    console.log("Cale pagina", req.url);
    //daca poate renda .render(), il tirmite in rezultatRendare
    //daca nu poate, apeleaza functia callback
    if(req.url.startsWith("/resurse") && path.extname(req.url)==""){
        //e director, nu fisier.
        afisareEroare(res, 403);
        return;
    }
    if(path.extname(req.url) == ".ejs"){
        afisareEroare(res, 400); //badrequest
        return;
    }
    try{
            res.render("pagini"+req.url, function(err, rezRendare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                afisareEroare(res, 404)
                return;
            }
            afisareEroare(res);
            return;
        }
        res.send(rezRendare);
        console.log("Randare", rezRandare); // verificam e un html duh
    });
    }catch(err){
        if(err.message.includes("Cannot find module")){
            afisareEroare(res, 404);
            return;
        }
        afisareEroare(res);
        return;
    }
});

app.listen(8080);
console.log("Serverul a pornit!");
