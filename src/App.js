import React, {Component} from 'react';
import Particles from 'react-particles-js'
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import Logo from './components/Logo/Logo'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'

import './App.css';



const particlesOptions = {
  particles: {
    number: {
      value: 50, 
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
   input: '',
      imageUrl:'',
      box: {},
      // route keeps track of where we are on the page, initially on signin page
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
}
class App extends Component  {
  constructor () {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user : {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
    console.log(this.state.user.name);
  }

  /*componentDidMount() {
    fetch('http://localhost:3000')
      .then(response => response.json())
      .then(console.log('oops'))
  }*/

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width) // grabbing the css styles that are in px to calculate
    const height = Number(image.height) // where the endpoints of the square should be
    return {
      // using data given to us by the api response, we can calculate the face
      // example, left_col is one of the things from the response
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox  = (box) => {
    console.log(box);
    this.setState({box: box})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    // below code is from the clarifai models website
    fetch('https://rocky-mountain-48023.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              input: this.state.input
            })
          })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://rocky-mountain-48023.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      console.log('here');
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
          : (
            route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
          
          }
      </div>
    );
  }
}

export default App;
