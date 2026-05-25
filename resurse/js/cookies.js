function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare)
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}; path=/`; // path=/ ca sa fie persistent global
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}; path=/`;
}


window.addEventListener("load", function(){
    const bannerElement = document.getElementById("banner-proiect-scolar");
    const okButton = document.getElementById("ok_cookies");
    
    console.log("Banner element:", bannerElement);
    console.log("OK button:", okButton);
    
    if (getCookie("acceptat_banner")){
        bannerElement.hidden = true;
    } else {
        bannerElement.hidden = false;
    }

    if (okButton) {
        okButton.onclick = function(){
            console.log("cookie acceptat");
            setCookie("acceptat_banner", true, 86400000); // Cookie expiră după 1 zi
            // setCookie("acceptat_banner", true, 10000); // 10 secunde pentru testare comportamentului
            bannerElement.hidden = true;
        }
    }
})
