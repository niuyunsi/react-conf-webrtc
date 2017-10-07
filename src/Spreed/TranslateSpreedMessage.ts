import { SpreedResponse } from './SpreedResponse';
import {
    IConfIncomingMessage,
    IConfIncomingMessageOffer,
    IConfIncomingMessageAnswer,
    IConfIncomingMessageCandidate,
    IConfMessageAddPeer,
    IConfMessageRemovePeer,
    IConfMessageSelf,
    IConfMessageNewUser
} from '../data/ConferenceMessage'
import {
    SpreedMessageOffer,
    SpreedMessageAnswer,
    SpreedMessageCandidate,
    SpreedMessageJoined,
    SpreedMessageLeft,
    SpreedMessageWelcome,
    SpreedMessageSelf,
    SpreedMessageConference,
} from './SpreedMessage';

// NOTE(andrews): TranslateSpreedMessage delegates the work of translating the message
// to individual functions based on the message type. Not all message types need to be translated
// into an IConfIncomingMessage. In such cases, this function will return undefined.
// Note that some spreed messages may translate to an array of Conference messages.
export function TranslateSpreedMessage(message: SpreedResponse): IConfIncomingMessage[] | IConfIncomingMessage | undefined {
    switch (message.Data.Type) {
        case 'Offer':
            return translateOfferMessage(message.Data, message)
        case 'Answer':
            return translateAnswerMessage(message.Data, message);
        case 'Candidate':
            return translateCandidateMessage(message.Data, message);
        case 'Joined':
            return translateJoinedMessage(message.Data, message);
        case 'Left':
            return translateLeftMessage(message.Data, message);
        case 'Welcome':
            return translateWelcomeMessage(message.Data, message);
        case 'Self':
            return translateSelfMessage(message.Data, message);
        case 'Conference':
            return translateConferenceMessage(message.Data, message);
        default:
            return undefined;
    }
}

function translateWelcomeMessage(data: SpreedMessageWelcome, message: SpreedResponse): IConfMessageNewUser[] | undefined {
    return data.Users.reduce((result, user) => {
        result.push(
            {
                type: 'AddPeer',
                Id: user.Id,
            }
        )
        if (user.Status) {
            result.push(
                {
                    type: 'Profile',
                    Id: user.Id,
                    avatar: user.Status.BuddyPicture,
                    name: user.Status.DisplayName
                }
            )
        }
        return result;
    }, [] as IConfMessageNewUser[])
}

function translateConferenceMessage(data: SpreedMessageConference, message: SpreedResponse): IConfMessageAddPeer[] | undefined {
    return data.Conference.map<IConfMessageAddPeer>(Id => {
        return {
            type: 'AddPeer',
            Id,
        }
    })
}

function translateSelfMessage(data: SpreedMessageSelf, message: SpreedResponse): IConfMessageSelf | undefined {
    return {
        type: 'Self',
        Id: data.Id,
    }
}

function translateLeftMessage(data: SpreedMessageLeft, message: SpreedResponse): IConfMessageRemovePeer | undefined {
    return {
        type: 'RemovePeer',
        Id: data.Id,
    }
}

function translateJoinedMessage(data: SpreedMessageJoined, message: SpreedResponse): IConfMessageNewUser[] | undefined {
    let translatedMessage = [] as IConfMessageNewUser[]
    translatedMessage.push(
        {
            type: 'AddPeer',
            Id: data.Id,
        }
    )
    if (data.Status) {
        translatedMessage.push(
            {
                type: 'Profile',
                Id: data.Id,
                avatar: data.Status.BuddyPicture,
                name: data.Status.DisplayName
            }
        )
    }

    return translatedMessage
}

function translateCandidateMessage(data: SpreedMessageCandidate, message: SpreedResponse): IConfIncomingMessageCandidate | undefined {
    if (!message.From) {
        console.warn('translateCandidateMessage(): Failed to translate "Candidate" message. "From" member not found.')
        return;
    }
    return {
        type: 'Candidate',
        candidate: data.Candidate,
        from: message.From,
    }
}

function translateAnswerMessage(data: SpreedMessageAnswer, message: SpreedResponse): IConfIncomingMessageAnswer | undefined {
    if (!message.From) {
        console.warn('translateAnswerMessage(): Failed to translate "Answer" message. "From" member not found.')
        return;
    }
    return {
        type: 'Answer',
        sessionDescription: data.Answer,
        from: message.From,
    }
}

function translateOfferMessage(data: SpreedMessageOffer, message: SpreedResponse): IConfIncomingMessageOffer | undefined {
    if (!message.From) {
        console.warn('translateOfferMessage(): Failed to translate "Offer" message. "From" member not found.')
        return;
    }
    return {
        type: 'Offer',
        sessionDescription: data.Offer,
        from: message.From,
    }
}
