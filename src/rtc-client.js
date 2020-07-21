import AgoraRTC from 'agora-rtc-sdk'
import EventEmitter from 'events'
const appID = process.env.REACT_APP_AGORA_APP_ID

export default class RTCClient {
  constructor () {
    this._client = null
    this._screenClient = null
    this._joined = false
    this._screenClient_joined = false
    this._screenClient_created = false
    this._localStream = null
    this._screenStream = null
    // this._enableBeauty = false;
    this._params = {}
    this._uid = 0
    this._eventBus = new EventEmitter()
    this._showProfile = false
    this._subscribed = false
    this._created = false
  }

  createScreenClient (data) {
    this._screenClient = AgoraRTC.createClient({
      mode: data.mode,
      codec: data.codec
    })
    return this._screenClient
  }

  publish (clienttype='') {
    let localClient = this._client;
    let stream = this._localStream;
    if(clienttype == 'screen'){
      localClient = this._screenClient
      stream = this._screenStream
    }
    // publish localStream
    localClient.publish(stream, (err) => {
      console.error(err)
    })
  }

  createClient (data) {
    this._client = AgoraRTC.createClient({
      mode: data.mode,
      codec: data.codec
    })
    return this._client
  }

  closeStream (clienttype) {
    let stream = this._localStream
    if(clienttype == 'screen'){
      stream = this._screenStream
    }
    if (stream.isPlaying()) {
      stream.stop()
    }
    stream.close()
  }

  destroy () {
    this._created = false
    this._client = null
    this._screenClient = null
    this._screenClient_created = null
  }

  on (evt, callback) {
    const customEvents = ['localStream-added', 'screenShare-canceled']

    if (customEvents.indexOf(evt) !== -1) {
      this._eventBus.on(evt, callback)
      return
    }

    this._client.on(evt, callback)
  }

  setClientRole (role) {
    this._client.setClientRole(role)
  }

  createRTCStream (data) {
    return new Promise((resolve, reject) => {
      this._uid = this._localStream ? this._localStream.getId() : data.uid
      if (this._localStream) {
        this.unpublish()
        this.closeStream()
      }
      // create rtc stream
      const rtcStream = AgoraRTC.createStream({
        streamID: this._uid,
        audio: true,
        video: true,
        screen: false,
        microphoneId: data.microphoneId,
        cameraId: data.cameraId
      })

      if (data.resolution && data.resolution !== 'default') {
        rtcStream.setVideoProfile(data.resolution)
      }

      // init local stream
      rtcStream.init(
        () => {
          this._localStream = rtcStream
          this._eventBus.emit('localStream-added', {
            stream: this._localStream
          })
          if (data.muteVideo === false) {
            this._localStream.muteVideo()
          }
          if (data.muteAudio === false) {
            this._localStream.muteAudio()
          }
          // if (data.beauty === true) {
          //   this._localStream.setBeautyEffectOptions(true, {
          //     lighteningContrastLevel: 1,
          //     lighteningLevel: 0.7,
          //     smoothnessLevel: 0.5,
          //     rednessLevel: 0.1
          //   })
          //   this._enableBeauty = true;
          // }
          resolve()
        },
        (err) => {
          reject(err)
          // Toast.error("stream init failed, please open console see more detail");
          console.error('init local stream failed ', err)
        }
      )
    })
  }

  initializeScreenSharingStream (data){
    return new Promise((resolve, reject) => {
         // create screen sharing stream
         this._uid = this._localStream ? this._localStream.getId() : data.uid
         if (this._localStream) {
           this._uid = this._localStream.getId()
           //this.unpublish()
         }
         const screenSharingStream = AgoraRTC.createStream({
           streamID: this._uid+Math.floor(1000 + Math.random() * 9000),
           audio: true,
           video: false,
           screen: true,
           microphoneId: data.microphoneId,
           cameraId: data.cameraId
         })

         if (data.resolution && data.resolution !== 'default') {
           screenSharingStream.setScreenProfile(`${data.resolution}_1`)
         }

         // init local stream
         screenSharingStream.init(
           () => {
             //this.closeStream()
             this._screenStream = screenSharingStream

             // run callback
             this._eventBus.emit('localStream-added', {
               stream: this._screenStream
             })
             resolve()
           },
           (err) => {
             //this.publish()
             reject(err)
           }
         )
    })
  }

  createScreenSharingStream (data) {

    return new Promise((resolve, reject) => {
        if(!this._screenClient_joined){
          this.join(data, 'screen').then(() => {
          
            resolve(this.initializeScreenSharingStream(data))

          })      
        }else{
           resolve(this.initializeScreenSharingStream(data))
        }
    })
  }

  subscribe (stream, callback) {
    this._client.subscribe(stream, callback)
  }

  _createTmpStream () {
    this._uid = 0
    return new Promise((resolve, reject) => {
      if (this._localStream) {
        this._localStream.close()
      }
      // create rtc stream
      const _tmpStream = AgoraRTC.createStream({
        streamID: this._uid,
        audio: true,
        video: true,
        screen: false
      })

      // init local stream
      _tmpStream.init(
        () => {
          this._localStream = _tmpStream
          resolve()
        },
        (err) => {
          reject(err)
          // Toast.error("stream init failed, please open console see more detail");
          console.error('init local stream failed ', err)
        }
      )
    })
  }

