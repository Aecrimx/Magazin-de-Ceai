window.onload=function(){

    document.getElementById("inp-pret").onchange=function(){
        let val=this.value.trim()
        document.getElementById("infoRange").innerHTML=`(${val})`
    }

    // store original order so reset can restore it
    let originalOrder = null

    // populare filtre dinamice pentru ingrediente si tipuri de produs (in functie de ce avem in pagina)
    function populateDynamicFilters(){
        let produse = document.getElementsByClassName("produs")
        // captare ordine originala 
        if (!originalOrder) {
            originalOrder = Array.from(produse)
        }
        let ingredSet = new Set()
        let tipSet = new Set()
        for (let prod of produse){
            let ingElem = prod.getElementsByClassName("val-ingrediente")[0]
            if (ingElem){
                let ing = ingElem.innerHTML.trim()
                if (ing){
                    ing.split(',').map(s=>s.trim()).filter(s=>s).forEach(x=>ingredSet.add(x))
                } else {
                    ingredSet.add("__FARA__")
                }
            }
            let tipElem = prod.getElementsByClassName("val-tip")[0]
            if (tipElem){
                let tip = tipElem.innerHTML.trim()
                if (tip) tipSet.add(tip)
            }
        }

        const container = document.getElementById("checkbox-ingrediente")
        container.innerHTML = ""
        // buton generat pt fiecare tip de ingredient
        const allIngred = Array.from(ingredSet).sort((a,b)=>{
            if (a==="__FARA__") return 1
            if (b==="__FARA__") return -1
            return a.localeCompare(b)
        })
        for (let ing of allIngred){
            const id = `chk_ing_${ing.replace(/[^a-zA-Z0-9_-]/g,'_')}`
            const label = document.createElement('label')
            label.style.marginRight = '8px'
            const chk = document.createElement('input')
            chk.type = 'checkbox'
            chk.className = 'chk-ingred'
            chk.value = ing
            chk.id = id
            chk.checked = true // all checked by default
            const txt = document.createTextNode(ing==="__FARA__"? 'Fără ingrediente' : ing)
            label.appendChild(chk)
            label.appendChild(txt)
            container.appendChild(label)
        }

        // similar cu ce am facut la ingrediente, dar de data asta cu optiuni intr-un select multiple
        const sel = document.getElementById('inp-tip-multiplu')
        sel.innerHTML = ''
        for (let tip of Array.from(tipSet).sort()){
            const opt = document.createElement('option')
            opt.value = tip
            opt.innerText = tip
            opt.selected = true //all by default
            sel.appendChild(opt)
        }
    }

    populateDynamicFilters()

    document.getElementById("filtrare").onclick=function(){
        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase()

        let grupRadio=document.getElementsByName("gr_rad")
        let caloriiMin, caloriiMax, isToate=false;
        for (let rad of grupRadio){
            if (rad.checked){
                if (rad.value!="toate"){
                    [caloriiMin,caloriiMax]= rad.value.split(":")  
                    caloriiMin=parseInt(caloriiMin)
                    caloriiMax=parseInt(caloriiMax)
                }
                else{
                    isToate=true
                }
                break
            }
        }

        let inpPretMin=parseFloat(document.getElementById("inp-pret").value.trim())

        let inpCategorie=document.getElementById("inp-categorie").value.trim().toLowerCase()

        // keywords de la textarea (separate prin virgula) - match daca orice keyword e substring
        let kw = document.getElementById('inp-keywords').value.trim().toLowerCase()
        let keywords = kw.length ? kw.split(',').map(s=>s.trim()).filter(s=>s) : []

        // checkbox-uri ingrediente
        let checkedIngred = Array.from(document.getElementsByClassName('chk-ingred')).filter(c=>c.checked).map(c=>c.value)

        // tip multiplu selected
        let sel = document.getElementById('inp-tip-multiplu')
        let selectedTips = Array.from(sel.selectedOptions).map(o=>o.value)

        let produse=document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="none"

            let nume= prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1=nume.includes(inpNume)

            // gramaj radio reuse
            let gramajElem = prod.getElementsByClassName("val-gramaj")[0]
            let gramaj = gramajElem ? parseInt(gramajElem.innerHTML.trim()) : 0
            let cond2=(isToate) || (gramaj>=caloriiMin && gramaj<caloriiMax)

            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond3=pret>=inpPretMin

            let catElem = prod.getElementsByClassName("val-categorie")[0]
            let cat = catElem ? catElem.innerHTML.trim().toLowerCase() : ''
            let cond4= cat == inpCategorie || inpCategorie== "toate";

            // conditie keywords: daca avem keywords atunci cel putin unul trebuie sa fie substring in descriere (daca nu avem keywords atunci trece oricum)
            let descr = prod.getElementsByClassName('val-descriere')[0].innerHTML.trim().toLowerCase()
            let condKw = true
            if (keywords.length){
                condKw = keywords.some(k=> descr.includes(k))
            }

            // daca avem ingrediente bifate atunci produsul trebuie sa aiba macar unul din ingredientele bifate, dar daca produsul nu are ingrediente atunci se verifica daca e bifata optiunea fara ingrediente
            let ingElem = prod.getElementsByClassName('val-ingrediente')[0]
            let prodIngs = []
            if (ingElem){
                let v = ingElem.innerHTML.trim()
                if (v) prodIngs = v.split(',').map(s=>s.trim()).filter(s=>s)
            }
            let condIngred = true
            if (checkedIngred.length){
                // daca nu are ingrediente (ex ceainic)
                if (prodIngs.length===0){
                    condIngred = checkedIngred.includes('__FARA__')
                } else {
                    condIngred = prodIngs.some(pi=> checkedIngred.includes(pi))
                }
            }

            // tip multiplu condition
            let tipElem = prod.getElementsByClassName('val-tip')[0]
            let tipVal = tipElem ? tipElem.innerHTML.trim() : ''
            let condTip = selectedTips.length ? selectedTips.includes(tipVal) : true

            if (cond1 && cond2 && cond3 && cond4 && condKw && condIngred && condTip){
                prod.style.display="block"
            }
        }
    }

    function sorteaza(semn){
        let produse = document.getElementsByClassName("produs")
        // console.log(produse) // da un html collection // nu avem metode ca la un array
        let vect_produse = Array.from(produse)
        vect_produse.sort(function(a, b){
            // negativ cand a < b
            // = 0 a = b
            // pozitiv cand a > b
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim())
            if(pretA == pretB){
                let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
                let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
                return semn*numeA.localeCompare(numeB) // asta compareaza si daca ai caractere speciale gen diacritice etc. (pt ca ai sansa sa ai ascii codes tampite)
            }
            return semn *(pretA - pretB)// dar momentan in pagina nu sunt sortate pt ca acest vector e doar un vect de referinta! trb sa mergem in pagina sa modificam acest lucru
        })
        for(let prod of vect_produse){ // tatal containerului e acel div grid-produse, append pune la final
            prod.parentNode.appendChild(prod)
        }
    }

    document.getElementById("resetare").onclick=function(){
        // confirmare inainte de resetare
        if (!confirm('Sigur doriți să resetați filtrele?')){
            return
        }

        document.getElementById("inp-nume").value=""
        document.getElementById("inp-pret").value="0"
        document.getElementById("infoRange").innerHTML="(0)"
        // update pret min/max display
        const pretMinSpan = document.getElementById('pret-min')
        if (pretMinSpan) pretMinSpan.innerText = document.getElementById('inp-pret').min || '0'
        const pretMaxSpan = document.getElementById('pret-max')
        if (pretMaxSpan) pretMaxSpan.innerText = document.getElementById('inp-pret').max || '70'

        document.getElementById("inp-categorie").value="toate"
        document.getElementById("i_rad4").checked=true

        let produse=document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="block"
        }

        // reset keywords
        const kw = document.getElementById('inp-keywords')
        if (kw) kw.value = ''

        // reset ingredient checkboxes (check all)
        const chks = document.getElementsByClassName('chk-ingred')
        for (let c of chks) c.checked = true

        // reset multi-select (select all)
        const sel = document.getElementById('inp-tip-multiplu')
        if (sel){
            for (let i=0;i<sel.options.length;i++) sel.options[i].selected = true
        }

        // restore original DOM order (undo sorting)
        if (originalOrder && originalOrder.length){
            const container = document.querySelector('.grid-produse')
            if (container){
                for (let prod of originalOrder){
                    container.appendChild(prod)
                }
            }
        }

    }
    // task SORTARE 
    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1)
    }

    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1)
    }

    // functie care face medie la alt+c
    // also parametrii unei functii sunt ft permisivi, chiar daca nu il dam il putem lua cu args de 0
    window.onkeydown=function(e){ //eveniment e
        if(e.key == "c" && e.altKey == true){ // keyevent are boolean de altkey si ctrl key down ca sa poti face keybind checks
            let suma = 0
            let produse = this.document.getElementsByClassName("produs")
            for(let prod of produse){
                if(prod.style.display!="none") // este si afisat in pagina
                    suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            }

            let p = document.getElementById("infoSuma")
            if(!p){
                let p2 = document.createElement("p")
                p2.innerHTML=suma
                p2.id = "infoSuma" // ca sa avem un singur paragraf
                let sectiuneProduse = document.getElementById("produse")
                sectiuneProduse.parentElement.insertBefore(p2, sectiuneProduse)
                this.setTimeout(function(){
                    let p1 = document.getElementById("infoSuma")
                    if (p1) p1.remove()
                }, 2000) // 2 secunde par fair?
            }
            else{
                p.innerHTML=suma
            }
        }
        //fun fact: pt notificari de la brwoser putem folosi functia confirm("ceva") ce returneaza true sau false dupa ce apesi. confirm apartine lui window.
    }

    // pt ultimul subpunct vom folosi expresii regulate(in cursul JS la slide-ul 82)
    // adica regex
    // regex101.com
    // exemplu trivial in consola
    // e1 = /[a-z]/g
    //"ab123c".match(e1) // returneaza 3 substrings cu literele scoase
    // pt a face de ex pt cuvinte intregi trb sa avem un delimitator
    // e1 = /^[a-z]*$/g
    // "ab123c".match(e1) // returneaza acum abc
    // also ar fi ok sa se puna si caractere unicode in expresia regulata
    // toata treaba e ca daca nu respecta cuvantul regex-ul atunci dam o alerta cu confirm()
    
}