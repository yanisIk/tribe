export const AudioCleanerResponseInterceptor = {
    process(handlerInput) {
      const response = handlerInput.responseBuilder.getResponse();
      if (response && response.outputSpeech && response.outputSpeech.ssml) {
        // First off - count the audio tags.  If more than 5, remove the last one
        let audioTags = (response.outputSpeech.ssml.match(/<audio/g) || []).length;
        let index;
        let end;
  
        while (audioTags > 5) {
          audioTags--;
          index = response.outputSpeech.ssml.lastIndexOf('<audio');
          end = response.outputSpeech.ssml.indexOf('>', index);
          response.outputSpeech.ssml =
            response.outputSpeech.ssml.substring(0, index)
            + response.outputSpeech.ssml.substring(end + 1);
        }
      }
      return Promise.resolve();
    },
  };