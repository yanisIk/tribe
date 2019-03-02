import { Message, IMessage } from "../models/Message";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";

export async function getMessagesAround(long: number, lat: number, radiusInMeters: number = 5000, limit = 5): Promise<IMessage[]> {
    await checkAndConnectMongoose();
    return await Message.find({
        locationPoint: {
            $nearSphere: {
                $geometry: {
                   type: "Point" ,
                   coordinates: [ long , lat ]
                },
                $maxDistance: radiusInMeters,
                // $minDistance: 1
              }
        }
    }).sort({createdAt: 'desc'}).limit(limit).lean().exec();
}

export async function getMessagesByCity(city: string, limit = 10): Promise<IMessage[]> {
    await checkAndConnectMongoose();
    return await Message.find({
        "locationDetails.city": city
    }).sort({createdAt: 'desc'}).limit(limit).lean().exec();
}

export async function insertMessage(message: IMessage): Promise<IMessage> {
    await checkAndConnectMongoose();
    return await Message.create(message);
}  