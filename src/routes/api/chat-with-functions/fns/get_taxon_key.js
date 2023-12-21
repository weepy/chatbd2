export default async function get_taxon_key({ name }) {

    const res = await fetch(`https://api.gbif.org/v1/species?name=${name}&limit=1`)
    const json = await res.json()

    let ret = json.results[0]?.key

    if (!ret) {
        const res = await fetch(`https://api.gbif.org/v1/species/search?q=${name}&limit=1`)
        const json = await res.json()
        ret = json.results[0]?.key
    }

    // storeTaxonKey(latin_name, ret)

    return String(ret)
}

export async function get_genus({ name }) {

    // const res = await fetch(`https://api.gbif.org/v1/species?name=${name}&limit=1`)
    // const json = await res.json()

    // let ret = json.results[0]?.genusKey

    // if (!ret) {
    const res = await fetch(`https://api.gbif.org/v1/occurrence/search?q=${name}&limit=1`)
    const json = await res.json()
    const ret = json.results[0]?.genusKey
    // }

    // storeTaxonKey(latin_name, ret)

    return String(ret)
}