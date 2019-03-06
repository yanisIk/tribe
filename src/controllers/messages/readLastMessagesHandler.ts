import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getMessagesAround, getMessagesByCity } from "../../services/messageService";
import { IMessage } from "../../models/Message";

export const ReadLastMessagesHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'ReadLastMessages';
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
    const numberOfMessages = slots['numberOfMessages'] && slots['numberOfMessages'].value ? slots['numberOfMessages'].value.toLowerCase() : undefined;

    const lastMessages: IMessage[] = await getMessagesAround(sessionAttributes['longitude'], sessionAttributes['latitude'], sessionAttributes['tribeRadiusInKm']*1000, numberOfMessages);

    const speechText = 
    lastMessages && lastMessages.length ?
    `<speak>
      
      
      <p>
          Here are the last ${numberOfMessages || ''} messages sent by your ${sessionAttributes['city']} tribe's members:
      </p>


      ${lastMessages.map((m, i) =>
        `
          <p> 
            ${m.nickname} said: <voice name="${m.assignedPollyVoice}"> ${m.message} </voice>
          </p>

          <p>
            ${i === (lastMessages.length - 1) ? `This was the last one` : `Here's another one: `}
          </p>
        `
      )}
 
    </speak>` :
    `<speak>
      <p>
        There are  no messages from your tribe right now.
      </p>
    </speak>`;

    const response = handlerInput.responseBuilder.getResponse();
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
  },
};