export type Message = {
  id: string
  name: string
  mail: string[]
  senderId: string
  avatar: string
  createdAt: string
  content: string
  attachment: {
    file: string
    size: string
    type: string
  }[]
}

export type Mail = {
  id: string
  name: string
  label: string
  group: string
  flagged: boolean
  starred: boolean
  sender: string
  avatar: string
  subject: string
  mail: string[]
  messages: Message[]
  checked: boolean
}