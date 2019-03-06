import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';
import { getAnswersByQuestion } from "../../services/answerService";
import { getActiveQuestion } from "../../services/questionService";
import { IQuestion } from "../../models/Question";
import { IAnswer } from "../../models/Answer";
import { isIntentAndState } from "../../utils/alexaUtils";
import STATES from "../STATES";

export const GetAnswersHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    if (isIntentAndState(handlerInput, 'GetAnswers')) {
        return true;
    } else if (isIntentAndState(handlerInput, 'AMAZON.YesIntent', STATES.QUESTIONS.NEXT_ANSWER_YES_NO)) {
        return true;
    } else {
        return false;
    }
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // Get active question
    const activeQuestion: IQuestion = await getActiveQuestion(sessionAttributes['userId']);
    if (!activeQuestion) {
        return handlerInput.responseBuilder.speak('You have no questions').getResponse();
    }

    let lastAnswers: IAnswer[] = sessionAttributes['lastAnswers'];
    lastAnswers = lastAnswers ? lastAnswers : await getAnswersByQuestion(activeQuestion._id);

    const currentAnswer = lastAnswers.pop();
    const isLast = !lastAnswers.length;

    const introMessage = sessionAttributes['lastAnswers'] ? '' : 
                        `You have ${lastAnswers.length + 1} answer${lastAnswers.length + 1 > 1 ? 's' : ''} for your last question`;
    const repromptMessage = 'Another one ?';
    const speechText = buildAnswerSpeechText(currentAnswer, isLast, introMessage, repromptMessage);

    sessionAttributes['lastAnswerId'] = currentAnswer ? currentAnswer._id : undefined;
    sessionAttributes['lastAnswers'] = lastAnswers;
    sessionAttributes['wasLastAnswer'] = isLast;
    sessionAttributes['previousIntent'] = 'GetAnswers';
    sessionAttributes['state'] = STATES.QUESTIONS.NEXT_ANSWER_YES_NO;

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

function buildAnswerSpeechText(answer: IAnswer, isLast: boolean, introMessage: string = '', repromptMessage: string = '') {
    return answer ?
    `<speak>

        <p> ${introMessage} </p>

        <p> 
            ${answer.nickname} answered: <voice name="${answer.assignedPollyVoice}"> ${answer.answer} </voice>
        </p>

        <p>
        ${isLast ? `This was the last one` : ``}
        </p>

        <p>
        ${isLast ? '' : repromptMessage}
        </p>
 
    </speak>` :
    `<speak>
      <p>
        There are  no answers from your tribe right now.
      </p>
    </speak>`;
}