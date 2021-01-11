"use estrict";

var yo = {
    nombre: "Tomás",
    "lugar de residencia": "Madrid",
    DNI: 12345678
}

var miPerro = {
    dueño: yo,
    nombre: "Rufo",
    raza: "caniche",
    edad: 5,
    ladrar: function(){
        console.log("¡Guau!");
    }
}

console.log("El nombre del dueño del perro es " + miPerro.dueño.nombre);
console.log("El nombre del perro es " + miPerro.nombre);
console.log("La raza del perro es " + miPerro.raza);
console.log("La edad del perro es " + miPerro.edad);

miPerro.ladrar();