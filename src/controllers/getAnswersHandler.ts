import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getAnswersByQuestion } from "../services/answerService";
import { getActiveQuestion } from "../services/questionService";
import { IQuestion } from "../models/Question";
import { IAnswer } from "../models/Answer";

export const GetAnswersHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'GetAnswers';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // Get active question
    const activeQuestion: IQuestion = await getActiveQuestion(sessionAttributes['userId']);
    if (!activeQuestion) {
        return handlerInput.responseBuilder.speak('You have no questions').getResponse();
    }
    const lastAnswers: IAnswer[] = await getAnswersByQuestion(activeQuestion._id);

    const currentAnswer = lastAnswers.pop();
    const isLast = !lastAnswers.length;

    const repromptMessage = 'Do you want to listen to another answer ?';
    const speechText = buildAnswerSpeechText(currentAnswer, isLast, repromptMessage);

    sessionAttributes['lastAnswerId'] = currentAnswer ? currentAnswer._id : undefined;
    sessionAttributes['lastAnswers'] = lastAnswers;
    sessionAttributes['wasLastAnswer'] = isLast;
    sessionAttributes['previousIntent'] = 'GetAnswers';

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    let response;

    if (isLast) {
        response = handlerInput.responseBuilder.getResponse();
    } else {
        response = handlerInput.responseBuilder.reprompt(repromptMessage).getResponse();
    }
    
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
  },
};

export const GetAnotherAnswer : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
                && 
                (sessionAttributes['previousIntent'] === 'GetAnswers' ||
                sessionAttributes['previousIntent'] === 'GetAnotherAnswer' );
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {
  
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  
      const lastAnswers: IAnswer[] = sessionAttributes['lastAnswers'];
  
      const currentAnswer = lastAnswers.pop();
      const isLast = !lastAnswers.length; 
      const repromptMessage = 'Do you want to listen to another answer ?';
      const speechText = buildAnswerSpeechText(currentAnswer, isLast, repromptMessage);
  
      sessionAttributes['lastAnswerId'] = currentAnswer._id;
      sessionAttributes['lastAnswers'] = lastAnswers;
      sessionAttributes['wasLastAnswer'] = isLast;
      sessionAttributes['previousIntent'] = 'GetAnotherAnswer';

      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  
      let response;

      if (isLast) {
          response = handlerInput.responseBuilder.getResponse();
      } else {
          response = handlerInput.responseBuilder.reprompt(repromptMessage).getResponse();
      }
      
      response.outputSpeech = {
          type: 'SSML',
          ssml: speechText,
      };

      return response;
    },
  };

function buildAnswerSpeechText(answer: IAnswer, isLast: boolean, repromptMessage: string) {
    return answer ?
    `<speak>

        <p> 
            ${answer.nickname} said: <voice name="${answer.assignedPollyVoice}"> ${answer.answer} </voice>
        </p>

        <p>
        ${isLast ? `This was the last one` : ``}
        </p>

        <p>
        ${repromptMessage ? repromptMessage : ''}
        </p>
 
    </speak>` :
    `<speak>
      <p>
        There are  no answers from your tribe right now.
      </p>
    </speak>`;
}