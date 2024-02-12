import { useEffect, useState } from "react";
import Papa from "papaparse";
import { isEmpty } from "lodash";

function App() {
  const [displayFiveKPlaces, setDisplayFiveKPlaces] = useState<any[]>([]);
  const [displayTenKPlaces, setDisplayTenKPlaces] = useState<any[]>([]);
  const [displayHundKPlaces, setDisplayHundKPlaces] = useState<any[]>([]);

  useEffect(() => {
    fetch("./data/all_places.csv")
      .then((response) => response.text())
      .then((v) => Papa.parse<any>(v))
      .then((responseText) => {
        //console.log(responseText);
        calculateDistances(responseText.data);
      });
  }, []);

  const haversine_distance = (
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number
  ) => {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = latitude1 * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = latitude2 * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (longitude2 - longitude1) * (Math.PI / 180); // Radian difference (longitudes)

    var d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );

    return d;
  };

  async function calculateDistances(places: string[][]) {
    for (let place of places) {
      if (
        place[1] === "Wyoming" &&
        parseFloat(place[3]) > 0 &&
        places.length > 0
      ) {
        //  Refactor hardcoding into dropdown
        closestCity(place, 5000, places);
        /*closestCity(place, 10000);
      closestCity(place, 100000);*/
      }
    }
  }

  async function closestCity(
    place: string[],
    popThreshold: number,
    places: string[][]
  ) {
    let curString = "";
    let retStr = "";
    //console.log(`Current place`, place)
    let closestDistance = 100000000;
    for (let i = 1; i < places.length; i++) {
      //  Make sure the current place is not being compared
      curString = `${place[0]}, ${place[1]}`;
      const compString = `${places[i][0]}, ${places[i][1]}`;
      if (
        curString !== compString &&
        !isEmpty(place[4]) &&
        !isEmpty(place[5]) &&
        parseFloat(places[i][3]?.replace(",", "")) > popThreshold
      ) {
        const distance = haversine_distance(
          parseFloat(place[4]),
          parseFloat(place[5]),
          parseFloat(places[i][4]),
          parseFloat(places[i][5])
        );
        if (distance < closestDistance) {
          /*console.log(
            `${places[i][0]}, ${places[i][1]} is ${distance} from ${place[0]}, ${place[1]}`
          );*/
          closestDistance = distance;
          retStr = compString;
        }
      }
    }
    if (closestDistance < 100000000) {
      setDisplayFiveKPlaces((fiveKPlaces) => [
        ...fiveKPlaces,
        { curString, retStr, closestDistance },
      ]);
    }
  }

  //console.log(displayFiveKPlaces)

  return (
    <table>
      <thead>
        <tr>
          <th scope="col" colSpan={3}>
            Places farthest from a 3K+ place
          </th>
          <th scope="col" colSpan={3}>
            Places farthest from a 10K+ place
          </th>
          <th scope="col" colSpan={3}>
            Places farthest from a 100K+ place
          </th>
        </tr>
        <tr>
          <th scope="col">Place</th>
          <th scope="col">Nearest Place</th>
          <th scope="col">Distance Away</th>
          <th scope="col">Place</th>
          <th scope="col">Nearest Place</th>
          <th scope="col">Distance Away</th>
          <th scope="col">Place</th>
          <th scope="col">Nearest Place</th>
          <th scope="col">Distance Away</th>
        </tr>
      </thead>
      <tbody>
        {displayFiveKPlaces
          ?.filter((k, s) => s < 2000)
          .sort((a, b) => b.closestDistance - a.closestDistance)
          .map((place) => {
            return (
              <tr>
                <th scope="row">{place?.curString}</th>
                <td>{place?.retStr}</td>
                <td>{place?.closestDistance?.toFixed(3)}</td>
              </tr>
            );
          })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            Average age
          </th>
          <td>33</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default App;
