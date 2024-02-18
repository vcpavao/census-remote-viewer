import { useEffect, useState } from "react";
import Papa from "papaparse";
import { isEmpty, isNumber } from "lodash";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";

function App() {
  const [allPlaces, setAllPlaces] = useState<string[][]>([]);
  const [displayPlaces, setDisplayPlaces] = useState<any[]>([]);

  const [selectedPopulation, setSelectedPopulation] = useState("500");
  const [selectedState, setSelectedState] = useState("Alabama");

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "Puerto Rico",
  ];
  const dropdownOptions = [
    "500",
    "1K",
    "2K",
    "3K",
    "4K",
    "5K",
    "10K",
    "25K",
    "50K",
    "100K",
    "500K",
  ];

  useEffect(() => {
    fetch("./assets/data/all_places.csv")
      .then((response) => response.text())
      .then((v) => Papa.parse<any>(v))
      .then((responseText) => {
        //console.log(responseText);
        setAllPlaces(responseText.data);
      });
  }, []);

  const handlePopulationChange = (event: SelectChangeEvent) => {
    setDisplayPlaces([]);
    setSelectedPopulation(event.target.value as string);
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    setDisplayPlaces([]);
    setSelectedState(event.target.value as string);
  };

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

  useEffect(() => {
    async function calculateDistances() {
      for (let place of allPlaces) {
        if (
          place[1] === selectedState &&
          parseFloat(place[3]) > 0 &&
          allPlaces.length > 0
        ) {
          const rawPop = selectedPopulation?.replace("K", "000");
          closestCity(place, parseInt(rawPop), allPlaces);
        }
      }
    }

    calculateDistances();
  }, [selectedState, selectedPopulation, allPlaces]);

  console.log(displayPlaces);

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
      setDisplayPlaces((places) => [
        ...places,
        { curString, retStr, closestDistance },
      ]);
    }
  }

  //console.log(displayFiveKPlaces)

  return (
    <Box>
      <Stack>
        <h2>2020 Census Distance Factfinder</h2>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">State</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedState}
                label="State"
                onChange={handleStateChange}
              >
                {states.map((o) => {
                  return <MenuItem value={o}>{o}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">
                Population Threshold
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedPopulation}
                label="Population Threshold"
                onChange={handlePopulationChange}
              >
                {dropdownOptions.map((o) => {
                  return <MenuItem value={o}>{o}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Stack>
      <table>
        <thead>
          <tr>
            <th scope="col" colSpan={3}>
              {isNumber(selectedPopulation) &&
                `Places farthest from a ${selectedPopulation}+ place`}
            </th>
          </tr>
          <tr>
            <th scope="col">Place</th>
            <th scope="col">Nearest Place</th>
            <th scope="col">Distance Away</th>
          </tr>
        </thead>
        {displayPlaces.length > 0 ? (
          <tbody>
            {displayPlaces
              ?.filter(({}, s) => s < 2000)
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
        ) : (
          <p>Loading...</p>
        )}
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}></th>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </Box>
  );
}

export default App;
