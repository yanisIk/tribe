import { HandlerInput } from "ask-sdk";
import { interfaces, Response } from "ask-sdk-model";
import * as request from "request-promise";

export const isGeolocationSupported = (handlerInput: HandlerInput): boolean => {
    try {
        const isGeolocationSupported = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Geolocation;
        if ( isGeolocationSupported ) {   //  does the device support location based features? 
                var geoObject = handlerInput.context.Geolocation;
                if ( ! geoObject || ! geoObject.coordinate ) {
                    return false;
                } else {
                    return true;
                }
        }
    } catch(err) {
        return false;
    }
}

export const isGeolocationAuthorized = (handlerInput: HandlerInput): boolean => {
    const { requestEnvelope: { context: { System: { user } } } } = handlerInput;
    return user.permissions &&
            user.permissions.scopes &&
            user.permissions.scopes['alexa::devices:all:geolocation:read'] &&
            user.permissions.scopes['alexa::devices:all:geolocation:read'].status === "GRANTED";
}

export const isCountryPostalCodenAuthorized = (handlerInput: HandlerInput): boolean => {
    const { requestEnvelope: { context: { System: { user } } } } = handlerInput;
    return user.permissions &&
            user.permissions.scopes &&
            user.permissions.scopes['read::alexa:device:all:address:country_and_postal_code'] &&
            user.permissions.scopes['read::alexa:device:all:address:country_and_postal_code'].status === "GRANTED";
}

export const askForGeoPermissionResponse = (handlerInput: HandlerInput, speechText: string): Response => {
    return handlerInput.responseBuilder
            .speak(speechText)
            .withAskForPermissionsConsentCard(['alexa::devices:all:geolocation:read'])
            .getResponse();
}

export const askForCountryPostalCodePermissionResponse = (handlerInput: HandlerInput, speechText: string): Response => {
    return handlerInput.responseBuilder
            .speak(speechText)
            .withAskForPermissionsConsentCard(['read::alexa:device:all:address:country_and_postal_code'])
            .getResponse();
}

export const getUserInfos = (handlerInput: HandlerInput): {userId: string, deviceId: string, coordinate: interfaces.geolocation.Coordinate} => {
    const { userId } = handlerInput.requestEnvelope.context.System.user;
    const { deviceId } = handlerInput.requestEnvelope.context.System.device ? handlerInput.requestEnvelope.context.System.device : {deviceId: undefined};
    const { coordinate } = handlerInput.requestEnvelope.context.Geolocation ? handlerInput.requestEnvelope.context.Geolocation : {coordinate: undefined}

    return {userId, deviceId, coordinate};
}

export async function getUserCountryAndPostalCode(handlerInput: HandlerInput): Promise<{countryCode: string, postalCode: string, lat: number, lon: number, city: string}> {

    const { deviceId } = getUserInfos(handlerInput); 
    
    const {countryCode, postalCode} = await request.get({
        url: `${handlerInput.requestEnvelope.context.System.apiEndpoint}/v1/devices/${deviceId}/settings/address/countryAndPostalCode`,
        headers: {
            'Authorization': `Bearer ${handlerInput.requestEnvelope.context.System.apiAccessToken}`
        },
        json: true
    });

    const locationDetails = await request.get({
        url: `https://us1.locationiq.com/v1/search.php?key=712e088a5520d8&countrycodes=${countryCode}&postalcode=${postalCode}&addressdetails=1&format=json`,
        json: true
    });

    return {countryCode, postalCode, lat: locationDetails[0].lat, lon: locationDetails[0].lon, city: locationDetails[0].address.city || locationDetails[0].address.county};
}