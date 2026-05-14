window.onload=function(){
    this.document.getElementById("filtrare").onclick=function(){
        let inpName = document.getElementById("inp-nume").value.trim().toLowerCase();

        let produse = document.getElementsByClassName("produs")
        for(let prod of produse){
            prod.style.display="none" // nu afiseaza
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1 = nume.includes(inpName)

            if(cond1){
                prod.style.display="block" // afiseaza
            }
        }
    }
}