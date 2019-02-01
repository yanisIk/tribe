import * as Alexa from "ask-sdk";

export const BroadcastMessageHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'BroadcastMessage';
    },
    handle(handlerInput) {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  
      const itemSlot = handlerInput.requestEnvelope.request.intent.slots.Item;
      let itemName;
      if (itemSlot && itemSlot.value) {
        itemName = itemSlot.value.toLowerCase();
      }
  
      const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), itemName);
      const myRecipes = requestAttributes.t('RECIPES');
      const recipe = myRecipes[itemName];
      let speakOutput = "";
  
      if (recipe) {
        sessionAttributes.speakOutput = recipe;
        //sessionAttributes.repromptSpeech = requestAttributes.t('RECIPE_REPEAT_MESSAGE');
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  
        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
          .withSimpleCard(cardTitle, recipe)
          .getResponse();
      }
      else{
        speakOutput = requestAttributes.t('RECIPE_NOT_FOUND_MESSAGE');
        const repromptSpeech = requestAttributes.t('RECIPE_NOT_FOUND_REPROMPT');
        if (itemName) {
          speakOutput += requestAttributes.t('RECIPE_NOT_FOUND_WITH_ITEM_NAME', itemName);
        } else {
          speakOutput += requestAttributes.t('RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME');
        }
        speakOutput += repromptSpeech;
  
        sessionAttributes.speakOutput = speakOutput; //saving speakOutput to attributes, so we can use it to repeat
        sessionAttributes.repromptSpeech = repromptSpeech;
  
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  
        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput)
          .reprompt(sessionAttributes.repromptSpeech)
          .getResponse();
      }
    }
  };

