import { HandlerInput } from "ask-sdk";
import { interfaces, Response } from "ask-sdk-model";

export const isGeolocationSupported = (handlerInput: HandlerInput): boolean => {
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

export const askForGeoPermissionResponse = (handlerInput: HandlerInput): Response => {
    return handlerInput.responseBuilder
            .speak('Tribe would like to use your location. To turn on location sharing, please go to your Alexa app, and follow the instructions.')
            .withAskForPermissionsConsentCard(['alexa::devices:all:geolocation:read'])
            .getResponse();
}

export const getUserInfos = (handlerInput: HandlerInput): {userId: string, deviceId: string, coordinate: interfaces.geolocation.Coordinate} => {
    const { userId } = handlerInput.requestEnvelope.context.System.user;
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const { coordinate } = handlerInput.requestEnvelope.context.Geolocation;

    return {userId, deviceId, coordinate};
}