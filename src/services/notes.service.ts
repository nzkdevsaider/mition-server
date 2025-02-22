import { prisma } from "../db/prisma/prisma";
import type { Note } from "../types/note";

export class NotesService {
  async createNote(content: string, groupId?: number): Promise<Note> {
    return await prisma.note.create({
      data: {
        content,
        groupId,
      },
      include: {
        group: true,
      },
    });
  }

  async getNotes(): Promise<Note[]> {
    return await prisma.note.findMany({
      include: {
        group: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getNote(id: number): Promise<Note | null> {
    return await prisma.note.findUnique({
      where: { id },
      include: {
        group: true,
      },
    });
  }

  async updateNote(id: number, content: string): Promise<Note> {
    return await prisma.note.update({
      where: { id },
      data: { content },
      include: {
        group: true,
      },
    });
  }

  async deleteNote(id: number): Promise<Note> {
    return await prisma.note.delete({
      where: { id },
    });
  }

  async updateNoteGroup(id: number, groupId: number | null): Promise<Note> {
    return await prisma.note.update({
      where: { id },
      data: { groupId },
      include: {
        group: true,
      },
    });
  }
}
