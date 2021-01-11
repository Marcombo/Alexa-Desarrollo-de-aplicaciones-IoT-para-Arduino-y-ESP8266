#include <ESP8266WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

//SSID de la red WIFI a la que desea conectarse
const char* ssid = "**********";
//Contraseña de dicha red
const char* password =  "**********";

//Se crea el cliente NTP con el que e va a obtener la hora
WiFiUDP ntpUDP;
NTPClient clienteNTP(ntpUDP, "pool.ntp.org");

void setup() {
  Serial.begin(115200);
  
  //Inicializamos la conexión WiFi
  Serial.print("Conectando a " + String(ssid) + " ");     
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Conectado");

//Se inicia el cliente NTP
  clienteNTP.begin();
  clienteNTP.setTimeOffset(7200); //GMT+2 (en segundos)
}

void loop() {
  clienteNTP.update();

  unsigned long epochTime = clienteNTP.getEpochTime();
  struct tm *ptm = gmtime ((time_t *)&epochTime); 
  int dia = ptm->tm_mday;
  int mes = ptm->tm_mon+1;
  int anio = ptm->tm_year+1900;

  Serial.println(String(dia)+ "-" + String(mes) + "-" + String(anio));

  delay(60000);
}
