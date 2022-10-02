import { assign, createMachine } from "xstate";

export interface SimpleDataFetchMachineContext {
    data?: Data;
    errorMessage?: string;
}

interface Variables {
    id: string;
}

interface Data {
    name: string;
}

export type SimpleDataFetchMachineEvent =
    | {
          type: "FETCH";
          variables: Variables;
      }
    | {
          type: "RECEIVE_DATA";
          data: Data;
      }
    | {
          type: "CANCEL";
      };

const simpleDataFetchMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5SwJYFsAOAbMARAhgC74BiYhAxgBYB0KEOAxCQKIAqAwgBKKgYD2qQin4A7XiAAeiAEwBWGgE4AjAA4AbAHYAzDJmqZ2gCza5RgDQgAnonWqamo+rVGN2jU-UBfL5dSYcAmIySloAM3JqFFEoRjAAJ3j+eJpsIjDktBp-bDwiUkjwwuioBGiAN34KIhFRAG0ABgBdCQEhWolpBG1dGi0ZBu1FTWG5ZXHLGwQ1e3llIzlFU09VRVUfP3RcoILQmgjQkuZ2blbBFGExTsRlBpkaBuVtO9U5eRl1E01J2WUFQbc6mc2mUzlU618IBygXyIWo+2KMUYHAAggA5DgsAAyZ3aVyQUkQugaNHmRjWMkUC3BmnUP264xoPU0ehkrieyk0cjkGyhWxhwUKCMOSIASixMQBJABqLAA+rgUWwUbiLh0CV1dAowfoQSZ1A1FhZrET1IoHMMtEZNKsnjafJDRPwIHAJNC8oK9vQcDQnSxEslVZdxBrbCCHHpTIo5J8gSp6WaaGZVuoeooZE9Fopee6dnDaN6wDQEkl4pAg+rQF1U+oI4ZFjHPPGTdNwTRXDGGncPqsudoc-yPbt4YWK-iq7YGpo61HG3HlPSALT3IwZxRaJZGLeaTRTgcBIf54VRGJjkMThDW+k9h4NVS7mNcu6LffbWGFM-XaZKNRaXT6QwTDMGQl0cJl0w0V4jEeLs3gdLwgA */
    createMachine<SimpleDataFetchMachineContext, SimpleDataFetchMachineEvent>(
        {
            context: {},
            predictableActionArguments: true,
            id: "simpleDataFetch",
            initial: "idle",
            states: {
                idle: {
                    initial: "noError",
                    states: {
                        noError: {
                            entry: "clearErrorMessage",
                        },
                        errored: {},
                    },
                    on: {
                        FETCH: {
                            target: "fetching",
                        },
                    },
                },
                fetching: {
                    invoke: {
                        src: "fetchData",
                        onError: [
                            {
                                actions: "assignErrorToContext",
                                target: "#simpleDataFetch.idle.errored",
                            },
                        ],
                    },
                    on: {
                        FETCH: {
                            target: "fetching",
                            internal: false,
                        },
                        CANCEL: {
                            target: "idle",
                        },
                        RECEIVE_DATA: {
                            actions: "assignDataToContext",
                            target: "idle",
                        },
                    },
                },
            },
        },
        {
            services: {
                fetchData: () => () => {},
            },
            actions: {
                assignDataToContext: assign((context, event) => {
                    if (event.type !== "RECEIVE_DATA") return {};
                    return {
                        data: event.data,
                    };
                }),

                assignErrorToContext: assign((context, event: any) => {
                    return {
                        errorMessage:
                            event.data?.message || "An unknown error occurred",
                    };
                }),
            },
        }
    );

export default simpleDataFetchMachine;
