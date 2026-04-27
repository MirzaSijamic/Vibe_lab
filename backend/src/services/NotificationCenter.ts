export class NotificationCenter {
  private readonly messagesByStudentId = new Map<string, string[]>();

  public addMessage(studentId: string, message: string): void {
    const existing = this.messagesByStudentId.get(studentId) ?? [];
    existing.push(message);
    this.messagesByStudentId.set(studentId, existing);
  }

  public getMessages(studentId: string): string[] {
    return [...(this.messagesByStudentId.get(studentId) ?? [])];
  }
}
