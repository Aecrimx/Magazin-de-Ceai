function updateThemeIcon() {
    const btn = document.getElementById("schimba_tema"); // butonul de tema are acest id
    const span = btn.querySelector("span.bi");
    
    if(document.body.classList.contains("dark")){
        span.classList.remove("bi-sun");
        span.classList.add("bi-moon");
        // span.textContent = " Schimba tema";
    }
    else{
        span.classList.remove("bi-moon");
        span.classList.add("bi-sun");
        // span.textContent = " Schimba tema";
    }
}

window.addEventListener("DOMContentLoaded", function(){
    // set tema initiala
    if(localStorage.getItem("tema") === "dark"){
        document.body.classList.add("dark"); // classList vector de clase css
    }
    
    //update
    updateThemeIcon();
    
    document.getElementById("schimba_tema").onclick= function(){
        if(document.body.classList.contains("dark")){
            document.body.classList.remove("dark")
            localStorage.removeItem("tema");
        }
        else{
            document.body.classList.add("dark")
            localStorage.setItem("tema","dark");
        }
        updateThemeIcon();
    }
});