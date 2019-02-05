import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getMessagesAround, getMessagesByCity, insertMessage } from "../services/messageService";
import { getUserProfile, getUserProfilesAround, getUserProfilesByCity } from "../services/userProfileService";
import { getUserInfos, isGeolocationSupported, askForGeoPermissionResponse, getUserCountryAndPostalCode } from "../utils/alexaUtils";
import { IMessage } from "../models/Message";
import { IUserProfile } from "../models/UserProfile";

export const BroadcastMessageHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'BroadcastMessage';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if (!sessionAttributes['nickname']) {
      return handlerInput.responseBuilder
        .speak('Hold on, to communicate with your tribe, you first need to create an avatar. Go ahead and say: create my avatar')
        .reprompt('Go ahead and say: create my avatar')
        .getResponse();
    }

    // @ts-ignore request.intent issue
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const messageString = slots['message'] && slots['message'].value ? slots['message'].value.toLowerCase() : undefined;

    const message: IMessage | any = { message: messageString, 
                                      userId: sessionAttributes['userId'], 
                                      nickname: sessionAttributes['nickname'], 
                                      assignedPollyVoice: sessionAttributes['assignedPollyVoice'], 
                                      locationPoint: {
                                        type: 'Point', 
                                        coordinates: [sessionAttributes['longitude'], sessionAttributes['latitude']]
                                    },
                                    locationDetails: {
                                        city: sessionAttributes['city'],
                                        country: sessionAttributes['countryCode'],
                                        cityPolygon: null
                                    }                              
                                    };
    await insertMessage(message);

    const speechText = `Your message has been broadcasted to your tribe !`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};