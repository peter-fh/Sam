package api

import (
	"bytes"
	"io"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const INTRODUCTION_STRING = "Hello! I'm Sam, an AI chatbot powered by Chat-GPT. I use context specific to Concordia to provide better explanations. AI makes mistakes, so please double check any answers you are given."

func introWriter(outChannel chan string) {
	for _, word := range strings.Split(INTRODUCTION_STRING, " ") {
		outChannel <- word
		time.Sleep(time.Millisecond * 30)
	}
}

func Introduction(ctx *gin.Context) {
	outChannel := make(chan string)
	go introWriter(outChannel)
	ctx.Stream(func (w io.Writer) bool {
		output, ok := <- outChannel
		if !ok {
			return false
		}
		outputBytes := bytes.NewBufferString(output)
		ctx.Writer.Write(append(outputBytes.Bytes(), []byte(" ")...))
		return true
	})
}
