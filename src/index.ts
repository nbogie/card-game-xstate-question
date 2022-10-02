import { createMachine, assign, interpret } from "xstate";

//diagram here:
//https://stately.ai/registry/editor/share/924d97fb-2bed-4892-a731-e5b6b5c3b49d
interface CardGameContext {
    cardsPlayed: Card[];
}

interface Card {
    number: number;
}

type PlayCardEvent = {
    type: "playCard";
    card: Card;
};

function isPlayValid(ctxt: any, event: any, meta: any) {
    console.log({
        msg: "isPlayValid",
        ctxt,
        event,
        meta: meta.state.event,
    });
    //QUESTION: is it ok to get the event this way?
    //I think "always" transition guards get no event.
    return meta.state.event.card.number <= 3;
}

const addCardToContext = assign({
    cardsPlayed: (ctx: CardGameContext, event: PlayCardEvent, meta) => {
        console.log("in addCardToContext: ", { ctx, event, meta });

        //Question: how can we get provide access to the originating event from before an always transition?
        //Should we manually propagate it from the preceding state, ValidatingCard?
        // throw new Error("no card available to addCardToContext action");
        if (!meta || !meta.state) {
            throw new Error(
                "no meta  or else no meta.state in addCardToContext"
            );
        }
        const cardToAdd: Card = meta.state.event.card; //this won't work, currently
        console.log("I HAD IT", cardToAdd);
        // Alternative for testing - just add a random card.
        // const cardToAdd: Card = { number: Math.round(Math.random() * 10) };
        return [...ctx.cardsPlayed, cardToAdd];
    },
});

function isEndOfRound(ctxt: CardGameContext, event: any) {
    return ctxt.cardsPlayed.length >= 3;
}

export const cardGameMachine = createMachine<CardGameContext, PlayCardEvent>({
    context: { cardsPlayed: [] as Card[] },
    predictableActionArguments: false, //all hinges on this
    id: "CardPlayMachine2",
    initial: "AwaitingPlay",
    states: {
        AwaitingPlay: {
            on: {
                playCard: {
                    target: "ValidatingCard",
                },
            },
        },
        ValidatingCard: {
            always: [
                {
                    cond: isPlayValid,
                    target: "ProcessingCard",
                },
                {
                    target: "AwaitingPlay",
                },
            ],
        },
        ProcessingCard: {
            entry: addCardToContext,
            always: [
                {
                    cond: isEndOfRound,
                    target: "AwardingWin",
                },
                {
                    target: "AwaitingPlay",
                },
            ],
        },
        AwardingWin: {
            type: "final",
        },
    },
});

const service = interpret(cardGameMachine);
service.start();
const exampleCardPlayEvent: PlayCardEvent = {
    type: "playCard",
    card: { number: 2 },
};
service.send(exampleCardPlayEvent);
console.log(service.getSnapshot().context);
