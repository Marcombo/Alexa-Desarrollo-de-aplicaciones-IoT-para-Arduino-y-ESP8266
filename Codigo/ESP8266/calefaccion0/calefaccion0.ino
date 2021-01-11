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
//Feed
AdafruitIO_Feed *feed_dht11 = io.feed("temperatura-actual");

int pinDHT11 = 12;
SimpleDHT11 dht11;
byte temperatura = 0;
byte humedad = 0;

unsigned int tiempoAnterior;
int intervaloEnviotemperatura = 5000;

void setup(){
  Serial.begin(115200);
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
}

void loop(){
  io.run();
  
  if(millis() - tiempoAnterior > intervaloEnviotemperatura){
    dht11.read(pinDHT11, &temperatura, &humedad, NULL);
    if (!isnan(temperatura)){
      Serial.println("Temperatura: " + String(temperatura));
      feed_dht11->save(temperatura);
    }
    tiempoAnterior = millis();
  }
}
