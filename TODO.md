## Task 0
- [ ] Documentul cu research

## Task 1
- [ ] Facut section + articles
- [ ] Sectiune de navigare in <header> in pure html
- [ ] task 12/13 link in footer catre top page, in lab/lab1ex.html e in footer.
- [ ] iframge task 14 e facut la curs.

---

##Etapa 1

- [x] 1. folder
- [x] 2. titlu
- [ ] 3. cuvinte cheie (change them later)
- [x] 4. resurse folder
- [ ] 5. header, main, footer
- [ ] 6. section, article, aside. Trb sa fie caz de sectiune in sectiune.
- [ ] 7. Minim un heading sa aiba subtitlu cu tag <hgroup>
- [ ] 8. header cu navigare cu lista neordonata de linkuri cu optiuni principale (pagini site) si secundare (acasa). Suboptiunile vor fi link-uri catre sectiunile paginii, care vor avea id-uri relevante. Se vor pune suboptiunile intr-o lista imbricata in lista de optiuni principale. <h1> pt titlu site
- [ ] 9. In sectiuni sa se foloseasca minim 2 taguri de grupare: p , blockquote sau dl
- [ ] 10. Sectiune evenimente, cu date si ore (tag time si atributul datetime cu informatii). Evenimentele se enumereaza intr-o lista ordodnata sau neordonata. Au nume cu tag b si o descriere. 
- [ ] 11. O imagine cu o descriere, folosind figure si figcaption. Ea va aveas i o descriere mai scurta si atribut title. Pt ecrane mici trb incarcata si o imagine mai redusa in dimensiune, deci de facut schema cu multiple dimension choices pt browser.
- [ ] 12. marcat cu b 3 cuvinte minim ,marcat 2 cazuri de text idiomatic (numele latin al plantelor pt ceai) cu tag i. Mai ia inca o cerinta la alegere din document.
- [ ] 13. folosind tagul a cream linkuri catre: o resursa externa, linkul se va deschide in tab nou. Link catre un element dintr-o resursa externa (referintat prin id). IN footer un link care duce la inceputul paginii. LInk ce contine o imagine. O va deschide intr-unt ab separat, versiunea mare.  Un link de tip download. (fisierul og e poza.png, fisierul descarcat e poza_descarcata.png). Pt a servi download, trb portat de la static html la un server (de mutat referintele la resurse de la cv static la live). 
- [ ] 14. Iframge cu un videoclip youtube embeded. Facut ce zice si cerinta full.
- [ ] 15. Tabel cu sens in site.
- [ ] 16. zone details si summary
- [ ] 17. Tag meter de doua ori in pagaina. 
- [ ] 18. In footer sa fie date si un telefon fictiv, adresa fictiva pt o locatie google maps, email, link ce deschide un sociall websiite
- [ ] 19. Informatie copyright.
- [ ] 20. sintaxa corecta si well bonusuri


##Etapa 2
- [ ] FONT GOOGLE!
- [ ] pt tabelul ala amarat vrea clasa pe tr si sa faci pe tr odd/even child


##Etapa 3
- [ ] pt buton de arrow up cu animatie verifica exemplul doamnei profesoare layout 1 de pe replit.


## Azi si maine
- de reparat label-urile de la exemplele profei (clase corecte, label-uri etc)
- de terminat CSS
- de facut sageata pt sus (cu position fixed in css)
- in exemplu css printare de pe replit pt a da overload la cum ar arata print-ul cu ctrl p
- mutat header in ejs spart pe fragmente
- la fel si footer
- insa acum sendFile nu o sa stie sa trimita aceste ejs-uri
- in loc de sendFile folosim functia render (in index.js)


# CURS 6
- DE COPIAT DIN INDEX.JS FUNCTIA DE INIT IMAGINI
- APOI IN APP.GET(["/, "/INDEX", "/HOME]) si dam la render obiectul de imagini
- in index.ejs apoi mergem unde avem o sectiune de galerie
- VOm da replace la figure bazat pe vectorul de imagine din obGlobal, folosind un for loop ce itereazea asupra imag of locals.imagini
- also sa avem chestia de cod pt creare imagini ecran mediu si mic

# CURS 7
- GALERIA STATICA: de facut galerie.json plus modificari din cerinta cerute! (sharp)
- la el trb macar 15 imagini pt produse. Pozele nu trb sa fie neaparat difrite, macar descrierea produselor sa fie
- Bazat pe descieri/intervale de timp vom implementa functie de filtrat!
- NEVOIE DE InitImagini() din cursuri pt a avea un vector cu imagini.
- Acesta il vom pune in obGlobal
- DUpa tot acest setup vom lycra in index.ejs
- Trebuie sa facem un section GalerieStatica.
- Ejs ne permite sa trantim in block-ul <%> un vector de luni/intervale orare luate din locals
- vectLuni=["ianuarie", "februarie","martie", "aprilie", "mai","iunie","iulie", "august","septembrie","octombrie","noiembrie","decembrie"] ex curs
- putem folosi date din javascript. d = new Date()
- d.getFullYear(). FUN FACT d.getMonth() numara DUPA 0!. 0 - IANUARIE, 1 - FEBRUARIE...
- d.getDay() face acelasi lucru, dum - 0, luni - 1, marti - 2, etc...
- Deci vectorul de zile o sa inceapa cu Duminica.
- SEE CURS7 din tw.lab, section id galerie-statica din ejs pt cum rb sa fie implementat.
- La cerintele custom in grid-ul de galerie ce e alb e blank, ce e negru trb sa fie imagini. (exemplulayout-1 de la profa)
- fun fact2: la grid . inseamna blank.
- din pacate trb sa dam coordonate la figuri la TOATE.
- acest lucru il vom face cu un for in SASS!
- se va umbla la grid-area la coordonate.
- exemplu counter: curs4-exemple.
- BONUS galeria animata va fi la lab 211 i inregistrare 7 aprilie
