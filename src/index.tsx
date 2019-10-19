import React from 'react';
import Map from './components/Map';
import * as signalR from '@microsoft/signalr';
import { Marker } from 'react-google-maps';

import { Location } from './types/app';

type State = {
    center: any,
    currentLocation?: Location,
    zoom: number,
}

class IndexPage extends React.Component<{}, State> {

    state: State = {
        center: { lat: 0, lng: 0 },
        currentLocation: undefined,
        zoom: 3
    }

    componentDidMount() {
        fetch("http://api.anticevic.net/tracking/latest?username=mate").then(x => x.json()).then(r => {
            this.setState({
                center: { lat: r.Latitude, lng: r.Longitude },
                currentLocation: { latitude: r.Latitude, longitude: r.Longitude },
                zoom: 12
            });
        });

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://do.anticevic.net:5001/TrackingHub")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.start().then(function () {
            console.log("connected");
        }).catch(d => alert(JSON.stringify(d)));

        connection.on("Receive", (tracking, message) => {
            this.setState({
                center: {
                    lat: tracking.latitude,
                    lng: tracking.longitude
                },
                currentLocation: {
                    latitude: tracking.latitude,
                    longitude: tracking.longitude
                },
                zoom: 15
            });
        });
    }

    render() {
        return (
            <Map
                center={this.state.center}
                zoom={this.state.zoom}>
                {this.state.currentLocation &&
                    <Marker
                        key={1}
                        icon="me.png"
                        position={{ lat: this.state.currentLocation.latitude, lng: this.state.currentLocation.longitude }}
                        title="Current location"
                    />
                }
            </Map>
        );
    }
}

export default IndexPage;