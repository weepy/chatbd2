import { shuffle } from "$lib/utils.js"

export default async function get_photos({ latin_name, count }) {


    const url = `https://www.gbif.org/api/occurrence/search?limit=${100}&mediaType=stillImage&q=${latin_name}`
    const res = await fetch(url)
    const json = await res.json()

    const urls = json.results.map(r => r.media[0].identifier).filter(x => x != null)

    return JSON.stringify(shuffle(urls).slice(0, count))

}