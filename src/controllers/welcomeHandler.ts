import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getUserInfos, isGeolocationSupported, askForGeoPermissionResponse } from "../utils/alexaUtils";
import { getUserProfile, upsertUserProfile } from "../services/userProfileService";
import { IUserProfile } from "../models/UserProfile";
import { UserProfileSetupHandler } from "./userProfileSetupHandler";

export const LaunchRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const WELCOME_MESSAGE = 'Welcome to Tribe ! The skill that lets you communicate with your nearby tribe in a funny and anonymous way.';
    
    const {userId, deviceId, coordinate} = getUserInfos(handlerInput);
    const userProfile: IUserProfile = await getUserProfile(userId);

    let speechText: string;

    if (!isGeolocationSupported(handlerInput)) {
      speechText = `${WELCOME_MESSAGE} ... To make the skill work, Tribe would like to use your location. To turn on location sharing, please go to your Alexa app, and follow the instructions.`
      return askForGeoPermissionResponse(handlerInput, speechText);
    }

    speechText = WELCOME_MESSAGE;

    // If already existing profile, just update coordinates and simply welcome the user
    if (userProfile && userProfile.nickname && userProfile.voiceGender) {
      if (userProfile.locationPoint.coordinates !== [coordinate.longitudeInDegrees, coordinate.latitudeInDegrees]) {
        userProfile.locationPoint.coordinates = [coordinate.longitudeInDegrees, coordinate.latitudeInDegrees];
        await upsertUserProfile(userId, userProfile);
      }
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();

    // If no profile, ask to setup the profile here
    } else {

      speechText = `I see that you did not create your avatar yet. To do that, ask me to create an avatar`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
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