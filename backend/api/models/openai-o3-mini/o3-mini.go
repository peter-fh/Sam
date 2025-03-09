package openaio3mini

import (
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type o3_mini struct {
	client *openai.Client
}

func (model o3_mini) Init(api_key string) {
	model.client = openai.NewClient(
		option.WithAPIKey(api_key),
	)
}

func (model o3_mini) Ask(conversation []openai.ChatCompletionMessageParamUnion, prompt string) {

}


