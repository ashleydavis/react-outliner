//
// Represents a note in the outliner.
//
export interface INote {
    //
    // Locally unique id for the note.
    //
    id: string;

    //
    // The text for the note.
    //
    text: string;

    //
    // Set to true to focus the editor for the note.
    //
    hasFocus?: boolean;

    //
    // Child notes.
    //
    children: INote[],
}

export interface INoteTree {

    //
    // Gets the root note of the tree.
    //
    getRootNote(): INote;

    //
    // Gets a note by id.
    //
    getNote(id: string): INote | undefined;

    //
    // Adds a new note to the tree.
    //
    addNote(parentNote: INote, childIndex: number, newNote: INote): void;

    //
    // Removes a note from the tree.
    //
    removeNote(parentNote: INote, childIndex: number): void;

    //
    // Move a note from one parent to another.
    //
    moveNote(oldParentNote: INote, oldChildIndex: number, newParentNote: INote, newChildIndex: number): void;

    //
    // Finds the next note in a traversal of the tree.
    //
    getNextNote(parentNote: INote, childIndex: number, grandParent: INote | undefined, parentIndex: number | undefined): INote | undefined;

    //
    // Finds the previous note in a traversal of the tree.
    //
    getPrevNote(parentNote: INote, childIndex: number): INote | undefined;
}

export class NoteTree implements INoteTree {
    
    //
    // The root note in the tree.
    //
    private rootNote: INote;

    //
    // Non-hierarchical lookup table for notes.
    //
    private notesLookup = new Map<string, INote>();

    constructor(rootNote: INote) {
        this.rootNote = rootNote;

        //
        // Create a lookup table for notes.
        //
        this.createNoteLookup(this.rootNote);
    }

    //
    // Create a lookup table for notes.
    //
    private createNoteLookup(note: INote) {
        this.notesLookup.set(note.id, note);

        for (const child of note.children) {
            this.createNoteLookup(child);
        }
    }

    //
    // Gets the root note of the tree.
    //
    getRootNote(): INote {
        return this.rootNote;
    }

    //
    // Gets a note by id.
    //
    getNote(id: string): INote | undefined {
        return this.notesLookup.get(id);
    }

    //
    // Adds a new note to the tree.
    //
    addNote(parentNote: INote, childIndex: number, newNote: INote): void {
        this.notesLookup.set(newNote.id, newNote); // Track the new note in the lookup table.
        parentNote.children.splice(childIndex+1, 0, newNote);
    }

    //
    // Removes a note from the tree.
    //
    removeNote(parentNote: INote, childIndex: number): void {
        const [ noteToDelete ] = parentNote.children.splice(childIndex, 1);
        this.notesLookup.delete(noteToDelete.id); // Remove the deleted note from the lookup table.
    }

    //
    // Move a note from one parent to another.
    //
    moveNote(oldParentNote: INote, oldChildIndex: number, newParentNote: INote, newChildIndex: number): void {
        const [ childNote ] = oldParentNote.children.splice(oldChildIndex, 1);
        newParentNote.children.splice(newChildIndex, 0, childNote);
    }

    //
    // Finds the next note in a traversal of the tree.
    //
    getNextNote(parentNote: INote, childIndex: number, grandParent: INote | undefined, parentIndex: number | undefined): INote | undefined {
        const note = parentNote.children[childIndex];
        if (note.children.length > 0) {
            // Recurse down to the child.
            return note.children[0];
        }

        if (childIndex < parentNote.children.length-1) {
            // Get the next sibling note.
            return parentNote.children[childIndex+1];
        }

        if (grandParent !== undefined && parentIndex !== undefined) {
            if (parentIndex < grandParent.children.length-1) {
                return grandParent.children[parentIndex+1];
            }
        }

        return undefined;
    }

    //
    // Finds the previous note in a traversal of the tree.
    //
    getPrevNote(parentNote: INote, childIndex: number): INote | undefined {

        if (childIndex > 0) {
            // Get the previous sibling note.
            let prevNote = parentNote.children[childIndex-1];

            // Find the end of the sub-tree.
            while (prevNote.children.length > 0) {
                prevNote = prevNote.children[prevNote.children.length-1];
            }

            return prevNote;
        }

        // Recurse up to the parent note.
        return parentNote;
    }
}