

export function createGeoPolygon(latitude, longitude, radiusInMiles, numVertices = 8) {
    const earthRadiusInMiles = 3958.8;
    let polygonCoordinates = [];

    for (let i = 0; i < numVertices; i++) {
        const angle = (Math.PI * 2 * i) / numVertices;
        const dx = radiusInMiles * Math.cos(angle);
        const dy = radiusInMiles * Math.sin(angle);

        const newLatitude = latitude + (dy / earthRadiusInMiles) * (180 / Math.PI);
        const newLongitude = longitude + (dx / (earthRadiusInMiles * Math.cos((Math.PI * newLatitude) / 180))) * (180 / Math.PI);

        polygonCoordinates.push([newLatitude, newLongitude]);
    }

    // Close the polygon by making the first and last points the same
    polygonCoordinates.push(polygonCoordinates[0]);

    // Create the WKT string
    const wktCoordinates = polygonCoordinates.map(coord => `${coord[1]} ${coord[0]}`).join(", ");
    const wktPolygon = `POLYGON((${wktCoordinates}))`;

    return { coordinates: polygonCoordinates, wkt: wktPolygon };
}

export function markdownToHtmlImages(text) {
    // Use regular expression to find Markdown image syntax ![alt](src)
    // return text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />');
    return text.replace(/\[([^[\]]+)\]\(([^()]+)\)/g, '<img class="map" alt="$1" src="$2" />');

}

export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}