import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { insertMessage } from "../../services/messageService";
import { IMessage } from "../../models/Message";

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

    const speechText = `
    <speak>
        <audio src='soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01'/>
        Your message has been broadcasted to your tribe !
      </speak>
      `;

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};