#include <SoftwareSerial.h>

SoftwareSerial puertoESP01(12, 13); // RX | TX

int pinSensorHumedad = 0;
int humedad;
 
void setup() {
   Serial.begin(115200);
   puertoESP01.begin(9600);
}
 
void loop() {
  humedad = map(analogRead(pinSensorHumedad), 0, 1023, 0, 100);
  Serial.println(humedad);
  puertoESP01.write(humedad);
  delay(5000);
}

