//import express from "express";
const express = require("express");
const twilio = require("./twilio.js")
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { createJwt,verifyToken } = require("./utils/Jwt.js");
const twilioLib = require("twilio");


const app= express();
const server = http.createServer(app);

const socketIo = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});


/* socketIo.use((socket,next)=>{
    //console.log("Socket middleware");

    if(socket.handshake.query && socket.handshake.query.token){
        const {token} = socket.handshake.query;
        try {
            const result = verifyToken(token);
            console.log("Token accepted")
            if(result.username) return next();
        } catch (error) {
            console.log(error);
        }
    }
}) */


socketIo.on("connection",(socket)=>{
    console.log("socket connected",socket.id);

    socket.emit("twilio-token",{token:twilio.getAccessTokenForVoice('jlvc')});
    socket.on("answer-call",({sid})=>{
        console.log("Answering call with sid:",sid);
        twilio.answerCall(sid);
    })
    socketIo.on("disconnect",(socket)=>{
        console.log("socket Disconnected",socket.id);
    
    });
})


const PORT = 3009;

var corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors(corsOptions));

/* app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",  "http://localhost:5173"); 
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
 */

//const client = twilio.client;

app.get("/",(req,res)=>res.send("Pagina de Twilio Calls"));

app.get("/test",(req,res)=>{
    res.send("Welcome Twilio");
});

app.get("/about",(req,res)=>{
    res.send("Telefonia de Kalos");
});

app.post("/check-token",(req,res)=>{
    const {token} = req.body;
    let isValid = false;
    try{
        isValid = verifyToken(token)
    }catch(error){
        console.log(error);
    }
    res.send({isValid})
})


app.post("/msg", async (req,res)=>{
    try {
        const data = await twilio.createMessage();
        console.log("datos",data);
        res.status(200).send(data);
    } catch (error) {
        
    }
});

phoneNumber = '+528120735772';



// funciona correctamente
// test con manual desde web ip , sin app de react
app.get("/login2", async (req,res)=>{
    // cuesta 0.15 dls msg
    try {
        const data = await twilio.sendVerificationCode(phoneNumber);
     //   const data = await twilio.sendVerificationCode(phoneNumber);
        console.log("datos",data);
        res.status(200).send(data);
    } catch (error) {
        console.log(error)
    }
});
// funciona correctamente
app.post("/login", async (req,res)=>{
    // cuesta 0.15 dls msg
    try {
        const {to,username,channel} = req.body;
        const data = await twilio.sendVerificationCode(to);
     //   const data = await twilio.sendVerificationCode(phoneNumber);
        console.log("datos",data);
        res.status(200).send(data);
    } catch (error) {
        console.log(error)
    }
});

/* app.post("/login", async (req,res)=>{
    try {
        const {to,username,channel} = req.body;
      //  const data = await twilio.sendVerifyAsync(to,channel);
        const data = await twilio.createVerification(to,channel);
        //console.log("datos",data);
        res.status(200).send('Sent Code');
    } catch (error) {
        console.log(error)
    }
}); */


// no lo puedo invocar directamente, revisar
// http://localhost:3009/verify?code=6405
// funciona correctamente
app.post("/verify",async (req,res)=>{
    try {
        const {to,code,username} = req.body;
        console.log("verify Twilio");
        const data = await twilio.verifyCodeAsync(to,code);
        console.log(data)
        if(data.status==="approved"){
            const token= createJwt(username);
            //console.log("toekn ",token);
            return res.send({token});
        }
        res.status(401).send('Invalid token');
    } catch (error) {
        console.log(error)
    }
});


// si funciona
app.post("/callIni", async (req,res)=>{
    try {
        //const {to,username,channel} = req.body;
        console.log("llamndo call nodejs");
        const data = await twilio.makeCall();
        //console.log("datos",data);
        res.status(200).send(data);
    } catch (error) {
        
    }
});

app.post("/get-call", async (req,res)=>{
    try {
        const {sid} = req.body;
        console.log("req",sid);

        console.log("llamndo get-call nodejs");
        const data = await twilio.getCall(sid);
        //console.log("datos",data);
        res.status(200).send(data);
    } catch (error) {
        
    }
});


app.get('/call-normal/:to', (req, res) => {
   // const to = req.query.to || '+521234567890';
    const to  = req.params.to;
    console.log("llamando al num: ",req.params.to);
    const response = new twilioLib.twiml.VoiceResponse();
    const dial = response.dial({ callerId: twilioPhoneNumber });
    dial.number(to);
    //response.dial(to);
    res.type('text/xml');
    res.send(response.toString());
  });

  dial-status

/** 
 * *
 * * OPCION DE RECEPCION DE LLAMADA
 * *
 */

// AGREGAR UN TUNEL en twilio
app.post("/call-new", async (req,res)=>{
    try {
        console.log("receive a new call");
        io.emit("call-new",{data:req.body});
        const response = twilio.voiceResponse("Kalos te agradece por llamar")
        res.type("text/xml");
        res.send(response.toString());
    } catch (error) {
        
    }
});

app.post("/call-status-changed", async (req,res)=>{
    try {
        console.log("call status-changed",res.body);
        const response = twilio.voiceResponse("Kalos te agradece por estar atento")
        res.type("text/xml");
        res.status(200).send(response.toString());
    } catch (error) {
        
    }
});


