export const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
      console.log(`Error stack: ${error.stack}`);
      return handlerInput.responseBuilder
        .speak('Sorry, an error occured')
        .getResponse();
    },
  };