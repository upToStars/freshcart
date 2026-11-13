import { useState, useRef, useEffect } from "react"

function App(){

let[proizvodi, setProizvodi] = useState([])
let[loading, setLoading] = useState(true)
let[greska, setGreska] = useState('')
let[skip, setSkip] = useState(0)
let [imaJos, setImaJos] = useState(true)
let krajStranice = useRef(null)
let[pretraga, setPretraga]= useState('')
let[kategorija, setKategorija] = useState('sve')
let[korpa, setKorpa] = useState([])
let[korak, setKorak] = useState(1)
let[ime, setIme] = useState('')
let[adresa, setAdresa] = useState('')
let[placanje, setPlacanje] = useState('')

let filtrirano = proizvodi.filter(function(proizvod){
let poTitle = proizvod.title.toLowerCase().includes(pretraga.toLowerCase())
let poKategoriji = kategorija === 'sve' || proizvod.category === kategorija
return poTitle && poKategoriji
})

let jedinstvenaKategorija = proizvodi.map(function(proizvod){
return proizvod.category
})

let jedinstvena = [...new Set(jedinstvenaKategorija)]


function dodajUkorpu(id){
let akoPostoji = korpa.find(function(proizvodUkorpi){
return proizvodUkorpi.id === id
})

if(akoPostoji){
setKorpa(function(staraKorpa){
return staraKorpa.map(function(proizvod){
if(proizvod.id === id){
return{
...proizvod,
kolicina: proizvod.kolicina + 1
}
}
return proizvod
})
})
}else{
let proizvodZadodavanje = proizvodi.find(function(proizvod){
return proizvod.id === id
})

if(proizvodZadodavanje){
setKorpa(function(staraKorpa){
return [
...staraKorpa,
{
...proizvodZadodavanje,
kolicina: 1
}
]
})
}
}
}


function povecajKolicinu(id){
setKorpa(function(staraKorpa){
return staraKorpa.map(function(proizvod){

if(proizvod.id === id){
return{
...proizvod,
kolicina: proizvod.kolicina + 1
}
}
return proizvod
})
})
}


function smanjiKolicinu(id){
setKorpa(function(staraKorpa){

let pronadjen = staraKorpa.find(function(proizvod){
return proizvod.id === id
})

if(!pronadjen) return staraKorpa

if(pronadjen.kolicina === 1){
return staraKorpa.filter(function(proizvod){
return proizvod.id !== id
})
}

return staraKorpa.map(function(proizvod){
if(proizvod.id === id){
return{
...proizvod,
kolicina: proizvod.kolicina - 1
}
}

return proizvod
})
})
}


let ukupnaCena = korpa.reduce(function(zbir, proizvod){
return zbir + proizvod.kolicina * proizvod.price
},0)


useEffect(function(){

let posmatrac = new IntersectionObserver(function(entries){
let prviEntries = entries[0]

if(prviEntries.isIntersecting && imaJos && !loading){
setSkip(function(stariSkip){
return stariSkip + 10
})
}
})

if(krajStranice.current){
posmatrac.observe(krajStranice.current)
}

return function(){
posmatrac.disconnect()
}

},[loading, imaJos])


useEffect(function(){

async function ucitajProizvode(){

try{
let odgovor = await fetch(`https://dummyjson.com/products?limit=10&skip=${skip}`)

if(!odgovor.ok){
throw new Error('Doslo je do greske')
}

let rezultat = await odgovor.json()
setImaJos(skip + rezultat.products.length < rezultat.total)

setProizvodi(function(stariProizvodi){

if(skip === 0){
return rezultat.products
}

return [...stariProizvodi, ...rezultat.products]
})

}catch(error){
console.log(error)
setGreska('Ne mozete ucitati proizvode')

}finally{
setLoading(false)
}

}

ucitajProizvode()

},[skip])


if(loading){
return <p>Ucitavanje...</p>
}

if(greska){
return <p>{greska}</p>
}


return(
<div>

<input value={pretraga} placeholder="Pretrazi proizvod" onChange={function(e){
setPretraga(e.target.value)
}}/>


{korak === 2 &&(
<div>

<h2>Podaci za dostavu</h2>

<input value={ime} placeholder="Ime i prezime" onChange={function(e){
setIme(e.target.value)
}}/>

<input value={adresa} placeholder="Adresa" onChange={function(e){
setAdresa(e.target.value)
}}/>

<button onClick={function(){

if(ime.trim() === '' || adresa.trim() === ''){
return
}

setKorak(3)

}}>
Nastavi na placanje
</button>

</div>
)}


{korak === 3 &&(
<div>

<h2>Nacin placanja</h2>

<select value={placanje} onChange={function(e){
setPlacanje(e.target.value)
}}>
<option value="">Izaberite nacin placanja</option>
<option value="pouzecem">Pouzecem</option>
<option value="kartica">Kartica</option>
</select>

<button onClick={function(){

if(placanje === ''){
return
}

setKorak(4)

}}>
Pregled porudzbine
</button>

</div>
)}


{korak === 4 &&(
<div>

<h2>Pregled porudzbine</h2>

<p>Ime: {ime}</p>
<p>Adresa: {adresa}</p>
<p>Placanje: {placanje}</p>
<p>Ukupno: {ukupnaCena.toFixed(2)} $</p>

<button onClick={function(){
setKorpa([])
setKorak(1)
setIme('')
setAdresa('')
setPlacanje('')
}}>
Potvrdi porudzbinu
</button>

</div>
)}


<select value={kategorija} onChange={function(e){
setKategorija(e.target.value)
}}>
<option value="sve">Izaberite kategoriju</option>

{jedinstvena.map(function(posebnaKategorija){
return(
<option key={posebnaKategorija} value={posebnaKategorija}>
{posebnaKategorija}
</option>
)
})}

</select>


{korak === 1 &&(
<div>

<h2>Korpa:</h2>

{korpa.map(function(proizvod){
return(
<div key={proizvod.id}>

<h2>{proizvod.title}</h2>

<button onClick={function(){
smanjiKolicinu(proizvod.id)
}}>
-
</button>

<span>{proizvod.kolicina}</span>

<button onClick={function(){
povecajKolicinu(proizvod.id)
}}>
+
</button>

</div>
)
})}

<p>Ukupno: {ukupnaCena.toFixed(2)}$</p>

<button disabled={korpa.length === 0} onClick={function(){
setKorak(2)
}}>
Nastavi na dostavu
</button>

</div>
)}


{filtrirano.map(function(proizvod){
return(
<div key={proizvod.id}>

<h2>{proizvod.title}</h2>
<p>{proizvod.description}</p>
<p>{proizvod.category}</p>
<p>{proizvod.price}</p>

<img src={proizvod.images[0]} alt={proizvod.title} style={{width: '150px'}} />

<button onClick={function(){
dodajUkorpu(proizvod.id)
}}>
Dodaj u korpu
</button>

</div>
)
})}

<div ref={krajStranice} aria-hidden="true"></div>
{!imaJos && <p>Prikazani su svi proizvodi.</p>}

</div>
)

}

export default App