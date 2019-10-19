import { default as React } from 'react';
import GoogleMaps from './GoogleMaps';

const Map = (props) => <GoogleMaps
    center={props.center}
    zoom={props.zoom}
    containerElement={<div style={{ height: `100%` }} />}
    mapElement={<div style={{ height: `100%` }} />}>
    {props.children}
</GoogleMaps>;

export default Map;
