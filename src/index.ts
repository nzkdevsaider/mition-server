import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { NotesService } from "./services/notes.service";
import { GroupsService } from "./services/groups.service";
import { AIService } from "./services/ai.service";

const app = new Elysia();
const notesService = new NotesService();
const groupsService = new GroupsService();
const aiService = new AIService();

app.use(cors());

app.group("/api/v1", (app) =>
  app
    .post("/notes", async ({ body }) => {
      try {
        const { content } = body as { content: string };

        const note = await notesService.createNote(content);

        const groups = await groupsService.getGroups();
        const analysis = await aiService.analyzeNote(content, groups);

        let groupId: number | undefined;

        if (analysis.suggestedGroupId) {
          groupId = Number(analysis.suggestedGroupId);
        } else if (analysis.newGroup) {
          const newGroup = await groupsService.createGroup(
            analysis.newGroup.name,
            analysis.newGroup.description
          );
          groupId = newGroup.id;
        }

        if (groupId) {
          await notesService.updateNoteGroup(note.id, groupId);
        }

        return {
          note: {
            ...note,
            id: note.id.toString(),
            groupId: note.groupId?.toString(),
          },
          analysis,
          groupId: groupId?.toString(),
        };
      } catch (error) {
        console.error("Error en la creación de nota:", error);
        return new Response(
          JSON.stringify({ error: "Error al crear la nota" }),
          { status: 500 }
        );
      }
    })
    .get("/notes", async () => {
      try {
        const notes = await notesService.getNotes();
        return notes.map((note) => ({
          ...note,
          id: note.id.toString(),
          groupId: note.groupId?.toString(),
        }));
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Error al obtener las notas" }),
          { status: 500 }
        );
      }
    })
    .get("/notes/:id", async ({ params: { id } }) => {
      try {
        const note = await notesService.getNote(Number(id));
        if (!note) throw new Error("Nota no encontrada");

        return {
          ...note,
          id: note.id.toString(),
          groupId: note.groupId?.toString(),
        };
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Error al obtener la nota" }),
          { status: 500 }
        );
      }
    })
    .put("/notes/:id", async ({ params: { id }, body }) => {
      try {
        const { content } = body as { content: string };
        const note = await notesService.updateNote(Number(id), content);
        return {
          ...note,
          id: note.id.toString(),
          groupId: note.groupId?.toString(),
        };
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Error al actualizar la nota" }),
          { status: 500 }
        );
      }
    })
    .delete("/notes/:id", async ({ params: { id } }) => {
      try {
        await notesService.deleteNote(Number(id));
        return { success: true };
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Error al eliminar la nota" }),
          { status: 500 }
        );
      }
    })
    .get("/groups", async () => {
      try {
        const groups = await groupsService.getGroups();
        return groups.map((group) => ({
          ...group,
          id: group.id.toString(),
          notes: group.notes?.map((note) => ({
            ...note,
            id: note.id.toString(),
            groupId: note.groupId?.toString(),
          })),
        }));
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Error al obtener los grupos" }),
          { status: 500 }
        );
      }
    })
);

app.listen(3000);
console.log("🦊 Servidor corriendo en http://localhost:3000");
