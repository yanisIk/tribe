import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getUserInfos, isGeolocationSupported, askForGeoPermissionResponse } from "../utils/alexaUtils";
import { getUserProfile, createUserProfile } from "../services/userProfileService";
import { IUserProfile } from "../models/UserProfile";
import { UserProfileSetupHandler } from "./userProfileSetupHandler";

export const LaunchRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const WELCOME_MESSAGE = `Welcome ${sessionAttributes['nickname'] ? 'back' : ''} to Tribe ${sessionAttributes          ['nickname'] || ''} ! ${sessionAttributes['nickname'] ? '' : 'The skill that lets you communicate with your nearby  tribe in a funny and anonymous way.'}`;

    let speechText: string;

    // If already existing profile, just update coordinates and simply welcome the user
    if (sessionAttributes['nickname']) {
      
      speechText = WELCOME_MESSAGE;

      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();

    // If no profile, ask to setup the profile here
    } else {

      const repromptText = `I see that you did not create your avatar yet. To do that, say: create my avatar`;
      speechText = `${WELCOME_MESSAGE} ... ${repromptText}`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
    }
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