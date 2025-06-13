// Proyecto final I - Batalla Pokemon
// Autor: [Romani Nicolas]
// Fecha: [13/06/25]

// Declaracion de variables y constantes.
const URL = "https://pokeapi.co/api/v2/pokemon/";
const equipoA = [];
const equipoB = [];
let dadosA = [];
let dadosB = [];

// Fetch de Pokemon aleatorio, guarda: (nombre, sprite, ataque y defensa)
async function obtenerPokemon() {
  const id = Math.floor(Math.random() * 1024) + 1;  //math.floor importante para que genere un numero entero.
  const res = await fetch(URL + id);
  const data = await res.json();
  const ataque = data.stats.find(stat => stat.stat.name === "attack").base_stat;
  const defensa = data.stats.find(stat => stat.stat.name === "defense").base_stat;
  return {
    nombre: data.name,
    sprite: data.sprites.front_default,
    ataque,
    defensa
  };
}

// Funcion que recorre 3 veces un for y carga un pokemon aleatorio por equipo.
// Luego muestra cada equipo.
// Tambien hace fetch a una foto del logo de pokeApi para el titutlo
async function cargarEquipos() {
  for (let i = 0; i < 3; i++) {
    equipoA.push(await obtenerPokemon());
    equipoB.push(await obtenerPokemon());
  }
  mostrarEquipo("A", equipoA);
  mostrarEquipo("B", equipoB);
  document.getElementById("logoPokemon").src = "https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png";
}

// Funcion que muestra el cartel de cada equipo
function mostrarEquipo(nombre, equipo) {
  const contenedor = document.querySelector(`#equipo${nombre} .pokemones`);
  equipo.forEach(p => {
    const img = document.createElement("img");
    img.src = p.sprite;
    img.title = `${p.nombre}\nATK: ${p.ataque} / DEF: ${p.defensa}`;
    contenedor.appendChild(img);
  });
}

// Funcion que genera aleatoriamente dos numeros entre 1 a 6, y suma ambos para similar cada tiro de dados.
// Esto se almacenan en un array llamado dadosA/B.
// Recorre el if para calcular cual de todos los intentos por equipo son los mas altos.

function tirarDados(equipo) {
  const tiradas = equipo === "A" ? dadosA : dadosB;
  const div = document.getElementById(`resultadosDados${equipo}`);
  const resumenDiv = document.getElementById(`mayorTirada${equipo}`);
  if (tiradas.length >= 3) return;

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const suma = d1 + d2;
  tiradas.push(suma);
  const p = document.createElement("p");
  p.textContent = `Tirada ${tiradas.length}: ${d1} + ${d2} = ${suma}`;
  div.appendChild(p);

  const max = Math.max(...tiradas);
  const idx = tiradas.indexOf(max) + 1;
  resumenDiv.textContent = `Mayor tirada: ${max} (Tirada ${idx})`;
    
  if (tiradas.length === 3) { //Desabilita el boton luego de 3 tiradas.
    document.getElementById(`dados${equipo}`).disabled = true;
    verificarHabilitarBatalla(); // Verifica si se puede habilitar el boton de batalla.
  }
}

// Habilita el boton de batalla si ambos botones de dados estan desabilitados
function verificarHabilitarBatalla() {
  const botonA = document.getElementById("dadosA").disabled;
  const botonB = document.getElementById("dadosB").disabled;
  if (botonA && botonB) {
    document.getElementById("batalla").disabled = false;
  }
}

// Funcion con un acumulador que recorre un equipo y suma los ataques y defensas de cada pokemon.
function calcularTotales(equipo) {
  return equipo.reduce((acc, p) => {
    acc.ataque += p.ataque;
    acc.defensa += p.defensa;
    return acc;
  }, { ataque: 0, defensa: 0 });
}

function iniciarBatalla() {
    // Ejecutar la funcion de calculo de stats por cada equipo.
  const totalesA = calcularTotales(equipoA);
  const totalesB = calcularTotales(equipoB);
    // Muestra los totales de ataque y defensa de cada equipo en el HTML.
  document.getElementById("ataqueA").textContent = `Ataque: ${totalesA.ataque}`;
  document.getElementById("defensaA").textContent = `Defensa: ${totalesA.defensa}`;
  document.getElementById("ataqueB").textContent = `Ataque: ${totalesB.ataque}`;
  document.getElementById("defensaB").textContent = `Defensa: ${totalesB.defensa}`;

  const diferenciaA = totalesA.ataque - totalesB.defensa;
  const diferenciaB = totalesB.ataque - totalesA.defensa;

    // Muchos if que calculan el mensaje de resultado de la batalla.
  let mensaje = "";

  if (diferenciaA > diferenciaB) {
    mensaje = "Gana el Equipo A al tener " + diferenciaA + " de diferencia con el Equipo B";
    document.getElementById("equipoA").classList.add("ganador");
    document.getElementById("equipoB").classList.add("perdedor");
  } else if (diferenciaB > diferenciaA) {
    mensaje = "Gana el Equipo B al tener " + diferenciaB + " de diferencia con el Equipo A";
    document.getElementById("equipoB").classList.add("ganador");
    document.getElementById("equipoA").classList.add("perdedor");
  } else {  // Else que permite que tenga como segunda condicion el juego de dados.
    // Math.max se utiliza para sacar el valor maximo dentro del array de dados de cada equipo.    
    const maxA = Math.max(...dadosA);
    const maxB = Math.max(...dadosB);
    if (maxA > maxB) {
      mensaje = `Empate en batalla. Gana el Equipo A por dados (${maxA})`;
      document.getElementById("equipoA").classList.add("ganador");
      document.getElementById("equipoB").classList.add("perdedor");
    } else if (maxB > maxA) {
      mensaje = `Empate en batalla. Gana el Equipo B por dados (${maxB})`;
      document.getElementById("equipoB").classList.add("ganador");
      document.getElementById("equipoA").classList.add("perdedor");
    } else {
      mensaje = "Empate total (incluso en dados).";  
    }
  }
    //Muestra en el HTML el mensaje de resultado. Luego desabilita el boton de batalla.  
  document.getElementById("resultado").textContent = mensaje;
  document.getElementById("batalla").disabled = true;
}

//Eventos que registran click y desabilitan los botones de tiradas y el boton de batalla
document.getElementById("dadosA").addEventListener("click", () => tirarDados("A"));
document.getElementById("dadosB").addEventListener("click", () => tirarDados("B"));
document.getElementById("batalla").addEventListener("click", iniciarBatalla);

cargarEquipos();
