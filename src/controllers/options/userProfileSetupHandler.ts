import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';
import { getUserInfos, getUserCountryAndPostalCode } from "../../utils/alexaUtils";
import { upsertUserProfile } from "../../services/userProfileService";
import { IUserProfile } from "../../models/UserProfile";
import { POLLY_VOICES } from "../../utils/POLLY_VOICES";
import STATES from "../STATES";

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

    const availableVoices = POLLY_VOICES.filter(v => v.gender === voiceGender);
    const assignedPollyVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)].name;

    const userProfile: IUserProfile | any = {   userId: userId,
                                                nickname: nickname,
                                                voiceGender: voiceGender,
                                                assignedPollyVoice: assignedPollyVoice,
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

    await upsertUserProfile(userProfile);
    // clean up nickname in session attribtues so that the interceptor reloads the fresh one (if update)
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes['nickname'] = null;
    sessionAttributes['state'] = STATES.QUESTIONS.ASK_QUESTION_YES_NO;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const repromptMessage = `Do you maybe want to ask a question to your tribe now ?`;

    const speechText = 
     `<speak>
        <audio src='soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01'/>
        
        <p>
            Alright <emphasis level="moderate">${nickname}</emphasis> !
            Welcome to the ${userProfile.locationDetails.city} tribe !
        </p>

        <p>
            <voice name="${userProfile.assignedPollyVoice}">This is how your voice will sound like.</voice>.
        </p>

        <p> ${repromptMessage} </p>
        
      </speak>`;

    const response = handlerInput.responseBuilder
                        .reprompt(repromptMessage)
                        .withShouldEndSession(false)
                        .getResponse();
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
  },
};