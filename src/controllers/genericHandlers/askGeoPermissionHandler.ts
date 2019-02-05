import { HandlerInput } from "ask-sdk";
import { askForGeoPermissionResponse, isGeolocationSupported, isGeolocationAuthorized } from "../../utils/alexaUtils";

export const AskGeoPermissionHandler = {
    canHandle(handlerInput: HandlerInput) {
        return !isGeolocationAuthorized(handlerInput);
    },
    handle(handlerInput: HandlerInput) {
        if (isGeolocationSupported(handlerInput)) {
            const permissionText = `Tribe needs your location to work. To turn on location sharing, please go to your Alexa app, and follow the instructions.`
            return askForGeoPermissionResponse(handlerInput, permissionText);    
        }
        return handlerInput.responseBuilder
                .speak(`I'm sorry, Tribe can only work on geolocation enabled devices`)
                .getResponse();
    },
};