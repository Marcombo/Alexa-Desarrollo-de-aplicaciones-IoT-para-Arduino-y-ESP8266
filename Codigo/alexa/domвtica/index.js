const Alexa = require('ask-sdk-core');
const axios = require('axios');

const MENSAJE_REPROMT = "¿Desea hacer algo más?";
const ACCESO_KO = "No se ha podido acceder al dispositivo";

const ADAFRUIT_IO_URL_BASE = "https://io.adafruit.com/api/v2/*****/feeds/";
const ADAFRUIT_IO_CLAVE = "*****";

const FEED_LUZ_SALON = "luz-salon";
const FEED_LUZ_DORMITORIO = "luz-dormitorio";
const FEED_TEMPERATURA_ACTUAL = "temperatura-actual";
const FEED_CALEFACCION = "calefaccion";
const FEED_TEMPERATURA_PROGRAMADA = "temperatura-programada";
const FEED_HORA_PROGRAMADA = "hora-programada";


const launchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        //Se compone el mensaje de respuesta a Alexa
        return handlerInput.responseBuilder
            .speak("Hola, ¿qué desea hacer?")
            .reprompt("Puede controlar las luces, la calefacción, la lavadora o la televisión")
            .getResponse();
    }
};

//************************************************************
// CONTROL DE LAS LUCES
//************************************************************

const controladorEncenderLuz = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'encenderLuz';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        let nombreFeed;
        
        //Se obtienen el valor CANONICO del slot habitación
        let habitacion = handlerInput.requestEnvelope.request.intent.slots.habitacion.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        //Se asigna el nombre que tiene el feed en Adafruit IO
        switch(habitacion){
            case "dormitorio": nombreFeed = FEED_LUZ_DORMITORIO;
            break;
            case "salón": nombreFeed = FEED_LUZ_SALON;
        }
        
        let estadoLuz = await consultarUltimoValorFeed(nombreFeed);
        console.log("Estado de la luz: " + estadoLuz);
        if(estadoLuz !== ACCESO_KO){
            if(estadoLuz === "ON")
                respuestaUsuario = `La luz del ${habitacion} ya está encendida`;
            else{
                let valorActualizado = await enviarValorFeed(nombreFeed, "ON");
                if(valorActualizado) respuestaUsuario = `La luz del ${habitacion} se ha encendido`;
                else respuestaUsuario  = `No se ha podido acceder a la luz del ${habitacion}`;
                }
            }
        else respuestaUsuario  = `No se ha podido acceder a la luz del ${habitacion}`;
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorApagarLuz = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'apagarLuz';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        let nombreFeed;

        //Se obtienen el valor CANONICO del slot habitación 
        let habitacion = handlerInput.requestEnvelope.request.intent.slots.habitacion.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        //Se asigna el nombre que tiene el feed en Adafruit IO
        switch(habitacion){
            case "dormitorio": nombreFeed = FEED_LUZ_DORMITORIO;
            break;
            case "salón": nombreFeed = FEED_LUZ_SALON;
        }
        
        let estadoLuz = await consultarUltimoValorFeed(nombreFeed);
        console.log("Estado de la luz: " + estadoLuz);
        if(estadoLuz !== ACCESO_KO){
            if(estadoLuz === "OFF")
                respuestaUsuario = `La luz del ${habitacion} ya está apagada`;
            else{
                let valorActualizado = await enviarValorFeed(nombreFeed, "OFF");
                if(valorActualizado) respuestaUsuario = `La luz del ${habitacion} se ha apagado`;
                else respuestaUsuario  = `No se ha podido apagar a la luz del ${habitacion}`;
                }
            }
        else respuestaUsuario  = `No se ha podido apagar a la luz del ${habitacion}`;
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorConsultarLuz = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'consultarLuz';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        let nombreFeed;

        //Se obtienen el valor CANONICO del slot habitación
        let habitacion = handlerInput.requestEnvelope.request.intent.slots.habitacion.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        //Se asigna el nombre que tiene el feed en Adafruit IO
        switch(habitacion){
            case "dormitorio": nombreFeed = FEED_LUZ_DORMITORIO;
            break;
            case "salón": nombreFeed = FEED_LUZ_SALON;
        }
        
        let estadoLuz = await consultarUltimoValorFeed(nombreFeed);
        console.log("Estado de la luz: " + estadoLuz);
        if(estadoLuz !== ACCESO_KO){
            if(estadoLuz === "ON") respuestaUsuario = `La luz del ${habitacion} está encendida`;
            else respuestaUsuario = `La luz del ${habitacion} está apagada`;
        }
        else respuestaUsuario  = `No se ha podido acceder a la luz del ${habitacion}`;
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

