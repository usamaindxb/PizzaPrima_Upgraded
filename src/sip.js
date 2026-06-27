/**
 * SIP Manager — connects to Fritz!Box 6490 Cable as internal IP phone
 *
 * Your Fritz!Box is already configured with Vodafone (NRW/Hessen).
 * The app registers directly to the Fritz!Box on your local network
 * as an IP phone — exactly like "IP-Telefon 1" in your device list.
 *
 * Fritz!Box SIP settings:
 *   Registrar   : fritz.box  (or 192.168.178.1 as fallback)
 *   WS Port     : 443  (Fritz!Box WebSocket over HTTPS)
 *   Username    : your Fritz!Box IP phone username
 *   Password    : the password you set in Fritz!Box
 *   Phone nos.  : add your own numbers in the app settings
 *
 * The Fritz!Box bridges all SIP to Vodafone automatically —
 * no Vodafone SIP credentials needed in this app.
 */

export const FRITZBOX_SIP = {
  registrar:    'fritz.box',
  registrarAlt: '192.168.178.1',
  wsPort:       443,           // Fritz!Box WebSocket SIP port
  wsPath:       '/ws',         // Fritz!Box WS path
  displayName:  'Pizza Prima',
  // Safe demo placeholders only. Replace from the app settings/Fritz!Box data.
  numbers: [
    'YOUR_PHONE_NUMBER',
  ],
};

export class SIPManager {
  constructor({ onIncomingCall, onCallEnded, onRegistered, onUnregistered, onError }) {
    this.onIncomingCall  = onIncomingCall;
    this.onCallEnded     = onCallEnded;
    this.onRegistered    = onRegistered;
    this.onUnregistered  = onUnregistered;
    this.onError         = onError;

    this._ua        = null;
    this._session   = null;
    this._connected = false;
  }

  /**
   * Connect to Fritz!Box as an IP phone via WebSocket.
   *
   * @param {string} user     - Fritz!Box SIP username
   * @param {string} pass     - Fritz!Box SIP password
   * @param {string} number   - Outgoing phone number
   * @param {string} registrar - fritz.box or 192.168.178.1
   */
  async connect({ user, pass, number, registrar = FRITZBOX_SIP.registrar }) {
    let UserAgent, Registerer, SessionState;
    try {
      const sipjs    = await import('sip.js');
      UserAgent      = sipjs.UserAgent;
      Registerer     = sipjs.Registerer;
      SessionState   = sipjs.SessionState;
    } catch (err) {
      this.onError?.('SIP.js konnte nicht geladen werden: ' + err.message);
      return false;
    }

    // Fritz!Box exposes WebSocket SIP on wss://fritz.box:443/ws
    const wsServer = `wss://${registrar}:${FRITZBOX_SIP.wsPort}${FRITZBOX_SIP.wsPath}`;
    const uri      = UserAgent.makeURI(`sip:${user}@${registrar}`);

    if (!uri) {
      this.onError?.('Ungültige SIP-URI. Benutzername und Registrar prüfen.');
      return false;
    }

    const config = {
      uri,
      transportOptions: {
        server:   wsServer,
        traceSip: import.meta.env.DEV,
      },
      authorizationUsername: user,
      authorizationPassword: pass,
      displayName: FRITZBOX_SIP.displayName,
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          // Fritz!Box acts as local STUN — no external STUN needed on LAN
          iceServers: [
            { urls: `stun:${registrar}` },
            { urls: 'stun:stun.l.google.com:19302' },
          ],
        },
      },
      logLevel: import.meta.env.DEV ? 'debug' : 'error',
      delegate: {
        onInvite: (invitation) => this._handleIncoming(invitation, SessionState),
      },
    };

    try {
      this._ua = new UserAgent(config);
      await this._ua.start();

      this._registerer = new Registerer(this._ua);
      await this._registerer.register();

      this._connected = true;
      this.onRegistered?.();
      return true;
    } catch (err) {
      this._connected = false;
      this.onError?.('Fritz!Box Verbindung fehlgeschlagen: ' + (err.message || err));
      return false;
    }
  }

  _handleIncoming(invitation, SessionState) {
    this._session = invitation;

    const from         = invitation.request.from;
    const callerNumber = from?.uri?.user || from?.displayName || 'Unbekannt';

    this.onIncomingCall?.({ number: callerNumber, invitation });

    invitation.stateChange.addListener((state) => {
      if (state === SessionState.Terminated) {
        this._session = null;
        this.onCallEnded?.();
      }
    });
  }

  async accept() {
    if (!this._session) return;
    try {
      await this._session.accept({
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false },
        },
      });
    } catch (e) {
      console.error('Accept failed:', e);
    }
  }

  async reject() {
    if (!this._session) return;
    try { await this._session.reject(); } catch { /* already terminated */ }
  }

  async hangup() {
    if (!this._session) return;
    try { await this._session.bye(); } catch { /* already terminated */ }
  }

  async disconnect() {
    this._connected = false;
    try { await this._registerer?.unregister(); } catch { /* ignore */ }
    try { await this._ua?.stop(); } catch { /* ignore */ }
    this._ua = null;
    this.onUnregistered?.();
  }

  get connected() { return this._connected; }
}
