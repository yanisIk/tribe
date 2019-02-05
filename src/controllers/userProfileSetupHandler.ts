import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';
import { getUserInfos, getUserCountryAndPostalCode } from "../utils/alexaUtils";
import { createUserProfile } from "../services/userProfileService";
import { IUserProfile } from "../models/UserProfile";

export const UserProfileSetupHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'SetupProfile';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    // @ts-ignore request.intent issue
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const nickname = slots['nickname'] && slots['nickname'].value ? slots['nickname'].value.toLowerCase() : undefined;
    const voiceGender = slots['voiceGender'] && slots['voiceGender'].value ? slots['voiceGender'].value.toLowerCase() : undefined;

    const {userId, deviceId} = getUserInfos(handlerInput);
    const locationDetails = await getUserCountryAndPostalCode(handlerInput);

    const userProfile: IUserProfile | any = {   userId: userId,
                                                nickname: nickname,
                                                voiceGender: voiceGender,
                                                assignedPollyVoice: '',
                                                locationPoint: {
                                                    type: 'Point', 
                                                    coordinates: [locationDetails.lon, locationDetails.lat]
                                                },
                                                locationDetails: {
                                                    city: locationDetails.city,
                                                    country: locationDetails.countryCode,
                                                    cityPolygon: null
                                                }
                                            };

    await createUserProfile(userProfile);

    const speechText = `Alright ${nickname} ! You're ready to go, your ${userProfile.locationDetails.city} tribe awaits you !`

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};