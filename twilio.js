//https://www.youtube.com/watch?v=3XmtJgWcOT0
// trascription de llamda de twilio 

const twilio =  require("twilio");
const VoiceResponse = require("twilio").twiml.VoiceResponse
require('dotenv').config();

//const client = twilio(accountSid,tokenSecret);

/* async function createService(){
    const service = await client.verify.v2.services.create({
        friendlyName:"Call_center_services"
    })

    console.log(service.sid);
}

createService(); */

class Twilio{

    phoneNumber = process.env.phoneNumber;
    tokenSid  =  process.env.tokenSid;
    tokenSecret = process.env.tokenSecret;
    accountSid = process.env.accountSid;
    

    verify= process.env.verify;
    outgoingApplicattionSid=process.env.outgoingApplicationSid;
    TWILIO_APP_SID =process.env.TWILIO_APP_SID;
    //

    


    //client;
    constructor(){
/*         this.client = twilio(this.tokenSid,this.tokenSecret,{
            accountSid:this.accountSid,
        }) */
        this.client = new twilio(this.accountSid,this.tokenSecret);
        console.log("actualizado");
    }

    getTwilio(){
        this.client;
        console.log("cliente",this.client);
    }

    // manda codigo al celular
    // a mi no me funciona
    // regresa el verify
    async sendVerifyAsync(to,channel){
        const data = await this.client.verify.v2.services.create({
            friendlyName: "Node_Verifi_services",
        });
        //verify=data.sid;
        //console.log(data.sid);

        return data.toJSON();
    }

    // funciona uno a tres msgg por dia
    async createMessage(){
        console.log("message");
        const msg = await this.client.messages.create({
            body:"Mi primer message",
            from:this.phoneNumber, 
            to:"+528120735772",
            //mediaUrl:['']  
        });
        console.log(msg.body);

        return msg.toJSON();
    }

    /// sacado de copilot funciona correctamente
    async sendVerificationCode(numeroTelefono){
        try {
            console.log({account:this.accountSid,token:this.tokenSecret,verifi:this.verify})
        const verification = await this.client.verify.v2.services(this.verify)
            .verifications
            .create({ to: numeroTelefono , channel: 'sms' });
        console.log(`Código de verificación enviado: ${verification.status}`);
        
    
        } catch (error) {
        console.error(`Error al enviar el código: ${error.message}`);
        }
    };
    // me faltaba to:this.phoneNumber
    async createVerification(to,channel) {
        const verification = await this.client.verify.v2
          .services(this.verify)
          .verifications.create({
            channel,
            to
          });
      
        console.log(verification.status);
      }



     // funciona correctamente 
    async verifyCodeAsync(to,code){
        console.log("validadndo",{to,code})
        const data = await this.client.verify.v2.services(this.verify).verificationChecks.create({
            code, 
            to
            
        });
        console.log(data.status);

        return data.toJSON();
    }

 

    // no me funciona
    enqueueCall(queueName){
        const twin = new VoiceResponse();
        twin.enqueue(queueName);

        return twin;
    }

    // no me funciona
    redirectCall(client){
        const twiml = new VoiceResponse();
        twiml.dial().client(client);

        return twiml;
    }

    getAccessTokenForVoice(identity){
        console.log(`Access token for ${identity}`);
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;
        const voiceGrant = new VoiceGrant({   
            outgoingApplicationSid:this.outgoingApplicattionSid,
            incominAllow:true
        });
        const token = new AccessToken(
            this.accountSid,
            this.tokenSid,
            this.tokenSecret,
            {identity}
        );
        token.addGrant(voiceGrant);

        //console.log("Access granted with JWT",token.toJwt());
        return (token.toJwt());
    }

    // redirecciona la llamada al endpoint
    async answerCall(sid){
        console.log("answerCall with sid:",sid);
       // console.log("cliente",this.client);
        const call = await this.client.calls(sid).update({
            url:"https://callcenter.loca.lt/connect-call",
        //   twiml: "<Response><Say>Ahoy there</Say></Response>",
      //      url:"http://demo.twilio.com/docs/voice.xml",
            method:"POST",
             function (err,call){
                console.log("answerCall",call);
                if(err){
                    console.error("answerCall",err)
                }
            } 
        });
        console.log(call.sid); 
    }

    /// llamada de publicidad, o recordatorio de pago
    // msg grabado en twiml bin
    async makeCall(){
        const call = await this.client.calls.create({
            //url:"http://demo.twilio.com/docs/voice.xml",
            url:"https://handler.twilio.com/twiml/EHf182cc36e06bfedfb76ac36775d63e90",
            method:"post",
            from:this.phoneNumber, 
            to:"+528120735772",
        })
        console.log("call_sid",call.sid);
        return call.sid;
    }

    async getCall(sid){
        //console.log("answerCall with sid:",sid);
        const call = await this.client.calls(sid).fetch();        
        console.log(call);
        return call; 
    }

    async getCallNormal(sid){
        //console.log("answerCall with sid:",sid);
        const call = await this.client.calls(sid).fetch();        
        console.log(call);
        return call; 
    }

    /// revisar de github
    async getConference(context, event, callback) {
        const twiml = new Twilio.twiml.VoiceResponse();
        // Change the conference name to anything you like.
        const conferenceName = 'Snowy Owl';
        twiml.dial().conference(conferenceName);
        callback(null, twiml);
      };

      getMenuIvr(context, event, callback) {
        const twiml = new Twilio.twiml.VoiceResponse();
        const gather = twiml.gather({
          numDigits: 1,
          action: 'handle-user-input',
          hints: 'sales, opening hours, address',
          input: 'speech dtmf',
        });
        gather.say('Please press 1 or say Sales to talk to someone');
        gather.say('Press 2 or say Opening Hours to hear when we are open');
        gather.say(
          'Press 3 or say Address to receive a text message with our address'
        );
        twiml.say(`Sorry we couldn't understand you`);
        twiml.redirect();
        callback(null, twiml);
      };
}

const instance = new Twilio();
Object.freeze(instance);

// module.exports = instance;
module.exports = instance;


