window.onload = function () {
    // BONUS 3 ETAPA 6
    function afiseazaMesajFaraProduse(afiseaza) {
        const sectiuneProduse = document.getElementById("produse")
        if (!sectiuneProduse) return

        let mesaj = document.getElementById("mesaj-fara-produse")

        if (afiseaza) {
            if (!mesaj) {
                mesaj = document.createElement("p")
                mesaj.id = "mesaj-fara-produse"
                mesaj.className = "alert alert-warning mt-3"
                mesaj.setAttribute("role", "alert")
                mesaj.textContent = "Nu există produse care să corespundă filtrării curente."
                sectiuneProduse.insertAdjacentElement("afterbegin", mesaj)
            } else {
                mesaj.style.display = "block"
            }
        } else if (mesaj) {
            mesaj.style.display = "none"
        }
    }
    // BONUS 15 ETAPA 6
    function afiseazaCounterProduse(nrProduse) {
        let counter = document.getElementById("counter-produse-afisate")
        if (!counter) {
            counter = document.createElement("p")
            counter.id = "counter-produse-afisate"
            counter.className = "text-muted mb-3"

            const pSuma = document.getElementById("p-suma")
            if (pSuma && pSuma.parentElement) {
                pSuma.insertAdjacentElement("afterend", counter)
            } else {
                const sectiuneProduse = document.getElementById("produse")
                if (sectiuneProduse && sectiuneProduse.parentElement) {
                    sectiuneProduse.parentElement.insertBefore(counter, sectiuneProduse)
                }
            }
        }

        counter.textContent = `Produse afișate: ${nrProduse}`
    }

    document.getElementById("inp-pret").oninput = function () {
        let val = this.value.trim()
        document.getElementById("infoRange").innerHTML = `(${val})`
        aplicaFiltre()
    }

    document.getElementById("inp-pret").onchange = function () {
        let val = this.value.trim()
        document.getElementById("infoRange").innerHTML = `(${val})`
        aplicaFiltre()
    }

    // reset origianl order
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

        // ── Ingrediente -> btn-check outline ──────────────────────────────────
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

        // ── Tip produs --> btn-check outline (înlocuiește select multiple) ─────
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
    function aplicaFiltre() {
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
        let nrProduseAfisate = 0
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
                nrProduseAfisate++
            }
        }

        afiseazaMesajFaraProduse(nrProduseAfisate === 0)
        afiseazaCounterProduse(nrProduseAfisate)
    }

    document.getElementById("filtrare").onclick = aplicaFiltre

    // ── Filtrare live (onchange / input) ────────────────────────────────────
    // BONUS 4 ETAPA 6
    document.getElementById("inp-nume").addEventListener("input", aplicaFiltre)
    document.getElementById("inp-categorie").addEventListener("change", aplicaFiltre)
    document.getElementById("inp-keywords").addEventListener("input", aplicaFiltre)

    const radioGramaj = document.getElementsByName("gr_rad")
    for (let rad of radioGramaj) {
        rad.addEventListener("change", aplicaFiltre)
    }

    const containerIngrediente = document.getElementById("checkbox-ingrediente")
    if (containerIngrediente) {
        containerIngrediente.addEventListener("change", function (e) {
            if (e.target && e.target.classList.contains("chk-ingred")) {
                aplicaFiltre()
            }
        })
    }

    const containerTip = document.getElementById("inp-tip-multiplu")
    if (containerTip) {
        containerTip.addEventListener("change", function (e) {
            if (e.target && e.target.classList.contains("chk-tip")) {
                aplicaFiltre()
            }
        })
    }

    // ── Modal produs (click pe card) BONUS 11 ETAPA 6 ────────────────────────────────────────
    function initModalProduse() {
        const modalEl = document.getElementById("modal-produs")
        if (!modalEl || typeof bootstrap === "undefined") return

        const modal = new bootstrap.Modal(modalEl)

        const titluEl = document.getElementById("modal-produs-titlu")
        const pretEl = document.getElementById("modal-produs-pret")
        const descriereEl = document.getElementById("modal-produs-descriere")
        const ingredienteEl = document.getElementById("modal-produs-ingrediente")
        const gramajEl = document.getElementById("modal-produs-gramaj")
        const categorieEl = document.getElementById("modal-produs-categorie")
        const tipEl = document.getElementById("modal-produs-tip")
        const cafeinaEl = document.getElementById("modal-produs-cafeina")
        const dataEl = document.getElementById("modal-produs-data")
        const imgEl = document.getElementById("modal-produs-imagine")
        const btnPaginaProdusEl = document.getElementById("modal-btn-pagina-produs")

        function textDinProdus(prod, cls, fallback = "-") {
            const el = prod.getElementsByClassName(cls)[0]
            if (!el) return fallback
            const txt = el.textContent.trim()
            return txt || fallback
        }

        function deschideModalProdus(prod) {
            const nume = textDinProdus(prod, "val-nume")
            const pret = textDinProdus(prod, "val-pret", "0")
            const descriere = textDinProdus(prod, "val-descriere")
            const ingrediente = textDinProdus(prod, "val-ingrediente")
            const gramaj = textDinProdus(prod, "val-gramaj")
            const categorie = textDinProdus(prod, "val-categorie")
            const tip = textDinProdus(prod, "val-tip")
            const cafeina = textDinProdus(prod, "val-cafeina")
            const dataAdaugare = textDinProdus(prod, "val-data-adaugare")

            const linkProdusEl = prod.querySelector('a[href^="/produs/"]')
            const hrefProdus = linkProdusEl ? linkProdusEl.getAttribute("href") : "#"

            const imgCardEl = prod.querySelector("img")

            titluEl.textContent = nume
            pretEl.textContent = pret
            descriereEl.textContent = descriere
            ingredienteEl.textContent = ingrediente
            gramajEl.textContent = gramaj
            categorieEl.textContent = categorie
            tipEl.textContent = tip
            cafeinaEl.textContent = cafeina
            dataEl.textContent = dataAdaugare

            if (imgCardEl) {
                imgEl.src = imgCardEl.getAttribute("src") || ""
                imgEl.alt = imgCardEl.getAttribute("alt") || `imagine ${nume}`
            }

            btnPaginaProdusEl.href = hrefProdus || "#"

            modal.show()
        }

        const carduri = document.querySelectorAll(".card-produs")
        for (let card of carduri) {
            card.addEventListener("click", function (e) {
                const tinta = e.target
                if (tinta.closest(".select-cos") || tinta.closest("input.select-cos")) {
                    return
                }

                e.preventDefault()
                const prod = this.closest(".produs")
                if (prod) deschideModalProdus(prod)
            })

            card.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" && e.key !== " ") return

                e.preventDefault()
                const prod = this.closest(".produs")
                if (prod) deschideModalProdus(prod)
            })
        }
    }

    initModalProduse()

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

        afiseazaMesajFaraProduse(false)
        afiseazaCounterProduse(produse.length)

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

    afiseazaCounterProduse(document.getElementsByClassName("produs").length)

}