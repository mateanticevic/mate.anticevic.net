import { default as React } from 'react';
import GoogleMaps, { MapProps } from './GoogleMaps';

const Map = (props: MapProps) => <GoogleMaps
    center={props.center}
    zoom={props.zoom}>
    {props.children}
</GoogleMaps>;

export default Map;
