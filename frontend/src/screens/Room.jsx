import React, { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../service/peer'



const Room = () => {

    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState()

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log('Email join', { email });
        setRemoteSocketId(id)
    }, [])


    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const offer = await peer.getOffer();
        socket.emit("user:call", {
            to: remoteSocketId, offer
        })
        setMyStream(stream)
    }, [remoteSocketId, socket])

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log('incoming Call', from, offer);
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setMyStream(stream)
        const anw = await peer.getAnswer(offer)
        socket.emit('call:accepted', { to: from, anw })
    }, [socket])


    const sendStream = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream)
        }
    }, [myStream])

    const handleCallAccepted = useCallback(async ({ from, anw }) => {
        peer.setLocalDescription(anw)
        console.log("call accepted");
        sendStream()
    }, [sendStream])

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId })
    }, [remoteSocketId, socket])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
        }

    }, [handleNegoNeeded]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {

        console.log('============>>>', from);
        const anw = await peer.getAnswer(offer)
        socket.emit('peer:nego:done', { to: from, anw })
    }, [socket])


    const handleNegoNeedFinal = useCallback(({ anw }) => {
        peer.setLocalDescription(anw)
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            console.log("got tracks");
            setRemoteStream(remoteStream[0]);
        })

    }, []);




    useEffect(() => {
        socket.on('user:joined', handleUserJoined)
        socket.on('incoming:call', handleIncomingCall)
        socket.on('call:accepted', handleCallAccepted)
        socket.on('peer:nego:needed', handleNegoNeedIncoming)
        socket.on('peer:nego:final', handleNegoNeedFinal)
        return () => {
            socket.off('user:joined', handleUserJoined)
            socket.off('incoming:call', handleIncomingCall)
            socket.off('call:accepted', handleCallAccepted)
            socket.off('peer:nego:needed', handleNegoNeedIncoming)
            socket.off('peer:nego:final', handleNegoNeedFinal)

        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);



    return (
        <div>
            <h1>hello</h1>
            <h4>{remoteSocketId ? 'Connected' : "Not one in Connect"}</h4>
            {myStream && <button onClick={sendStream}>send stream</button>}
            {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
            {myStream && <> <h1>my stream</h1><ReactPlayer playing height="360px" width="400px" url={myStream} /></>}
            {remoteStream && <> <h1>remote stream</h1><ReactPlayer playing height="360px" width="400px" url={remoteStream} /></>}

        </div>
    )
}

export default Room
