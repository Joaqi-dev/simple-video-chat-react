import React, {Component} from 'react';
import './App.css';
import Box from '@material-ui/core/Box';
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import styled from 'styled-components';

let socket = io('192.168.254.128:8000');
let localStream = null;
var peer = new Peer(Math.floor(Math.random() * 90000000), {
  path: "/peerjs",
  host: "localhost",
  port: "8000",
});



const Button = styled.button`  
background-color: black;
color: white;
font-size: 20px;
padding: 10px 60px;
border-radius: 5px;
margin: 10px 0px;
cursor: pointer;`;


export default class App extends Component {
  constructor(props){
    super(props);
    this.displayVideo = this.displayVideo.bind(this);
    this.callUser = this.callUser.bind(this);
    this.connectToUser = this.connectToUser.bind(this);
    this.callButtonPressed = this.callButtonPressed.bind(this);
    this.myRef = React.createRef();
    this.remoteRef = React.createRef();
    this.state = {roomId: "123456"};
  }

  callAPI() {
    // fetch("http://localhost:9000/testAPI")
    //   .then(res => res.text())
    //   .then(res => this.setState({roomId: res}));
  }


  async componentDidMount(){
      // this.callAPI();
      console.log(peer.id);
      this.displayVideo();
      peer.on("open", () =>{
        console.log(`my Id is ${peer.id}`);
        socket.emit("join-room", this.state.roomId, peer.id);
      });
      this.callUser();
  }

  async callUser(){
    const partnerVideo = this.remoteRef.current;
    peer.on("call", (call) => {
      console.log("turned on call listener");
      call.answer(localStream);
      call.on("stream", (userVideoStream)=> {
        console.log("yeah");
        partnerVideo.srcObject = userVideoStream;
      });
    });
    socket.on("user-connected", (userId) => {
      console.log("connected to user");
      this.connectToUser(userId, localStream);
    });
  }

  callButtonPressed(){
    window.location.reload(false);
  }

  connectToUser(userId, stream){
    const partnerVideo = this.remoteRef.current;
    const call = peer.call(userId, stream);
    console.log("henlo");
    call.on("stream", (userVideoStream)=> {
      console.log("yes");
      partnerVideo.srcObject = userVideoStream;
    });
  }

  async displayVideo(){
    const webcamVideo = this.myRef.current;
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

    webcamVideo.srcObject = localStream;
  }

  render(){
    return (
      <div className="App">
        <body className = "App-body">
          
      
              
          <Box className = "hostVideo" p = {2}>
           <video ref = {this.myRef} autoPlay playsInline></video>
          </Box>

          <Button onClick = {this.displayVideo}>Turn on Camera</Button>
          <Button onClick = {this.callButtonPressed}>Refresh</Button>

          <Box className = "userVideo" p = {2}>
          <video ref = {this.remoteRef} autoPlay playsInline></video>
          </Box>
          <p className = "App-intro"></p>
        </body>
       </div>
     );
  }

}




