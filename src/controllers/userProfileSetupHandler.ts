import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getUserInfos, isGeolocationSupported, askForGeoPermissionResponse } from "../utils/alexaUtils";
import { getUserProfile, upsertUserProfile } from "../services/userProfileService";
import { IUserProfile } from "../models/UserProfile";

export const UserProfileSetupHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'SetupProfile';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    if (!isGeolocationSupported(handlerInput)) {
        const permissionText = `Before setting up your avatar, Tribe needs to use your location. To turn on location sharing, please go to your Alexa app, and follow the instructions.`
        return askForGeoPermissionResponse(handlerInput, permissionText);
    }

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // @ts-ignore request.intent issue
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const nickname = slots['nickname'] && slots['nickname'].value ? slots['nickname'].value.toLowerCase() : undefined;
    const voiceGender = slots['voiceGender'] && slots['voiceGender'].value ? slots['voiceGender'].value.toLowerCase() : undefined;

    const {userId, deviceId, coordinate} = getUserInfos(handlerInput);

    const userProfile: IUserProfile | any = {   userId: userId,
                                                nickname: nickname,
                                                assignedPollyVoice: '',
                                                locationPoint: {
                                                    type: 'Point', 
                                                    coordinates: [coordinate.longitudeInDegrees, coordinate.latitudeInDegrees]
                                                },
                                                locationDetails: {
                                                    city: '',
                                                    country: '',
                                                    cityPolygon: null
                                                }
                                            };

    await upsertUserProfile(userId, userProfile);

    const speechText = `Alright ${nickname} ! You're ready to go, your tribe awaits you !`

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};