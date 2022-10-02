import { assign, createMachine, interpret } from "xstate";

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
/** @xstate-layout N4IgpgJg5mDOIC5QGECGAnCAFANqgngLKoDGAFgJYB2YATAHQCCA7qhQC7VS4EDEADnnxpMiUPwD2sDhQlUxIAB6IAjADYALPQ0B2NQFYAzAA41AThUAGHbVsAaEPlUbL9M4bVqd+ryuOHLQ0MAX2CHEWwhYnJqOnoANVQcCghUTiooCN4FSWlOOQVlBA01Bg1aFVozM311Mw19MwcnBH0GQ1qDK0sVQz8q0PCMSIJoyhoGLHQJEjhpDKycqRkCpCVEY1odeiqqnXLLKpdaZudXd09vX39AkMGQKgkIOAUIniJScbiWNnTuISWeVk8jWRRUGjM2jMOl6hloXksNUMpwQtmM9GM3S8tAa8Ksxnubyin1iDESyVSfwigJWINARXhkMsEJsNhK-mRjg2WjUQUs5n0RnBtA8hOG7zGpPoUxmcy41LWuVphUQBi0MMsbR0-JMjSaXIQKm1bkq+h0xg0HP0xn2YswEpJEyYrEwXAA6tQafk6etDYcVPQdIZ9hp1Cpw9Z9S0VDUMWZeT1eiozT07SMPjEJl7gSrDbR9FCYUF4dqkSoUQBaY3Wln80yIipmUKhIA */
const machine = createMachine({
    context: { cardsPlayed: [] as Card[] },
    predictableActionArguments: true,
    entry: () => console.log("entered main machine"),
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
            entry: addPlayToContext,
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

const service = interpret(machine);
service.start();
const exampleCardPlayEvent = { type: "playCard", card: { number: 7 } };
service.send(exampleCardPlayEvent);
