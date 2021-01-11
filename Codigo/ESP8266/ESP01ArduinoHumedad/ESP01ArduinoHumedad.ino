#include "AdafruitIO_WiFi.h"
#include <SoftwareSerial.h>

SoftwareSerial puertoESP01(13, 12); // RX | TX

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
AdafruitIO_Feed *feed_humedad = io.feed("humedad");

unsigned int tiempoAnterior;
int intervaloEnviotemperatura = 5000;

int humedad;

void setup(){
  Serial.begin(115200);
  puertoESP01.begin(9600);

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

  if (puertoESP01.available()){
    humedad = (int)puertoESP01.read();
    Serial.println(humedad);
  }

  if(millis() - tiempoAnterior > intervaloEnviotemperatura){
    //Se envía la humedad a Adafruit IO
    feed_humedad->save(humedad);
    tiempoAnterior = millis();
  }
}
