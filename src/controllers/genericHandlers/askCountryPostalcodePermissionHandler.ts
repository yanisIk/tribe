import { HandlerInput } from "ask-sdk";
import { askForGeoPermissionResponse, isGeolocationSupported, isGeolocationAuthorized, isCountryPostalCodenAuthorized, askForCountryPostalCodePermissionResponse } from "../../utils/alexaUtils";

export const AskForCountryPostalCodePermission = {
    canHandle(handlerInput: HandlerInput) {
        return !isCountryPostalCodenAuthorized(handlerInput);
    },
    handle(handlerInput: HandlerInput) {
        const permissionText = `Tribe needs your location to work. To turn on location sharing, please go to your Alexa app, and follow the instructions.`
        return askForCountryPostalCodePermissionResponse(handlerInput, permissionText);
    },
};