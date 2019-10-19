import React from 'react';
import Map from './components/Map';
import * as signalR from '@microsoft/signalr';
import { Marker } from 'react-google-maps';

import { Location } from './types/app';

type State = {
    center: any,
    currentLocation?: Location,
    isMoving: boolean,
    zoom: number,
}

class IndexPage extends React.Component<{}, State> {

    state: State = {
        center: { lat: 0, lng: 0 },
        currentLocation: undefined,
        isMoving: false,
        zoom: 3
    }

    componentDidMount() {
        fetch("https://api.anticevic.net/tracking/latest?username=mate").then(x => x.json()).then(r => {
            this.setState({
                center: { lat: r.Latitude, lng: r.Longitude },
                currentLocation: { latitude: r.Latitude, longitude: r.Longitude, speed: r.Speed },
                zoom: 12
            });
        });

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://do.anticevic.net:5001/TrackingHub")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.start().then(function () {
            console.log("connected");
        });

        connection.on("Receive", (tracking, message) => {
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
                isMoving: true,
                zoom: 15
            });
        });
    }

    render() {

        const labelText = this.state.isMoving ? `${Math.ceil(3.6 * this.state.currentLocation!.speed)} km/h` : ' ';

        return (
            <Map
                center={this.state.center}
                zoom={this.state.zoom}>
                {this.state.currentLocation &&
                    <Marker
                        icon={{
                            url:"me.png",
                            labelOrigin: {
                                x: 120,
                                y: 25
                            }
                        }}
                        label={{
                            text: labelText,
                            fontSize: '30px'
                        }}
                        position={{ lat: this.state.currentLocation.latitude, lng: this.state.currentLocation.longitude }}
                        title="Current location"
                    />
                }
            </Map>
        );
    }
}

export default IndexPage;