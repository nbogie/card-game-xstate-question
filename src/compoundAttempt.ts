import { createMachine, interpret } from "xstate";

function isPlayValid(ctxt: any, event: any) {
    console.log({ msg: "isPlayValid", ctxt, event });
    return event.card.number > 5; //Math.random() > 0.5;
}

function isEndOfRound(ctxt: any, event: any) {
    return Math.random() > 0.5;
}
function addPlayToContext(ctxt: any, event: any) {
    console.log({ msg: "adding play to ctxt", ctxt, event });
}
interface Card {
    number: number;
}
const machine = createMachine({
    context: { cardsPlayed: [] as Card[] },
    predictableActionArguments: true,
    entry: () => console.log("entered main machine"),
    id: "CardPlayMachine3",
    initial: "AwaitingPlay",
    states: {
        AwaitingPlay: {
            on: {
                playCard: {
                    target: "ProcessingCard",
                },
            },
        },
        ProcessingCard: {
            initial: "ValidatingCard",
            states: {
                ValidatingCard: {
                    always: [
                        {
                            cond: "playIsValid",
                            target: "IncorporatingCard",
                        },
                        {
                            target: "#CardPlayMachine3.AwaitingPlay",
                        },
                    ],
                },
                IncorporatingCard: {
                    entry: "addCardToContext",
                    always: [
                        {
                            cond: "endOfRound",
                            target: "#CardPlayMachine3.AwardingWin",
                        },
                        {
                            target: "#CardPlayMachine3.AwaitingPlay",
                        },
                    ],
                },
            },
        },
        AwardingWin: {
            type: "final",
        },
    },
});

const service = interpret(machine);
service.start();
const exampleCardPlayEvent = { type: "playCard", card: { number: 7 } };
service.send(exampleCardPlayEvent);
