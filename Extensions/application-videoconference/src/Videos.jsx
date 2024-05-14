/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';

// eslint-disable-next-line react/prop-types
const Videos = ({ firestore, pc, mode, callId, setPage }) => {
  const [webcamActive, setWebcamActive] = useState(false);
  const [roomId, setRoomId] = useState(callId);

  const localRef = useRef();
  const remoteRef = useRef();

  const setupSources = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    localRef.current.srcObject = localStream;
    remoteRef.current.srcObject = remoteStream;

    setWebcamActive(true);

    if (mode === 'create') {
      const callDoc = firestore.collection('calls').doc();
      const offerCandidates = callDoc.collection('offerCandidates');
      const answerCandidates = callDoc.collection('answerCandidates');

      setRoomId(callDoc.id);

      pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await callDoc.set({ offer });

      callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
    } else if (mode === 'join') {
      const callDoc = firestore.collection('calls').doc(callId);
      const answerCandidates = callDoc.collection('answerCandidates');
      const offerCandidates = callDoc.collection('offerCandidates');

      pc.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };

      const callData = (await callDoc.get()).data();

      const offerDescription = callData.offer;
      await pc.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await callDoc.update({ answer });

      offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    }

    // eslint-disable-next-line no-unused-vars
    pc.onconnectionstatechange = (event) => {
      if (pc.connectionState === 'disconnected') {
        hangUp();
      }
    };
  };

  const hangUp = async () => {
    pc.close();

    if (roomId) {
      let roomRef = firestore.collection('calls').doc(roomId);
      await roomRef
        .collection('answerCandidates')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });
      await roomRef
        .collection('offerCandidates')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      await roomRef.delete();
    }

    window.location.reload();
  };

  return (
    <div className="videos">
      <video ref={localRef} autoPlay playsInline className="local" muted />
      <video ref={remoteRef} autoPlay playsInline className="remote" />

      <div className="buttonsContainer">
        <button
          onClick={hangUp}
          disabled={!webcamActive}
          className="hangup button"
        >
          Arreter
        </button>
        <div tabIndex={0} role="button" className="more button">
          Plus
          <div className="popover">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId);
              }}
            >
              Copier le code de la salle de videoconference
            </button>
          </div>
        </div>
      </div>

      {!webcamActive && (
        <div className="modalContainer">
          <div className="modal">
            <h3>Autorise la camera et le micro pour commencer</h3>
            <div className="container">
              <button onClick={() => setPage('home')} className="secondary">
                Cancel
              </button>
              <button onClick={setupSources}>Commencer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
