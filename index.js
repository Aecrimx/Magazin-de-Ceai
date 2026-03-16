const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

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


app.get("/cale/:a/:b", function(req, res){
    res.send(parseInt(req.params.a) + parseInt(req.params.b));
    console.log("cerere parsata");
}); // parametrii in cerere
app.get("/", function(req, res){
    // res.sendFile(path.join(__dirname, "index.html")); 
    res.render("pagini/index");   
})
//e gresit sa returnam pt fiecare get un alt fisier.
// o metoda mai smart este:
app.use("/resurse", express.static(path.join(__dirname, "resurse")));
// asa nu trb sa scriem pt fiecare fisier css un sendFile

app.get("/:a/:b", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"));
    console.log(parseInt(req.params.a) + parseInt(req.params.b));
}) // asta e gresit pt ca 



// nodemon . pt a da run

app.listen(8080);
console.log("Serverul a pornit!");


