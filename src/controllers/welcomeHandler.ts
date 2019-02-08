import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';

export const LaunchRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const repromptText = `I see that you did not create your avatar yet. To do that, say: create my avatar`;

    const speechText = 
     `<speak>
        <audio src='soundbank://soundlibrary/ambience/amzn_sfx_crowd_bar_01'/>
        

         <p>
          Welcome ${sessionAttributes['nickname'] ? 'back' : ''} to Tribe ${sessionAttributes['nickname'] ? `<break strength="weak"/> <emphasis level="moderate">${sessionAttributes['nickname']}</emphasis>` : ''} !
          
          ${sessionAttributes['nickname'] ? '' : 'The skill that lets you communicate with your nearby  tribe in a funny and anonymous way.'}
        </p>

        <p>
          ${sessionAttributes['nickname'] ? '' : repromptText}
        </p>

        
      </speak>`;

    const response = handlerInput.responseBuilder.getResponse();
    response.outputSpeech = {
      type: 'SSML',
      ssml: speechText,
    };

    // if no profile, ask to create an avatar in the reprompt
    if (!sessionAttributes['nickname']) {
      response.reprompt = {
        // @ts-ignore
        type: 'PlainText',
        text: repromptText
      }
    }

    return response;
  },
};








// Manual dialog
// const slots = handlerInput.requestEnvelope.request.intent.slots;
// const nickname = slots['nickname'] && slots['nickname'].value ? slots['nickname'].value.toLowerCase() : undefined;
// const voiceGender = slots['voiceGender'] && slots['voiceGender'].value ? slots['voiceGender'].value.toLowerCase() : undefined;    

// if (nickname && voiceGender) {
//   return await UserProfileSetupHandler.handle(handlerInput);
// }

// let elicitSlot = 'nickname';
// let speechText = `Alright ! Let's get started: what nickname would you like to use ?`
// let repromptText = `Say a nickname you would like to use in your tribe`
// if (nickname && !voiceGender) {
//   elicitSlot = 'voiceGender';
//   speechText = `Also, would you prefer a man or woman voice ?`;
//   repromptText = `Would you prefer a man or woman voice ?`;
// }

// return handlerInput.responseBuilder
//   .speak(speechText)
//   .reprompt(repromptText)
//   .addElicitSlotDirective(elicitSlot)
//   .getResponse();

// PROGRESSIVE RESPONSE API
// import SendDirectiveRequest = services.directive.SendDirectiveRequest;

// function callDirectiveService(handlerInput : HandlerInput, date : string) : Promise<void> {
//   const requestEnvelope = handlerInput.requestEnvelope;
//   const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

//   const requestId = requestEnvelope.request.requestId;

//   const directive : SendDirectiveRequest = {
//       header: {
//           requestId,
//       },
//       directive: {
//           type: 'VoicePlayer.Speak',
//           speech: `$Please wait while I look up information about ${date}...`,
//       },
//   };

//   return directiveServiceClient.enqueue(directive);
// }