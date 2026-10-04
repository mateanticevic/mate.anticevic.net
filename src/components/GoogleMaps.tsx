import { default as React } from 'react';
import { GoogleMap } from '@react-google-maps/api';

export type MapProps = {
    center?: google.maps.LatLngLiteral;
    zoom?: number;
    children?: React.ReactNode;
};

const GoogleMaps = ({ center = { lat: 0, lng: 0 }, zoom = 3, children }: MapProps) => (
    <GoogleMap
        center={center}
        zoom={zoom}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
        }}>
        {children}
    </GoogleMap>
);

export default GoogleMaps;
