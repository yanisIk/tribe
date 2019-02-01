import { Message, IMessage } from "../models/Message";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";

export async function getMessagesAround(long: number, lat: number, radius: number, limit = 10): Promise<IMessage[]> {
    await checkAndConnectMongoose();
    return await Message.find({
        locationPoint: {
            $near: {
                $geometry: {
                   type: "Point" ,
                   coordinates: [ long , lat ]
                },
                $maxDistance: radius,
                $minDistance: 0
              }
        }
    }).limit(limit).lean();
}

export async function getMessagesByCity(city: string, limit = 10): Promise<IMessage[]> {
    await checkAndConnectMongoose();
    return await Message.find({
        "locationDetails.city": city
    }).limit(limit).lean();
}

export async function insertMessage(message: IMessage): Promise<IMessage> {
    await checkAndConnectMongoose();
    return await Message.create(message);
}  