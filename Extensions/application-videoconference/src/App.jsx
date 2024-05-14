/* eslint-disable react/prop-types */
import { useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import Menu from './Menu';
import Videos from './Videos';

const firebaseConfig = {
  apiKey: 'AIzaSyAWPAfYMYOFHdpqCsgDESReK6uw0_nXciY',
  authDomain: 'video-conference-webrtc.firebaseapp.com',
  databaseURL: 'https://video-conference-webrtc-default-rtdb.firebaseio.com',
  projectId: 'video-conference-webrtc',
  storageBucket: 'video-conference-webrtc.appspot.com',
  messagingSenderId: '44999831891',
  appId: '1:44999831891:web:a5fd34800211ef3a43f1a6',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [CodeVideo, setCodeVideo] = useState('');

  return (
    <div className="app">
      {currentPage === 'home' ? (
        <Menu
          joinCode={CodeVideo}
          setJoinCode={setCodeVideo}
          setPage={setCurrentPage}
        />
      ) : (
        <Videos
          firestore={firestore}
          pc={pc}
          mode={currentPage}
          callId={CodeVideo}
          setPage={setCurrentPage}
        />
      )}
    </div>
  );
}

export default App;
