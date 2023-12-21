import { get_genus } from "./get_taxon_key.js"
export default async function distribution_map({ name, tile_key = "0/0/0" }) {


    const genus = await get_genus({ name })



    // https://api.gbif.org/v2/map/occurrence/density/0/0/0@1x.png?style=purpleYellow.point

    return JSON.stringify(`https://api.gbif.org/v2/map/occurrence/density/${tile_key}@2x.png?taxonKey=` + genus)
}