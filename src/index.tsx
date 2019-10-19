import React from 'react';
import Map from './components/Map';

type State = {

}

class IndexPage extends React.Component<{}, State> {

    render(){

        return(
            <Map />
        );
    }
}

export default IndexPage;