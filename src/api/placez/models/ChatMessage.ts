export default interface ChatMessage {
  id: number;
  chatSessionId: string;
  senderId: string;
  senderUserId: string;
  senderDisplayName: string;
  message: string;
  createdUtcDateTime: Date;
}