//************************************************************
// OBTENCIÓN DE LA TEMPERATURA
//************************************************************

const controladorConsultarTemperatura = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'consultarTemperatura';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        
        let temperatura = await consultarUltimoValorFeed(FEED_TEMPERATURA_ACTUAL);
        
        if(temperatura === ACCESO_KO) respuestaUsuario = "No se ha podido acceder al sensor de temperatura";
        else respuestaUsuario  = `Hay ${temperatura} grados centígrados de temperatura`; 
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

//************************************************************
// CONTROL DE LA CALEFACCIÓN
//************************************************************

const controladorEncenderCalefaccion = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'encenderCalefaccion';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        
        let estadoCalefaccion = await consultarUltimoValorFeed(FEED_CALEFACCION);
        if(estadoCalefaccion !== ACCESO_KO){
            if(estadoCalefaccion === "ON")
                respuestaUsuario = "La calefacción ya está encendida";
            else{
                let valorActualizado = await enviarValorFeed(FEED_CALEFACCION, "ON");
                valorActualizado = await enviarValorFeed(FEED_HORA_PROGRAMADA, "--:--");
                if(valorActualizado) respuestaUsuario = "La calefacción se ha encendido";
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
                }
            }
        else respuestaUsuario  = "No se ha podido acceder a la calefacción";
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorApagarCalefaccion = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'apagarCalefaccion';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        
        let estadoCalefaccion = await consultarUltimoValorFeed(FEED_CALEFACCION);
        if(estadoCalefaccion !== ACCESO_KO){
            if(estadoCalefaccion === "OFF"){
                let valorActualizado = await enviarValorFeed(FEED_HORA_PROGRAMADA, "--:--");
                if(valorActualizado) respuestaUsuario =  "La calefacción ya está apagada";
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
            }
            else{
                let valorActualizado = await enviarValorFeed(FEED_CALEFACCION, "OFF");
                valorActualizado = await enviarValorFeed(FEED_HORA_PROGRAMADA, "--:--");
                if(valorActualizado) respuestaUsuario = "La calefacción se ha apagado";
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
                }
            }
        else respuestaUsuario  = "No se ha podido acceder a la calefacción";
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorConsultarCalefaccion = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'consultarCalefaccion';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        
        let estadoCalefaccion = await consultarUltimoValorFeed(FEED_CALEFACCION);
        
        if(estadoCalefaccion !== ACCESO_KO){
            if(estadoCalefaccion === "OFF"){
                let horaProgramada = await consultarUltimoValorFeed(FEED_HORA_PROGRAMADA);
                if(horaProgramada !== ACCESO_KO){
                    if (horaProgramada === "--:--") respuestaUsuario = "La calefacción está apagada";
                    else respuestaUsuario = `La calefacción está programada a ${horaProgramada}`;
                }
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
            }
            else{
                let temperaturaProgramada = await consultarUltimoValorFeed(FEED_TEMPERATURA_PROGRAMADA);
                if(temperaturaProgramada !== ACCESO_KO)
                    respuestaUsuario = `La calefacción está programada a ${temperaturaProgramada} grados centígrados`;
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
                }
            }
        else respuestaUsuario  = "No se ha podido acceder a la calefacción"; 
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorProgramarTemperatura = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'programarTemperatura';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        
        //Se obtienen el valor de la temperatura programada
        let temperaturaProgramada = handlerInput.requestEnvelope.request.intent.slots.temperatura.value;
        
        let valorActualizado = await enviarValorFeed(FEED_TEMPERATURA_PROGRAMADA, temperaturaProgramada);
                if(valorActualizado)
                    respuestaUsuario = `La calefacción se ha programado a ${temperaturaProgramada} grados centígrados`;
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorProgramarHora = {
    canHandle(handlerInput) {
        return Alexa.getRequestType (handlerInput.requestEnvelope) === 'IntentRequest' &&
               Alexa.getIntentName (handlerInput.requestEnvelope) === 'programarHora';
    },
    async handle(handlerInput) {
        let respuestaUsuario;
        let horaProgramada;
        let ErrorHoraProgramada = false;
        
        if(handlerInput.requestEnvelope.request.intent.confirmationStatus === "CONFIRMED"){
            //Se obtienen el valor de los slots hora y duracion (solo uno tendrá valor)
            horaProgramada = handlerInput.requestEnvelope.request.intent.slots.hora.value;
            let duracionProgramada = handlerInput.requestEnvelope.request.intent.slots.duracion.value;
            
            //La calefacción se encenderá a una hora determinada
            if (duracionProgramada !== undefined){
                //Se obtiene la hora actual
                let objetoFecha = new Date();
                let hora = objetoFecha.getHours() + 2; //GMT+2
                let minuto = objetoFecha.getMinutes();

                let prefijo = duracionProgramada.substring(0, 2);
                let sufijo = duracionProgramada[duracionProgramada.length - 1];
                let intervalo = Number(duracionProgramada.substring(2, duracionProgramada.length - 1));
                if(prefijo === "PT" && 
                   (sufijo === "M" && intervalo < 1440) || //minutos de un día
                   (sufijo ==="H" && intervalo < 24)){
                    if(sufijo === "M"){
                        minuto += intervalo;
                        if (minuto >= 60){
                            minuto -= 60;
                            hora++;
                            if (hora >= 24) hora -= 24;
                        }
                    }
                    else if(sufijo === "H"){
                        hora += intervalo;
                        if (hora >= 24) hora -= 24;
                    }
                    if(hora < 10) hora = "0" + hora;
                    if(minuto < 10) minuto = "0" + minuto;
                    horaProgramada = hora + ":" + minuto;
                }
                else{
                    respuestaUsuario = "El intervalo no se ha dado en horas o minutos \
                                        o es superior a un día";
                    ErrorHoraProgramada = true;
                }
            }
            else if (horaProgramada === undefined){
                respuestaUsuario = "No se ha dado un intervalo de tiempo correcto";
                ErrorHoraProgramada = true;
            }
            
            if(!ErrorHoraProgramada){
                //Se actualiza el valor del feed
                let valorActualizado = await enviarValorFeed(FEED_HORA_PROGRAMADA, horaProgramada);
                valorActualizado = await enviarValorFeed(FEED_CALEFACCION, "OFF");
                if(valorActualizado)
                    respuestaUsuario = `La calefacción se ha programado a ${horaProgramada}`;
                else respuestaUsuario  = "No se ha podido acceder a la calefacción";
            }
        }
        else respuestaUsuario = "Ok. Orden de programación no ejecutada";
        
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const controladorHelpIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        let respuestaUsuario = "Puedo encender, apagar o saber el estado de la luz \
                                del salón o el dormitorio. Puedo darte la temperatura. \
                                Puedo poner la calefacción a la temperatura o la hora \
                                a la que quiera que se encienda, o, simplemente, apagarla.";
        return handlerInput.responseBuilder
            .speak(respuestaUsuario)
            .reprompt(MENSAJE_REPROMT)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Adiós. Espero poder volver a atenderte muy pronto")
            .getResponse();
    }
};

