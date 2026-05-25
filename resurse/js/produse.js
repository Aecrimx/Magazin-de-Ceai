window.onload = function () {

    document.getElementById("inp-pret").onchange = function () {
        let val = this.value.trim()
        document.getElementById("infoRange").innerHTML = `(${val})`
    }

    // store original order so reset can restore it
    let originalOrder = null

    // ── Populare filtre dinamice ─────────────────────────────────────────────
    // Ingredientele devin btn-check cu stil outline.
    // Tip-ul devin btn-check cu stil outline (înlocuiesc select-ul multiple).
    function populateDynamicFilters() {
        let produse = document.getElementsByClassName("produs")

        // captare ordine originala
        if (!originalOrder) {
            originalOrder = Array.from(produse)
        }

        let ingredSet = new Set()
        let tipSet = new Set()

        for (let prod of produse) {
            let ingElem = prod.getElementsByClassName("val-ingrediente")[0]
            if (ingElem) {
                let ing = ingElem.innerHTML.trim()
                if (ing) {
                    ing.split(',').map(s => s.trim()).filter(s => s).forEach(x => ingredSet.add(x))
                } else {
                    ingredSet.add("__FARA__")
                }
            }
            let tipElem = prod.getElementsByClassName("val-tip")[0]
            if (tipElem) {
                let tip = tipElem.innerHTML.trim()
                if (tip) tipSet.add(tip)
            }
        }

        // ── Ingrediente → btn-check outline ──────────────────────────────────
        const container = document.getElementById("checkbox-ingrediente")
        container.innerHTML = ""

        const allIngred = Array.from(ingredSet).sort((a, b) => {
            if (a === "__FARA__") return 1
            if (b === "__FARA__") return -1
            return a.localeCompare(b)
        })

        for (let ing of allIngred) {
            const id = `chk_ing_${ing.replace(/[^a-zA-Z0-9_-]/g, '_')}`

            const inp = document.createElement('input')
            inp.type = 'checkbox'
            inp.className = 'btn-check chk-ingred'
            inp.id = id
            inp.value = ing
            inp.checked = true
            inp.autocomplete = 'off'

            const lbl = document.createElement('label')
            lbl.className = 'btn btn-outline-primary btn-sm'
            lbl.setAttribute('for', id)
            lbl.innerText = ing === "__FARA__" ? 'Fără ingrediente' : ing

            container.appendChild(inp)
            container.appendChild(lbl)
        }

        // ── Tip produs → btn-check outline (înlocuiește select multiple) ─────
        const tipContainer = document.getElementById('inp-tip-multiplu')
        tipContainer.innerHTML = ''

        for (let tip of Array.from(tipSet).sort()) {
            const uid = `chk_tip_${tip.replace(/[^a-zA-Z0-9_-]/g, '_')}`

            const inp = document.createElement('input')
            inp.type = 'checkbox'
            inp.className = 'btn-check chk-tip'
            inp.id = uid
            inp.value = tip
            inp.checked = true
            inp.autocomplete = 'off'

            const lbl = document.createElement('label')
            lbl.className = 'btn btn-outline-secondary btn-sm'
            lbl.setAttribute('for', uid)
            lbl.innerText = tip

            tipContainer.appendChild(inp)
            tipContainer.appendChild(lbl)
        }
    }

    populateDynamicFilters()

    // ── Filtrare ─────────────────────────────────────────────────────────────
    document.getElementById("filtrare").onclick = function () {
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase()

        let grupRadio = document.getElementsByName("gr_rad")
        let gramajMin, gramajMax, isToate = false
        for (let rad of grupRadio) {
            if (rad.checked) {
                if (rad.value !== "toate") {
                    ;[gramajMin, gramajMax] = rad.value.split(":")
                    gramajMin = parseInt(gramajMin)
                    gramajMax = parseInt(gramajMax)
                } else {
                    isToate = true
                }
                break
            }
        }

        let inpPretMin = parseFloat(document.getElementById("inp-pret").value.trim())

        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase()

        // keywords din textarea
        let kw = document.getElementById('inp-keywords').value.trim().toLowerCase()
        let keywords = kw.length ? kw.split(',').map(s => s.trim()).filter(s => s) : []

        // ingrediente bifate (btn-check)
        let checkedIngred = Array.from(document.getElementsByClassName('chk-ingred'))
            .filter(c => c.checked).map(c => c.value)

        // tip-uri selectate (btn-check în loc de select multiple)
        let selectedTips = Array.from(document.getElementsByClassName('chk-tip'))
            .filter(c => c.checked).map(c => c.value)

        let produse = document.getElementsByClassName("produs")
        for (let prod of produse) {
            prod.style.display = "none"

            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1 = nume.includes(inpNume)

            let gramajElem = prod.getElementsByClassName("val-gramaj")[0]
            let gramaj = gramajElem ? parseInt(gramajElem.innerHTML.trim()) : 0
            // excudem accesori (gramaj === 0)
            let cond2 = isToate || (gramaj !== 0 && gramaj >= gramajMin && gramaj < gramajMax)

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond3 = pret >= inpPretMin

            let catElem = prod.getElementsByClassName("val-categorie")[0]
            let cat = catElem ? catElem.innerHTML.trim().toLowerCase() : ''
            let cond4 = cat === inpCategorie || inpCategorie === "toate"

            // keywords: cel puțin unul să fie substring în descriere
            let descr = prod.getElementsByClassName('val-descriere')[0].innerHTML.trim().toLowerCase()
            let condKw = true
            if (keywords.length) {
                condKw = keywords.some(k => descr.includes(k))
            }

            // ingrediente
            let ingElem = prod.getElementsByClassName('val-ingrediente')[0]
            let prodIngs = []
            if (ingElem) {
                let v = ingElem.innerHTML.trim()
                if (v) prodIngs = v.split(',').map(s => s.trim()).filter(s => s)
            }
            let condIngred = true
            if (checkedIngred.length) {
                if (prodIngs.length === 0) {
                    condIngred = checkedIngred.includes('__FARA__')
                } else {
                    condIngred = prodIngs.some(pi => checkedIngred.includes(pi))
                }
            }

            // tip produs
            let tipElem = prod.getElementsByClassName('val-tip')[0]
            let tipVal = tipElem ? tipElem.innerHTML.trim() : ''
            let condTip = selectedTips.length ? selectedTips.includes(tipVal) : true

            if (cond1 && cond2 && cond3 && cond4 && condKw && condIngred && condTip) {
                prod.style.display = "block"
            }
        }
    }

    // ── Sortare ───────────────────────────────────────────────────────────────
    function sorteaza(semn) {
        let produse = document.getElementsByClassName("produs")
        let vect_produse = Array.from(produse)
        vect_produse.sort(function (a, b) {
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim())
            if (pretA === pretB) {
                let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
                let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
                return semn * numeA.localeCompare(numeB)
            }
            return semn * (pretA - pretB)
        })
        for (let prod of vect_produse) {
            prod.parentNode.appendChild(prod)
        }
    }

    // ── Resetare ──────────────────────────────────────────────────────────────
    document.getElementById("resetare").onclick = function () {
        if (!confirm('Sigur doriți să resetați filtrele?')) return

        const inpPret = document.getElementById("inp-pret")
        const pretMin = inpPret.min || '0'

        document.getElementById("inp-nume").value = ""
        inpPret.value = pretMin
        document.getElementById("infoRange").innerHTML = `(${pretMin})`

        const pretMinSpan = document.getElementById('pret-min')
        if (pretMinSpan) pretMinSpan.innerText = pretMin
        const pretMaxSpan = document.getElementById('pret-max')
        if (pretMaxSpan) pretMaxSpan.innerText = inpPret.max || '0'

        document.getElementById("inp-categorie").value = "toate"
        document.getElementById("i_rad4").checked = true

        let produse = document.getElementsByClassName("produs")
        for (let prod of produse) {
            prod.style.display = "block"
        }

        // reset keywords
        const kw = document.getElementById('inp-keywords')
        if (kw) kw.value = ''

        // reset ingrediente (bifează toate btn-check-urile)
        const chks = document.getElementsByClassName('chk-ingred')
        for (let c of chks) c.checked = true

        // reset tip-uri (bifează toate btn-check-urile)
        const tipChks = document.getElementsByClassName('chk-tip')
        for (let c of tipChks) c.checked = true

        // restaurare ordine originală DOM
        if (originalOrder && originalOrder.length) {
            const container = document.querySelector('.grid-produse')
            if (container) {
                for (let prod of originalOrder) {
                    container.appendChild(prod)
                }
            }
        }
    }

    // ── Butoane sortare ───────────────────────────────────────────────────────
    document.getElementById("sortCrescNume").onclick = function () { sorteaza(1) }
    document.getElementById("sortDescrescNume").onclick = function () { sorteaza(-1) }

    // ── Shortcut Alt+C → sumă prețuri vizibile ────────────────────────────────
    window.onkeydown = function (e) {
        if (e.key === "c" && e.altKey === true) {
            let suma = 0
            let produse = this.document.getElementsByClassName("produs")
            for (let prod of produse) {
                if (prod.style.display !== "none")
                    suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            }

            let p = document.getElementById("infoSuma")
            if (!p) {
                let p2 = document.createElement("p")
                p2.innerHTML = suma
                p2.id = "infoSuma"
                let sectiuneProduse = document.getElementById("produse")
                sectiuneProduse.parentElement.insertBefore(p2, sectiuneProduse)
                this.setTimeout(function () {
                    let p1 = document.getElementById("infoSuma")
                    if (p1) p1.remove()
                }, 2000)
            } else {
                p.innerHTML = suma
            }
        }
    }

}