package main

import (
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"sam/api"
)

func init() {
}


func main() {
	engine := gin.Default()
	engine.Use(static.Serve("/", static.LocalFile("../frontend/dist", true)))
	engine.Use(static.Serve("/font", static.LocalFile("../frontend/dist/proximanova.ttf", true)))
	engine.GET("/introduction", api.Introduction)
	engine.Run()
}
