package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type MathModel interface {
	Init()
	Ask()
}

type UtilityModel interface {
	Init()
	Transcribe()
	Summarize()
}


func Question(model MathModel) gin.HandlerFunc {

	return func(ctx *gin.Context) {

		course := ctx.GetHeader("Course")
		brevity := ctx.GetHeader("Brevity")
		question_type := ctx.GetHeader("Type")
		var conversation map[string] interface{}

		if err := ctx.BindJSON(&conversation); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}

		outChannel := make(chan string)
		go func() {
			defer close(outChannel)
		}()





	}

}
