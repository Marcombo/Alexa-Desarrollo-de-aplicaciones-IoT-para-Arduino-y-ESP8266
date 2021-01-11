"use strict";

class Dueño{
    constructor(nombre, residencia, dni){
        this.nombre = nombre;
        this["lugar de residencia"] = residencia;
        this.DNI = dni;
    }
}

class Perro {
    constructor(dueño, nombre, raza, edad){
        this.dueño = dueño;
        this.nombre = nombre;
        this.raza = raza;
        this.edad = edad;
    }
    ladrar(){
        console.log("¡Guau!");
    }
}

var yo = new Dueño("Tomás", "Madrid", 12345678);
var miPerro = new Perro(yo, "Rufo", "caniche", 5);

console.log("El nombre del dueño de " + miPerro.nombre + " es " + yo.nombre);
console.log("Su lugar de residencia es "  + miPerro.dueño["lugar de residencia"]);
console.log("La raza del perro es " + miPerro.raza);
console.log("La edad del perro es " + miPerro.edad);

miPerro.ladrar();
