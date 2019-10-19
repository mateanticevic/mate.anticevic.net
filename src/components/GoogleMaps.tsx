import { default as React } from 'react';
import { GoogleMap, withGoogleMap } from 'react-google-maps';

const GoogleMaps = withGoogleMap((props) => (
    <GoogleMap
        center={props.center}
        defaultCenter={{ lat: 0, lng: 0 }}
        defaultZoom={3}
        zoom={props.zoom}
        options={{
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
        }}>
        {props.children}
    </GoogleMap>
));

export default GoogleMaps;