// AGREGAR UN TUNEL en twilio
// si funciona
app.post('/voices', (req, res) => {
    console.log("voices",req.body);
    const twiml = new twilioLib.twiml.VoiceResponse();
    socketIo.emit("call-new",{data:req.body})
    const mensaje = req.body.mensaje || 'Kalos te agradece comunicarte con nosotros';
    const voz = req.body.voz || 'alice';
    
    twiml.say({ voice: voz,language: 'es-ES'  }, mensaje);
    twiml.redirect("https://callcenter.loca.lt/enqueue");

    res.type('text/xml');
    res.send(twiml.toString());
    });

app.post("/enqueue",(req,res)=>{
    console.log("enqueue",req.body);
    const twiml = new twilioLib.twiml.VoiceResponse();
    socketIo.emit("enqueue",{data:req.body})
    let queueName = "Costumer service";
    twiml.enqueue(queueName) 

    res.type('text/xml');
    res.send(twiml.toString());
})    



app.post("/connect-call",(req,res)=>{
    console.log("connect-call endpoint");
    //const response = twilio.redirectCall("jlvc")
    let cte = "jlvc";
    const twiml = new twilioLib.twiml.VoiceResponse();
    twiml.dial().client(cte);
    console.log("connect-call endpoint");
    
    res.type('text/xml');
    res.send(twiml.toString());
}) 



app.post("/dial-status", (req, res) => {
    const twiml = new twilioLib.twiml.VoiceResponse();
    const dialCallStatus = req.body.DialCallStatus;
    console.log("dial-status endpoint");

    if (dialCallStatus === 'completed') {
        // Si la llamada se conectó y luego el cliente "jlvc" colgó.
        // Ahora le damos opciones al caller original.
        twiml.say('El agente ha finalizado la llamada. Si desea hablar con alguien más, presione 1, o presione 2 para dejar un mensaje.');
        twiml.gather({
            numDigits: 1,
            action: '/handle-gather', // Este endpoint manejará la entrada del usuario
            method: 'POST'
        });
    } else if (['no-answer', 'busy', 'failed'].includes(dialCallStatus)) {
        // Si la conexión con el cliente falló
        twiml.say('Lo sentimos, no pudimos conectar con el agente. Por favor, intente de nuevo más tarde o deje un mensaje después del tono.');
        twiml.record({
            action: '/handle-voicemail', // Graba un mensaje
            maxLength: 30,
            playBeep: true
        });
    } else {
        // Si la llamada con el cliente 'jlvc' aún está activa (esto es menos común en este flujo)
        // Puedes añadir aquí lógica si necesitas interactuar mientras el Dial está activo
        // Por ejemplo, si el Dial está configurado para un tiempo de espera muy largo.
        twiml.say('La llamada sigue en curso con el agente.');
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

// Endpoint para manejar la entrada del usuario después de la opción
app.post("/handle-gather", (req, res) => {
    const twiml = new twilioLib.twiml.VoiceResponse();
    const digits = req.body.Digits;

    if (digits === '1') {
        twiml.say('Transfiriendo a otro agente...');
        twiml.dial().number('+1234567890'); // Transfiere a otro número
    } else if (digits === '2') {
        twiml.say('Por favor, deje su mensaje después del tono.');
        twiml.record({
            action: '/handle-voicemail',
            maxLength: 30,
            playBeep: true
        });
    } else {
        twiml.say('Opción no válida. Por favor, intente de nuevo.');
        twiml.redirect('/dial-status'); // Redirige de nuevo para dar las opciones
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

// Endpoint para manejar los mensajes de voz grabados
app.post("/handle-voicemail", (req, res) => {
    const twiml = new twilioLib.twiml.VoiceResponse();
    const recordingUrl = req.body.RecordingUrl;
    twiml.say('Gracias por su mensaje. Lo hemos recibido.');
    twiml.hangup();
    
    console.log("Recording URL:", recordingUrl);
    // Aquí puedes guardar recordingUrl en tu base de datos o enviarlo por email.

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post("/call-status", (req, res) => {
    console.log("call-status endpoint");
    const twiml = new twilioLib.twiml.VoiceResponse();

    // Puedes inspeccionar req.body para ver el estado de la llamada (e.g., DialCallStatus)
    const dialCallStatus = req.body.DialCallStatus;
    console.log("DialCallStatus:", dialCallStatus);

    if (dialCallStatus === 'completed') {
        // La llamada con el cliente se completó (colgaron).
        // Puedes preguntar algo, redirigir a un buzón de voz, etc.
        twiml.say('Gracias por llamar. La llamada ha finalizado.');
        twiml.hangup(); // Finaliza la llamada
    } else if (dialCallStatus === 'no-answer' || dialCallStatus === 'busy' || dialCallStatus === 'failed') {
        // El cliente no contestó, estaba ocupado o la llamada falló.
        twiml.say('Lamentablemente, no pudimos conectar su llamada. Por favor, intente de nuevo más tarde.');
        twiml.hangup();
    } else {
        // Otros estados o manejo de la llamada en curso si es necesario
        twiml.say('Su llamada está en curso.');
        // Puedes añadir más lógica aquí para mantener la llamada viva, como un <Gather>
        // o un <Redirect> a otro TwiML.
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

//app.listen
server.listen(PORT,()=>{
    console.log("Listen port 3009")
});

