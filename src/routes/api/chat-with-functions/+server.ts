import OpenAI from 'openai';
import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai';
import { env } from '$env/dynamic/private';
import type { ChatCompletionCreateParams } from 'openai/resources/chat';

import get_current_weather from "./fns/get_current_weather.js"
import get_historical_weather from './fns/get_historical_weather.js'
import get_taxon_key from './fns/get_taxon_key.js'
import get_species_observations from './fns/get_species_observations.js'
import get_distribution_map from "./fns/get_distribution_map.js"
import get_threatened_species from "./fns/get_threatened_species.js"
import get_photos from "./fns/get_photos.js"

const fns = {
  get_current_weather,
  get_historical_weather,
  get_taxon_key,
  get_species_observations,
  get_distribution_map,
  get_threatened_species,
  get_photos
}


const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
});

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: 'get_current_weather',
    description: 'Get the current weather',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        format: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description:
            'The temperature unit to use. Infer this from the users location.',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'get_historical_weather',
    description: 'Get the weather on a specific date',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        date: {
          type: 'string',
          description:
            'The date in the format YYYY-MM-DD',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'get_taxon_key',
    description: 'Get the taxon key for species name',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the species - latin or common',
        }
      },
      required: ['name'],
    },
  },
  {
    name: "get_species_observations",
    description: "Get the number of observations of a particlar animal/plant/species in an area",
    parameters: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "The name of the species or organism",
            },
            latitude: {
                type: "number",
                description: "The latitude of the center of the area of interest",
            },
            longitude: {
                type: "number",
                description: "The longitude of the center of the area of interest",
            },
            radius: {
                type: "number",
                description: "The radius of the area of interest in miles. The default is 20",
            },
            from_year: {
                type: "number",
                description: "4 digit year of earliest observation to count",
            },
            to_year: {
                type: "number",
                description: "4 digit year of latest observation to count",
            },
            // threatened: {
            //     type: "boolean",
            //     description: "whether to filter for only threatened species "
            // }
        },
        required: ["latitude", "longitude", "name"],
    }
  },
  {
    name: "get_distribution_map",
    description: "Get the url of a distribution map for a species from its name",
    parameters: {
        type: "object",
        properties: {
          name: {
                type: "string",
                description: "The name of species",
            }
        },
        required: ["name"],
    }
  },


  {
    name: "get_photos",
    description: "Get a list of urls of photo observations for a particular species or taxon",
    parameters: {
        type: "object",
        properties: {
            latin_name: {
                type: "string",
                description: "The latin name / latin name",
            },
            count: {
                type: "number",
                description: "The number of image urls to retrieve",
            }
        },
        required: ["latin_name", "count"],
    }
},

  {
    name: "get_threatened_species",
    description: "Get the names of threatened species or taxa that were oberved in an area of interest along with the number of times it was observed. If there was more than 10000 observations it will only return the number of obervations.",
    parameters: {
        type: "object",
        properties: {
            latitude: {
                type: "number",
                description: "The latitude of the center of the area of interest",
            },
            longitude: {
                type: "number",
                description: "The longitude of the center of the area of interest",
            },
            radius: {
                type: "number",
                description: "The radius of the area of interest in miles. The default is 20 miles",
            },

            from_year: {
                type: "number",
                description: "4 digit year of earliest observation to count",
            },
            to_year: {
                type: "number",
                description: "4 digit year of latest observation to count",
            },

        },
        required: ["latitude", "longitude"],
    }
},

  
]

  // {
  //   name: 'eval_code_in_browser',
  //   description: 'Execute javascript code in the browser with eval().',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       code: {
  //         type: 'string',
  //         description: `Javascript code that will be directly executed via eval(). Do not use backticks in your response.
  //          DO NOT include any newlines in your response, and be sure to provide only valid JSON when providing the arguments object.
  //          The output of the eval() will be returned directly by the function.`,
  //       },
  //     },
  //     required: ['code'],
  //   },
  // },
// ];

export async function POST({ request }) {
  const { messages } = await request.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    stream: true,
    messages,
    functions,
  });

  const data = new experimental_StreamData();
  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      // let newMessages = []

      const fn = fns[name]

      const data = await fn(args)
      const newMessages = createFunctionCallMessages(data);

      // if (name === 'get_current_weather') {
        
        

       
      // }
      // else if(name === 'get_historical_weather'){
      //   const weatherData = await get_historical_weather(args)
      //   newMessages = createFunctionCallMessages(weatherData);
      // }
      // else if(name = 'get_taxon_key') {

      // }


      return openai.chat.completions.create({
        messages: [...messages, ...newMessages],
        stream: true,
        model: 'gpt-3.5-turbo-0613',
      });
    },
    onCompletion(completion) {
      console.log('completion', completion);
    },
    onFinal(completion) {
      data.close();
    },
    experimental_streamData: true,
  });

  data.append({
    text: 'Hello, how are you?',
  });

  return new StreamingTextResponse(stream, {}, data);
}
