import { TRON } from "@tron-format/tron";

export function TurnIntoTRON(JSON_CODE){
    if(!JSON_CODE){
        throw new Error("JSON is not Provided!");
    }

    const TRON_DATA = TRON.stringify(JSON_CODE)

    return TRON_DATA;
}