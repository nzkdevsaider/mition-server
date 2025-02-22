import { prisma } from "../db/prisma/prisma";
import type { NoteGroup } from "../types/note";

export class GroupsService {
  async createGroup(name: string, description: string): Promise<NoteGroup> {
    return await prisma.noteGroup.create({
      data: {
        name,
        description,
      },
    });
  }

  async getGroups(): Promise<NoteGroup[]> {
    return await prisma.noteGroup.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        notes: true,
      },
    });
  }

  async updateGroup(
    id: number,
    name: string,
    description: string
  ): Promise<NoteGroup> {
    return await prisma.noteGroup.update({
      where: { id },
      data: {
        name,
        description,
        updatedAt: new Date(),
      },
    });
  }

  async deleteGroup(id: number): Promise<NoteGroup> {
    return await prisma.noteGroup.delete({
      where: { id },
    });
  }
}
