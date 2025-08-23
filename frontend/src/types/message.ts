
export type Message = {
  role: string
  content: string
}

export function newMessage(content: string, role: string) {
  return {
    role: role,
    content: content
  }
}

export function newMessageWithImage(content: string, image: string) {
  return {
        "role": "user",
        "content": [
            {"type": "input_text", "text": content},
            {
                "type": "input_image",
                "image_url": image,
            },
        ],
    }
}

export function getMessageContent(message: Message) {
  return message.content
}

