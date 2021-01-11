#include "AdafruitIO_WiFi.h"
#include <SimpleDHT.h>

// SSID de la red WIFI a la que desea conectarse
#define WIFI_SSID "**********"
//Contraseña de dicha red
#define WIFI_PASS "**********"

//Usuario Adafruit
#define IO_USERNAME "**********"
//Clave
#define IO_KEY "**********"

//Conexión con Adafruit IO
AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
//Feeds
AdafruitIO_Feed *feed_estado_calefaccion = io.feed("calefaccion");
AdafruitIO_Feed *feed_temp_actual = io.feed("temperatura-actual");
AdafruitIO_Feed *feed_temp_progamada = io.feed("temperatura-programada");

int pinRele = 13;
bool releActivado = false;
String estadoCalefaccion;
String temperaturaProgramada;

int pinDHT11 = 12;
SimpleDHT11 dht11;
byte temperaturaActual = 0;
byte humedad = 0;

unsigned int tiempoAnterior;
int intervaloEnviotemperatura = 5000;

void setup(){
  Serial.begin(115200);
  pinMode(pinRele, OUTPUT);
  pinMode(pinDHT11, INPUT);

  //Estableciendo conexión con Adafruit IO
  Serial.print("Conectándose con Adafruit IO");
  io.connect();
  while(io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  //Conexión establecida
  Serial.println();
  Serial.println(io.statusText());

  //Función de callback
  feed_estado_calefaccion->onMessage(controlEstadoCalefaccion);
  feed_temp_progamada->onMessage(controlTemperaturaProgramada);

  //Obtengo el valor del estado actual de la calefacción
  feed_estado_calefaccion->get();
  feed_temp_progamada->get();
}

void loop(){
  io.run();
  
  if(millis() - tiempoAnterior > intervaloEnviotemperatura){
    dht11.read(pinDHT11, &temperaturaActual, &humedad, NULL);
    if (!isnan(temperaturaActual)){
      Serial.println("Temperatura: " + String(temperaturaActual));
      feed_temp_actual->save(temperaturaActual);
    }
    tiempoAnterior = millis();
  }

  if(estadoCalefaccion == "ON" && (temperaturaProgramada.toInt() < (int)temperaturaActual)){
    if(!releActivado){
      releActivado = true;
      digitalWrite(pinRele, HIGH);
    }
  }
  else if(releActivado){
    releActivado = false;
    digitalWrite(pinRele, LOW);
  }
}

//Función de callback que se llama cuando se modifica el estado de la calefacción
void controlEstadoCalefaccion(AdafruitIO_Data *datos) {
  estadoCalefaccion = datos->value();
  Serial.println("Estado de la calefacción: " + estadoCalefaccion);
}

//Función de callback que se llama cuando se modifica la temperatura programada
void controlTemperaturaProgramada(AdafruitIO_Data *datos) {
  temperaturaProgramada = datos->value();
  Serial.println("Temperatura programada: " + temperaturaProgramada);
}
