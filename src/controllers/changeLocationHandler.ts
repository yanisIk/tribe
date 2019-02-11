import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';
import { getUserInfos, getUserCountryAndPostalCode } from "../utils/alexaUtils";
import { getLocationDetailsByCityAndCountryName, updateUserProfile, getUserProfile } from "../services/userProfileService";
import { IUserProfile } from "../models/UserProfile";
import { POLLY_VOICES } from "../utils/POLLY_VOICES";

export const ChangeLocationHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'ChangeLocation';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    // @ts-ignore request.intent issue
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const cityName = slots['cityName'] && slots['cityName'].value ? slots['cityName'].value.toLowerCase() : undefined;
    const countryName = slots['countryName'] && slots['countryName'].value ? slots['countryName'].value.toLowerCase() : undefined;

    const {userId} = getUserInfos(handlerInput);
    const locationDetails = await getLocationDetailsByCityAndCountryName(cityName, countryName);

    let userProfile = await getUserProfile(userId);
    userProfile.locationPoint = {
        type: 'Point', 
        coordinates: [locationDetails.lon, locationDetails.lat]
    },
    userProfile.locationDetails = {
        city: locationDetails.city,
        country: locationDetails.country,
        cityPolygon: null
    }
    await updateUserProfile(userId, userProfile); 

    // clean up nickname in session attribtues so that the interceptor reloads the fresh one (if update)
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes['nickname'] = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const speechText = 
     `<speak>
        
        Alright <emphasis level="moderate">${userProfile.nickname}</emphasis>, let's travel to ${cityName} to meet your new Tribe.

        <audio src='soundbank://soundlibrary/scifi/amzn_sfx_scifi_boots_walking_01'/>
        <audio src='soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_02'/>
        <audio src='soundbank://soundlibrary/scifi/amzn_sfx_scifi_small_zoom_flyby_01'/>
        <audio src='soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_02'/>

        You have arrived ! Your new tribe is already here awaiting you !

        <audio src='soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01'/>
        
      </speak>`;

    const response = handlerInput.responseBuilder.getResponse();
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
  },
};