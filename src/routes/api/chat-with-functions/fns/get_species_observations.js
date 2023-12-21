import { createGeoPolygon } from "$lib/utils.js"

export default async function get_species_observations({ name, latitude, longitude, from_year, to_year, radius = 20 }) {

    const poly = createGeoPolygon(latitude, longitude, radius)

    // let url = `https://www.gbif.org/api/occurrence/search?q=${name}`

    let url = `https://api.gbif.org/v1/occurrence/search?q=${name}`

    url += `&geometry=${poly.wkt}`

    if (from_year) {
        url += `&year=${from_year},${to_year || 9999}`
    }
    else if (to_year) {
        url += `&year=${1},${to_year}`
    }
    // if (threatened) {
    //     url += "&iucn_red_list_category=EN&iucn_red_list_category=VU&iucn_red_list_category=NT"
    // }

    console.log(url)

    const res = await fetch(url)
    const json = await res.json()

    const count = json.count

    return JSON.stringify(count)
}