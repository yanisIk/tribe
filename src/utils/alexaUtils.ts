import { HandlerInput } from "ask-sdk";
import { interfaces, Response } from "ask-sdk-model";

export const isGeolocationSupported = (handlerInput: HandlerInput): boolean => {
    if (!handlerInput.context.System) return false;
    const isGeolocationSupported = handlerInput.context.System.device.supportedInterfaces.Geolocation;
    if ( isGeolocationSupported ) {   //  does the device support location based features? 
            var geoObject = handlerInput.context.Geolocation;
            if ( ! geoObject || ! geoObject.coordinate ) {
                return false;
            } else {
                return true;
            }
    }

}

export const askForGeoPermissionResponse = (handlerInput: HandlerInput, speechText: string): Response => {
    return handlerInput.responseBuilder
            .speak(speechText)
            .withAskForPermissionsConsentCard(['alexa::devices:all:geolocation:read'])
            .getResponse();
}

export const getUserInfos = (handlerInput: HandlerInput): {userId: string, deviceId: string, coordinate: interfaces.geolocation.Coordinate} => {
    const { userId } = handlerInput.requestEnvelope.context.System.user;
    const { deviceId } = handlerInput.requestEnvelope.context.System.device ? handlerInput.requestEnvelope.context.System.device : {deviceId: undefined};
    const { coordinate } = handlerInput.requestEnvelope.context.Geolocation ? handlerInput.requestEnvelope.context.Geolocation : {coordinate: undefined}

    return {userId, deviceId, coordinate};
}