const controladorFallback = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Perdone, pero no he entendido lo que ha dicho")
            .reprompt("Puede volver a darme otra orden")
            .getResponse();
    }
};

const controladorFinSesion = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
    .addRequestHandlers(launchRequestHandler)
    .addRequestHandlers(controladorEncenderLuz)
    .addRequestHandlers(controladorApagarLuz)
    .addRequestHandlers(controladorConsultarLuz)
    .addRequestHandlers(controladorConsultarTemperatura)
    .addRequestHandlers(controladorEncenderCalefaccion)
    .addRequestHandlers(controladorApagarCalefaccion)
    .addRequestHandlers(controladorConsultarCalefaccion)
    .addRequestHandlers(controladorProgramarTemperatura)
    .addRequestHandlers(controladorProgramarHora)
    .addRequestHandlers(controladorHelpIntent)
    .addRequestHandlers(CancelAndStopIntentHandler)
    .addRequestHandlers(controladorFallback)
    .addRequestHandlers(controladorFinSesion)
    .lambda();

//************************************************************
// FUNCIONES AUXILIARES DE COMUNICACIÓN HTTP CON ADAFRUIT IO
//************************************************************

async function consultarUltimoValorFeed(nombreFeed){
    try{
        let ruta = ADAFRUIT_IO_URL_BASE + nombreFeed + "/data/last";
        let opciones = {
            headers: {"X-AIO-Key": ADAFRUIT_IO_CLAVE }
        };
        let respuestaHTTP = await axios.get(ruta, opciones);
        if(respuestaHTTP.statusText === 'OK') return respuestaHTTP.data.value;
        else return ACCESO_KO;
    }
    catch(error) {
        console.log(error.message);  
        return ACCESO_KO;
    }
}

async function enviarValorFeed(nombreFeed, valor){
    try{
        let ruta = ADAFRUIT_IO_URL_BASE + nombreFeed + "/data";
        let opciones = {
            headers: {"Content-Type":"application/json", "X-AIO-Key":ADAFRUIT_IO_CLAVE}
        };
        let datosPOST =  "{\"value\":\"" + valor + "\"}";
        let respuestaHTTP = await axios.post(ruta, datosPOST, opciones);
        if(respuestaHTTP.statusText === 'OK') return true;
        else return false;
    }
    catch(error) {
        console.log(error.message);  
        return false;
    }
}
