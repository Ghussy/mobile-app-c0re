import { useEffect } from 'react';
import BackgroundGeolocation from "react-native-background-geolocation";

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1326401299289473116/tMji7ZF64F-qZhfHctvXsinLnYYf-y3mbhAVYiDA_bf3vje8H015UEWc_iSOm5ur3lK5";
const SEND_TO_DISCORD = false;  // Toggle this to control Discord messages

export function LocationReporter() {
  useEffect(() => {
    BackgroundGeolocation.ready({
      startOnBoot: true,
      stopOnTerminate: false,
      enableHeadless: true,
    }).then(() => {
      BackgroundGeolocation.start();
      BackgroundGeolocation.registerHeadlessTask(async (event) => {
        try {
          const location = await BackgroundGeolocation.getCurrentPosition({
            persist: false,
          });
          console.log("location:", location);
          
          if (SEND_TO_DISCORD) {
            const coords = location.coords;
            const message = `(while the app is closed) Richard is at ${coords.latitude}, ${coords.longitude}, travelling at ${coords.speed} m/s`;
            fetch(DISCORD_WEBHOOK_URL, {
              method: "POST",
              body: JSON.stringify({
                content: message,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            })
              .catch(console.error)
              .then(console.log);
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      });
      
      BackgroundGeolocation.onLocation((location) => {
        //console.log("location:", location);
        
        if (SEND_TO_DISCORD) {
          const coords = location.coords;
          const message = `Richard is at ${coords.latitude}, ${coords.longitude}, travelling at ${coords.speed} m/s`;
          fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            body: JSON.stringify({
              content: message,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .catch(console.error)
            .then(console.log);
        }
      });
    });
  }, []);

  return null;
}