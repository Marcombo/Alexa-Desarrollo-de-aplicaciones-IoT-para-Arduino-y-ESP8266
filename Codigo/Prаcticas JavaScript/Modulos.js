"use strict";

var objetoExport = require("./MiModulo");

console.log(objetoExport.variable);
objetoExport.funcion();
var objeto = new objetoExport.Clase("Soy un atributo");
console.log(objeto.nombre);
objeto.metodo();
