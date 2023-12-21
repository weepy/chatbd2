import { createGeoPolygon } from "$lib/utils.js"

export default async function get_threatened_species({ latitude, longitude, from_year, to_year, radius = 20 }) {


    const poly = createGeoPolygon(latitude, longitude, radius)

    const records = []

    let offset = 0

    while (true) {
        // https://api.gbif.org/v1/occurrence/search
        let url = `https://api.gbif.org/v1/occurrence/search?limit=300&offset=${offset}`

        url += `&geometry=${poly.wkt}`

        if (from_year) {
            url += `&year=${from_year},${to_year || 9999}`
        }
        else if (to_year) {
            url += `&year=${1},${to_year}`
        }


        url += "&iucn_red_list_category=EN&iucn_red_list_category=VU&iucn_red_list_category=NT"


        console.log(url)

        const res = await fetch(url)
        const json = await res.json()

        // if (json.count > 1000) {
        //     return JSON.stringify({ count: json.count, error: "too many to retrieve - try a smaller area" })
        // }

        console.log("fetching...", json)

        json.results.forEach(r => records.push(r))

        break
        // if (json.endOfRecords) {
        //     break
        // }

        // offset += json.results.length
    }

    // process //
    const species = {}
    records.forEach(r => {
        species[r.species] = (species[r.species] || 0) + 1
    })

    return JSON.stringify(species)
}