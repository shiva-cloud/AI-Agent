# Conversation context contract (context-1)

`POST /v1/answers` accepts an optional `previousContext` so a short follow-up such as "Is it free?" can be answered in the light of the previous question. Implementation: `src/conversation-resolver.js`. Tests: `test/conversation-resolver.test.js` and the HTTP case in `test/new-tools-endpoints.test.js`.

## Request

```json
{
  "question": "What documents do I need to bring?",
  "previousContext": { "topic": "sin", "city": "Toronto", "country": "CA", "at": "2026-10-31T11:59:00Z" }
}
```

- `topic` must be one of the knowledge topics (`sin`, `health`, `housing`, …); `intents[0]` is accepted as a fallback.
- `city` must be a pilot city. `country` must be a supported destination; a city alone implies Canada.
- `at` is required: the time the previous answer was received.
- Any other field, including the previous question text, is dropped and never echoed or logged.

## Rules

1. **Freshness.** Context older than 30 minutes, more than two minutes in the future, or without `at` is ignored.
2. **Only follow-ups.** A question that is not a recognized follow-up inherits nothing, not even the place.
3. **The current turn wins.** A city or country selected in the request, or any registry place named in the question, is never replaced. That includes provinces and places the pilot does not cover: "What about Ottawa?" keeps the topic but reaches the geography gate instead of being answered for Toronto. A city is only inherited together with Canada.
4. **Topic only when missing.** The previous topic is added only if the parser finds no topic in the follow-up.
5. **No silent defaults.** When nothing usable remains, nothing is assumed; in particular the resolver never defaults to Canada.
6. **Reported, unconfirmed.** Every inherited value is returned as an assumption. The client should show `context.message` and let the user correct it; a correction is a new request with an explicit topic or place.

## Response

When `previousContext` was sent, the answer includes:

```json
"context": {
  "version": "context-1",
  "status": "applied",
  "reason": null,
  "assumptions": [{ "field": "topic", "value": "sin", "label": "Social Insurance Number", "source": "previous_turn" }],
  "requiresConfirmation": true,
  "message": "Assumed from your previous question: topic Social Insurance Number. If this is wrong, ask again and name the topic and place.",
  "expiresAt": "2026-10-31T12:29:00.000Z"
}
```

`status` is `applied`, `not_applied` (`self_contained`, `question_has_own_context`) or `ignored` (`invalid_question`, `invalid_context`, `missing_timestamp`, `timestamp_in_future`, `expired`, `no_usable_fields`). Without `previousContext`, the field is absent.

## Privacy

The server stores no conversation state. Context lives only in the client and in each request. Extra fields such as a previous question are discarded before answering; the logged answer result can include the `context` report (topic, place and expiry), never the previous question.

## Limits

- Follow-up detection is a small English pattern list. It covers fixed follow-up phrases, short questions with a pronoun ("Is it free?"), and short elliptical questions of up to eight words that start with "and", "also", "what about", "how about", "same for/in", "for my/our/a/the" or "in <pilot place>" ("And for my wife?", "What about Vancouver?"). Other phrasings are treated as self-contained.
- An inherited topic is applied to the follow-up as a whole. "And for my wife?" asks the same topic again; the parser does not model who the question is for.
- One previous turn only; there is no longer history, entity tracking or reference to earlier answers' facts.
- The public UI does not yet send `previousContext` or show the assumption message.
- Requiring `at` is a tightening: earlier clients that sent context without it now get `ignored / missing_timestamp`.
