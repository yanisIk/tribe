import * as Alexa from "ask-sdk";
const skillBuilder = Alexa.SkillBuilders.standard();

export const mongooseContainer = {connection: null};

// Import handlers
import { LaunchRequestHandler } from "./controllers/welcomeHandler";
import { BroadcastMessageHandler } from "./controllers/broadcastMessageHandler";
import { ReadLastMessagesHandler } from "./controllers/readLastMessagesHandler";

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    BroadcastMessageHandler,
    ReadLastMessagesHandler,
    // HelpHandler,
    // RepeatHandler,
    // ExitHandler,
    // SessionEndedRequestHandler
  )
//   .addRequestInterceptors(LocalizationInterceptor)
//   .addErrorHandlers(ErrorHandler)
  .lambda();