import {
  GoogleMap,
  useLoadScript,
} from "@react-google-maps/api";

import { formatRelative } from "date-fns";
import mapStyles from "./MapStyles";
import "./index.css";
import { useState, useCallback, useRef } from 'react';

import Search from "./Search";
import Locate from "./Locate";
import InfoBox from "./InfoBox";
import Offer from "./Offer";
import Request from "./Request";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100vw",
  height: "90vh",
}
const center = {
  lat: 45.504717,
  lng: -73.576456,
}

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
}

export default function Map() {

  let LAT;
  let LNG;
  
  const KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: KEY,
    libraries,
  });

  const [selected, setSelected] = useState(null);

  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [infoBox, setInfoBox] = useState(null);

  // const onMapClick = useCallback((e) => {
  //   setInfoBox({
  //     lat: e.latLng.lat(),
  //     lng: e.latLng.lng(),
  //   });
  //   setSelected(null);
  // }, []);

  const onMapClick = (e) => {

    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${KEY}`
    let postalCode = null;

    // Step 1: reverse geolocate to obtain postal code of the click
    const fetchPostalCode = fetch(url)
      .then(data => data.json()
        .then(res => {

          const address = res.results[0].address_components;

          address.forEach(part => {
            if (part.types.includes("postal_code")) {
              postalCode = part.long_name;
            }
          });
          
          // Step 2: geolocate on given postal code to find common latitude and longitude for all posts in area
          const secondUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&key=${KEY}`
          const fetchCoordinates = fetch(secondUrl)
            .then(response => response.json())
              .then(data => {
                return {
                  lat: data.results[0].geometry.location.lat,
                  lng: data.results[0].geometry.location.lng,
                }
              })
          // Here, we need to await the response of the nested promise before returning any value for the outer promise
          const coordinates =  fetchCoordinates.then(value => {
            return value
          })
          return coordinates
        })
      );

    LAT = fetchPostalCode.then(value => {
      return value.lat;
    })

    LNG = fetchPostalCode.then(value => {
      return value.lng;
    })
    console.log(LAT)
    console.log(LNG)

    setInfoBox({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    setSelected(null);

  }


  const mapRef = new useRef();
  const onMapLoad = useCallback((map) => {
      mapRef.current = map;
    }, []);

  const panTo = useCallback(({lat, lng}) => {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }, []);

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";

  return (
  <div>
    <h1>
      UAEM McGill
    </h1>

    <Locate panTo={panTo}/>
    <Search panTo={panTo} />

    <GoogleMap
      id="map"
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={center}
      options={options}
      onClick={onMapClick}
      onLoad={onMapLoad}
      LAT={LAT}
      LNG={LNG}
    >
      {infoBox && 
        <InfoBox 
          lat={infoBox.lat} 
          lng={infoBox.lng} 
          setInfoBox={setInfoBox} 
          setOffers={setOffers}
          setRequests={setRequests}
        />}
        {offers.map((offer) => (
          <Offer 
            key={`${offer.lat}-${offer.lng}`}
            selected={selected}
            setSelected={setSelected}
            offer={offer}
            setInfoBox={setInfoBox}
          />
        ))}
        {requests.map((request) => (
          <Request 
            key={`${request.lat}-${request.lng}`}
            selected={selected}
            setSelected={setSelected}
            request={request}
            setInfoBox={setInfoBox}
          />
        ))}
    </GoogleMap>
  </div>
  );
}

