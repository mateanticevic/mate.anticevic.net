import React from 'react';
import Map from './components/Map';
import { LogLevel, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Marker } from 'react-google-maps';

import { Location } from './types/app';

type State = {
    center: any,
    currentLocation?: Location,
    isMoving: boolean,
    zoom: number,
}

class IndexPage extends React.Component<{}, State> {

    connection: HubConnection = new HubConnectionBuilder()
        .withUrl("https://hub.anticevic.net/TrackingHub")
        .configureLogging(LogLevel.Information)
        .build();

    state: State = {
        center: { lat: 0, lng: 0 },
        currentLocation: undefined,
        isMoving: false,
        zoom: 3
    }

    componentDidMount() {
        this.connection.start();

        this.connection.on("Receive", tracking => {
            this.setState({
                center: {
                    lat: tracking.latitude,
                    lng: tracking.longitude
                },
                currentLocation: {
                    latitude: tracking.latitude,
                    longitude: tracking.longitude,
                    speed: tracking.speed
                },
                isMoving: false,
                zoom: 17
            });
        });
    }

    render() {
        const { center, currentLocation, isMoving, zoom } = this.state;
        const labelText = isMoving ? `${Math.ceil(3.6 * currentLocation!.speed)} km/h` : ' ';

        return (
            <Map
                center={center}
                zoom={zoom}>
                {currentLocation &&
                    <Marker
                        icon={{
                            url: "https://cdn-icons-png.flaticon.com/256/0/14.png",
                            scaledSize: new google.maps.Size(30, 30),
                        }}
                        label={{
                            text: labelText,
                            fontSize: '30px'
                        }}
                        position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                        title="Current location"
                    />
                }
            </Map>
        );
    }
}

export default IndexPage;