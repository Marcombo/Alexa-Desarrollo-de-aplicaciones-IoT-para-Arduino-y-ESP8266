"use strict";

var {Clase} = require("./MiModulo");

var objeto = new Clase("Soy un atributo");
console.log(objeto.nombre);
objeto.metodo();