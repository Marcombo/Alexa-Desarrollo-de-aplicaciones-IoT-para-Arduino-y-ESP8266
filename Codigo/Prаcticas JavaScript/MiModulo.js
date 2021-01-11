"use strict";

var variableInterna = "Soy una variable";
exports.variable = variableInterna;

exports.funcion = function(){
    console.log("Soy una función");
}

class Clase {
    constructor(nombre){
        this.nombre = nombre;
    }
    metodo(){
        console.log("Soy un método");
    }
}
exports.Clase = Clase;
