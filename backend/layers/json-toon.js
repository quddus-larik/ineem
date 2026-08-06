import { encode } from "@toon-format/toon";

export function TurnIntoTOON(JSON_CODE){
    if(!JSON_CODE){
        throw new Error("JSON is not Provided!");
    }

    const TOON_DATA = encode(JSON_CODE).toString();

    console.log("encode input type:", typeof JSON_CODE);
    console.log("encode input keys (if object):", typeof JSON_CODE === "object" ? Object.keys(JSON_CODE).slice(0, 10) : "N/A");
    console.log("encode output:", TOON_DATA);
    console.log("encode output type:", typeof TOON_DATA);

    return TOON_DATA;
}