  getDevices () {
    return new Promise((resolve, reject) => {
      if (!this._client) {
        this.createClient({ codec: 'vp8', mode: 'live' })
      }
      this._createTmpStream().then(() => {
        AgoraRTC.getDevices((devices) => {
          this._localStream.close()
          resolve(devices)
        })
      })
    })
  }

  setStreamFallbackOption (stream, type) {
    this._client.setStreamFallbackOption(stream, type)
  }

  enableDualStream (clienttype) {
    let localClient = this._client
    if(clienttype=='screen'){
      localClient = this._screenClient
    }
    return new Promise((resolve, reject) => {
      localClient.enableDualStream(resolve, reject)
    })
  }

  setRemoteVideoStreamType (stream, streamType) {
    this._client.setRemoteVideoStreamType(stream, streamType)
  }

  join (data, clienttype='') {
    this._joined = 'pending'
    this._screenClient_joined = 'pending'
    return new Promise((resolve, reject) => {
      /**
       * A class defining the properties of the config parameter in the createClient method.
       * Note:
       *    Ensure that you do not leave mode and codec as empty.
       *    Ensure that you set these properties before calling Client.join.
       *  You could find more detail here. https://docs.agora.io/en/Video/API%20Reference/web/interfaces/agorartc.clientconfig.html
       **/

      this._params = data

      // handle AgoraRTC client event
      // this.handleEvents();

      let localClient = this._client;

      let loginUid = '';
      (data.userName) ? loginUid = data.userName+'##@##'+new Date().valueOf() : (localStorage.getItem('uid')) ? loginUid = localStorage.getItem('uid') : loginUid = '';

      if(clienttype=='screen'){
        localClient = this._screenClient
        loginUid = localStorage.getItem('uid')+new Date().valueOf()
      }

      
      // init client
      localClient.init(
        appID,
        () => {
          /**
           * Joins an AgoraRTC Channel
           * This method joins an AgoraRTC channel.
           * Parameters
           * tokenOrKey: string | null
           *    Low security requirements: Pass null as the parameter value.
           *    High security requirements: Pass the string of the Token or Channel Key as the parameter value. See Use Security Keys for details.
           *  channel: string
           *    A string that provides a unique channel name for the Agora session. The length must be within 64 bytes. Supported character scopes:
           *    26 lowercase English letters a-z
           *    26 uppercase English letters A-Z
           *    10 numbers 0-9
           *    Space
           *    "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", "{", "}", "|", "~", ","
           *  uid: number | null
           *    The user ID, an integer. Ensure this ID is unique. If you set the uid to null, the server assigns one and returns it in the onSuccess callback.
           *   Note:
           *      All users in the same channel should have the same type (number) of uid.
           *      If you use a number as the user ID, it should be a 32-bit unsigned integer with a value ranging from 0 to (232-1).
           **/

          localClient.join(
            data.token ? data.token : null,
            data.channel,
            //data.userName ? data.userName : null,
            loginUid,
            (uid) => {
              this._uid = uid
              // Toast.notice("join channel: " + data.channel + " success, uid: " + uid);
              console.log(
                'join channel: ' + data.channel + ' success, uid: ' + uid
              )

              if(clienttype == 'screen'){
                this._screenClient_joined = true
              }else{
                this._joined = true;
              }

              data.uid = uid

              if (data.host) {
                if(clienttype == 'screen'){
                  resolve(data.uid)
                }else{
                  this.createRTCStream(data)
                    .then(() => {
                      localStorage.setItem('uid', uid)

                      this.enableDualStream(clienttype)
                        .then(() => {
                          this.setRemoteVideoStreamType(this._localStream, 0)
                          resolve(data.uid)
                        })
                        .catch((err) => {
                          reject(err)
                        })
                    })
                    .catch((err) => {
                      reject(err)
                    })
                  }
              } else {
                resolve()
              }
            },
            (err) => {
              if(clienttype == 'screen'){
                this._screenClient_joined = false
              }else{
                this._joined = false;
              }
              reject(err)
              console.error('client join failed', err)
            }
          )
        },
        (err) => {
          if(clienttype == 'screen'){
            this._screenClient_joined = false
          }else{
            this._joined = false;
          }
          reject(err)
          console.error(err)
        }
      )
     
    })
  }

  publish (clienttype='') {

    let localClient = this._client;
    let stream = this._localStream
    if(clienttype=='screen'){
      localClient = this._screenClient;
      stream = this._screenStream
    }

    // publish localStream
    localClient.publish(stream, (err) => {
      console.error(err)
    })
  }

  unpublish (clienttype='') {
    let localClient = this._client
    let stream = this._localStream

    if(clienttype == 'screen'){
      localClient = this._screenClient
      stream = this._screenStream
    }
    if (!localClient) {
      return
    }
    localClient.unpublish(stream, (err) => {
      console.error(err)
    })
  }

  leave () {
    return new Promise((resolve) => {
      if (!this._client) return resolve()
      // leave channel
      this._client.leave(
        () => {
          this._joined = false
          this.destroy()
          // if (this._localStream && this._enableBeauty) {
          //   this._localStream.setBeautyEffectOptions(false);
          // }
          resolve()
        },
        (err) => {
          console.error(err)
        }
      )
    })
  }
}
