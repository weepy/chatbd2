const X_RAPIDAPI_KEY = "5b13a7001bmsh43edb5b99da32bep190d55jsn901ab037f6a6"

export default async function ({ location }) {

    console.log({ location })
    const baseURL = 'https://weatherapi-com.p.rapidapi.com/current.json';
    const params = `?q=${location}`;

    const options = {
        method: 'GET',
        url: baseURL + params,
        headers: {
            'X-RapidAPI-Key': X_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    // console.log("==>", options);

    try {
        const response = await fetch(baseURL + params, options);
        const data = await response.json();
        // console.log("-->", data)

        // let weather = data;
        // const currentTemp = format == "celsius" ? weather.current.temp_c : weather.current.temp_f;

        //console.log(currentTemp);
        //         const weatherForecast = `Location: ${weather.location.name} \
        //       Current Temperature: ${weather.current.temp_f} \
        // Condition: ${weather.current.condition.text}.\
        //       Low Today: ${weather.forecast.forecastday[0].day.mintemp_f} \
        //       High Today: ${weather.forecast.forecastday[0].day.maxtemp_f} `;
        return data //{ temperature: currentTemp, format };
    } catch (error) {
        console.error(error);
        return "No forecast found";
    }
}