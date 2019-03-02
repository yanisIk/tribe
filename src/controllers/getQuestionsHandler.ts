import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getQuestionsAround, getQuestionsByCity } from "../services/questionService";
import { IQuestion } from "../models/Question";

export const GetQuestionsHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'GetQuestions';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if (!sessionAttributes['nickname']) {
      return handlerInput.responseBuilder
        .speak('Hold on, to communicate with your tribe, you first need to create an avatar. Go ahead and say: create my avatar')
        .reprompt('Go ahead and say: create my avatar')
        .getResponse();
    }

    const lastQuestions: IQuestion[] = await getQuestionsAround(sessionAttributes['longitude'], sessionAttributes['latitude'], sessionAttributes['tribeRadiusInKm']*1000);

    const currentQuestion = lastQuestions.pop();
    const isLast = !lastQuestions.length; 

    const repromptMessage = `Do you want to answer it ?`;
    const speechText = buildQuestionSpeechText(currentQuestion, isLast, repromptMessage);

    sessionAttributes['lastQuestionId'] = currentQuestion ? currentQuestion._id : undefined;
    sessionAttributes['lastQuestions'] = lastQuestions;
    sessionAttributes['wasLastQuestion'] = isLast;
    sessionAttributes['previousIntent'] = 'GetQuestions';

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const response = handlerInput.responseBuilder.reprompt(repromptMessage).getResponse();
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
  },
};

export const GetAnotherQuestion : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
                && sessionAttributes['previousIntent'] === 'NoAnswerIntent';
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {
  
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  
      const lastQuestions: IQuestion[] = sessionAttributes['lastQuestions'];
  
      const currentQuestion = lastQuestions.pop();
      const isLast = !lastQuestions.length; 
      
      const repromptMessage = `Do you want to answer it ?`;
      const speechText = buildQuestionSpeechText(currentQuestion, isLast, repromptMessage);
  
      sessionAttributes['lastQuestionId'] = currentQuestion._id;
      sessionAttributes['lastQuestions'] = lastQuestions;
      sessionAttributes['wasLastQuestion'] = isLast;
      sessionAttributes['previousIntent'] = 'GetAnotherQuestion';

      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  
      const response = handlerInput.responseBuilder.reprompt(repromptMessage).getResponse();
      response.outputSpeech = {
          type: 'SSML',
          ssml: speechText,
      };
      return response;
    },
  };

function buildQuestionSpeechText(question: IQuestion, isLast: boolean, repromptMessage: string) {
    return question ?
    `<speak>

        <p> 
            ${question.nickname} said: <voice name="${question.assignedPollyVoice}"> ${question.question} </voice>
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
        There are  no questions from your tribe right now.
      </p>
    </speak>`;
}