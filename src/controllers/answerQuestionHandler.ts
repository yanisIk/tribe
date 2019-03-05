import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services, Intent } from 'ask-sdk-model';
import { insertAnswer } from '../services/answerService';
import { IAnswer } from "../models/Answer";

export const YesNoAnswerQuestionHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && 
                (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent' ||
                 handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent')
                && 
                (sessionAttributes['previousIntent'] === 'GetQuestions' ||
                 sessionAttributes['previousIntent'] === 'GetAnotherQuestion' );
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {
  
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

      // @ts-ignore
      if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent') {
        sessionAttributes['previousIntent'] = 'YesAnswerQuestion';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        const repromptText = `Ok what is your answer`;

        return handlerInput.responseBuilder
                .speak(`You're so nice ! ${repromptText}`)
                .reprompt(repromptText)
                .addElicitSlotDirective('answer', {name: 'AnswerQuestion', confirmationStatus: 'NONE', slots: {}})
                .getResponse();
      // @ts-ignore
      } else if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent') {
        sessionAttributes['previousIntent'] = 'NoAnswerQuestion';

        let response;

        if (sessionAttributes['wasLastQuestion']) {
            response = handlerInput.responseBuilder
                .speak(`Oh ok, we won't answer this question. There's no other questions`)
                .getResponse();
        } else {
            response = handlerInput.responseBuilder
                .speak(`Oh ok, we won't answer this question.`)
                .reprompt(`Do you want to hear another question ?`)
                .getResponse();
        }

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return response;
      }
    },
};


export const AnswerQuestionHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'AnswerQuestion'
                && sessionAttributes['previousIntent'] === 'YesAnswerQuestion';
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const lastQuestionId: String = sessionAttributes['lastQuestionId'];
        // @ts-ignore request.intent issue
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const answerString = slots['answer'] && slots['answer'].value ? slots['answer'].value.toLowerCase() : undefined;

        const answer: IAnswer | any = { 
            questionId: lastQuestionId,
            answer: answerString, 
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

        await insertAnswer(answer);

        sessionAttributes['previousIntent'] = 'AnswerQuestion';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
                .speak(`Thanks for helping your tribe ${sessionAttributes['nickname']}`)
                .getResponse();
    },
};