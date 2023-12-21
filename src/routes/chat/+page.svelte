<script lang="ts">
  import { useChat } from "ai/svelte";
  import type { FunctionCallHandler } from "ai";
  import { nanoid } from "ai";
  import { markdownToHtmlImages } from "$lib/utils.js";

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === "eval_code_in_browser") {
      if (functionCall.arguments) {
        // Parsing here does not always work since it seems that some characters in generated code aren't escaped properly.
        const parsedFunctionCallArguments: { code: string } = JSON.parse(
          functionCall.arguments
        );
        // WARNING: Do NOT do this in real-world applications!
        eval(parsedFunctionCallArguments.code);
        const functionResponse = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: "eval_code_in_browser",
              role: "function" as const,
              content: parsedFunctionCallArguments.code,
            },
          ],
        };
        return functionResponse;
      }
    }
  };

  const { messages, input, handleSubmit } = useChat({
    api: "/api/chat-with-functions",
    experimental_onFunctionCall: functionCallHandler,
  });

  function replaceAllUrlsWithImgTag(text) {
    return text.replace(
      /(https?:\/\/[^\s\)]+)(?<!\))/g,
      '<img class="map" src="$1" />'
    );
  }
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <h1>Chat BD</h1>

  <p>
    This is a demo of the Chat BD. It provides a chat interface to structured
    data from GBIF.
  </p>
  <pre style="font-size:0.8rem">
Example prompts
&bull; what is the weather in boston right now ?
&bull; how many ducks were seen near oxford last year ? (10 mile radius)
&bull; is this more than the previous year ?
&bull; were the more ducks seen in bristol last year ? (10 mile radius)
&bull; can you show me a distribution map of a dragonfly
&bull; can you show me a photo of a duck
&bull; can you show me 3 photos of a dragonfly
&bull; were there any threatened species seen in edinburgh within a 10 mile radius last year ?
&bull; for each of these can you tell me a bit more about them

  </pre>
  <!-- <p>
    The available functions are: <code>get_current_weather</code>,
    <code>get_current_time</code>
    and <code>eval_code_in_browser</code>.
  </p> -->

  <ul>
    {#each $messages as message}
      <li>
        <!-- <pre> -->
        <b>{message.role}</b>: {@html markdownToHtmlImages(message.content)}
        <!-- </pre> -->
      </li>
    {/each}
  </ul>
  <form on:submit={handleSubmit}>
    <input bind:value={$input} />
    <button type="submit">Send</button>
  </form>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }

  input {
    width: 40vw;
    padding: 0.5rem;
  }
</style>
