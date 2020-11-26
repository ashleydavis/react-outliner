import * as React from "react";
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { NoteEditor } from "./lib/note-editor";

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
    // The indented level of the note, indicating it's position in the hierarchies notes.
    //
    indentLevel: number;

    //
    // Set to true to focus the editor for the note.
    //
    hasFocus?: boolean;
}

export interface IOutlinerProps {
    //
    // Initial notes to be displayed in the outliner.
    //
    notes?: INote[];
}

export interface IOutlinerState {
    //
    // Notes that are currently displayed in the outliner.
    //
    notes: INote[];
}

//
// The ID of the next note to create.
// This is just to make sure that new notes have an locally unique id.
//
let nextNoteId = 0;

function makeNote(text: string, indentLevel: number, hasFocus?: boolean): INote {
    return {
        id: (nextNoteId++).toString(),
        text: text,
        indentLevel: indentLevel,
        hasFocus: hasFocus,
    };
}

const INDENT_STEP = 35;

const DEFAULT_NOTES = [ 
    makeNote("Note 1", 0), 
    makeNote("Note 2", 0), 
        makeNote("Child note 1", 1), 
            makeNote("Grandchild note 1", 2), 
            makeNote("Grandchild note 2", 2), 
        makeNote("Child note 2", 1), 
    makeNote("Note 3", 0),
];

export class Outliner extends React.Component<IOutlinerProps, IOutlinerState> {

    constructor(props: IOutlinerProps) {
        super(props);

        let notes = this.props.notes;
        if (notes === undefined) {
            notes = DEFAULT_NOTES;
        }
        else if (notes.length === 0) {
            notes = DEFAULT_NOTES;
        }

        this.state = {
            notes: notes,
        };

        this.onDragEnd = this.onDragEnd.bind(this);
    }

    //
    // Event raised when drag and drop has completed.
    //
    private onDragEnd(result: DropResult, provided: ResponderProvided): void {
        if (!result.destination) {
            return; // Dropped outside the list.
        }

        const notes = this.state.notes.slice();  // Clone notes.
        const siblingNote = notes[result.destination.index];
        const childNote = notes[result.source.index];
        childNote.indentLevel = siblingNote.indentLevel;

        // Remove dragged note.
        const [ removed ] = notes.splice(result.source.index, 1);

        // Put the note back at the position where it was dropped.
        notes.splice(result.destination.index, 0, removed);
      
        this.setState({
            notes: notes,
        });                    
    }

    //
    // Creates a new note.
    //
    private createNote(noteIndex: number): void {
        const existingNote = this.state.notes[noteIndex];
        const newNote = makeNote("", existingNote.indentLevel, true);
        const notes = this.state.notes.slice(); // Clone notes.
        notes.splice(noteIndex+1, 0, newNote);
        this.setState({
            notes: notes,
        });
    }

    //
    // Deletes a note.
    //
    private deleteNote(noteIndex: number): void {
        const notes = this.state.notes.slice(); // Clone notes.
        const noteToDelete = notes[noteIndex];
        const parentIndentLevel = noteToDelete.indentLevel;
        const childNoteIndex = noteIndex + 1;
        while (childNoteIndex < notes.length) {
            const childNote = notes[childNoteIndex];
            if (childNote.indentLevel <= parentIndentLevel) {
                break;
            }

            // Remove child note.
            notes.splice(childNoteIndex, 1); 
        }
        
        // Remove the note the user wants to delete.
        notes.splice(noteIndex, 1);
        this.setState({
            notes: notes,
        });
    }

    //
    // Indents a note one level.
    //
    private indentNote(noteIndex: number): void {
        if (noteIndex <= 0) {
            return; // Can't indent the first note!
        }

        const prevNote = this.state.notes[noteIndex-1];
        const note = this.state.notes[noteIndex];
        if (note.indentLevel > prevNote.indentLevel) {
            // Can't indent more than one level below the prev node.
            return;
        }

        const notes = this.state.notes.slice(); // Clone notes.

        //
        // Indent all the children of the node.
        //
        for (let childIndex = noteIndex+1; childIndex < notes.length; ++childIndex) {
            const child = notes[childIndex];
            if (child.indentLevel > note.indentLevel) {
                //
                // This is a child!
                // Indent it as as well as the parent.
                //
                child.indentLevel += 1;
            }
            else {
                //
                // No more children!
                //
                break;
            }
        }

        note.indentLevel += 1;

        this.setState({
            notes: notes,
        });
    }

    //
    // Unindents a note one level.
    //
    private unindentNote(noteIndex: number): void {
        const notes = this.state.notes.slice(); // Clone notes.
        const note = notes[noteIndex];
        if (note.indentLevel <= 0) {
            // Can't unindent less than a root note!
            return;
        }

        //
        // Unindent all the children of the node.
        //
        for (let childIndex = noteIndex+1; childIndex < notes.length; ++childIndex) {
            const child = notes[childIndex];
            if (child.indentLevel > note.indentLevel) {
                //
                // This is a child!
                // Unindent it as as well as the parent.
                //
                child.indentLevel -= 1;
            }
            else {
                //
                // No more children!
                //
                break;
            }
        }

        note.indentLevel -= 1;

        this.setState({
            notes: notes,
        });
    }

    //
    // Event raised to focus the next note.
    //
    private onFocusNext(noteIndex: number): void {
        if (noteIndex < this.state.notes.length-1) {
            const notes = this.state.notes.slice(); // Clone notes.
            const nextNote = notes[noteIndex+1];
            nextNote.hasFocus = true;
            this.setState({
                notes: notes,
            });
        }
    }

    //
    // Event raised to focus the prev note.
    //
    private onFocusPrev(noteIndex: number): void {
        if (noteIndex > 0) {
            const notes = this.state.notes.slice(); // Clone notes.
            const prevNote = notes[noteIndex-1];
            prevNote.hasFocus = true;
            this.setState({
                notes: notes,
            });
        }
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            >
                            {this.state.notes.map((note, index) => (
                                <Draggable 
                                    key={note.id} 
                                    draggableId={note.id} 
                                    index={index}
                                    >
                                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                        <div 
                                            key={index}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginLeft: `${note.indentLevel * INDENT_STEP}px`,
                                    
                                                ...provided.draggableProps.style,
                                            }}
                                            >
                                            <svg width="20" height="20" >
                                                <circle cx="10" cy="10" r="10" fill="#5c6062"></circle>
                                            </svg>
                                            {<NoteEditor
                                                text={note.text}
                                                hasFocus={note.hasFocus}
                                                onCreateNote={() => this.createNote(index)}
                                                onDeleteNote={() => this.deleteNote(index)}
                                                onIndentNote={() => this.indentNote(index)}
                                                onUnindentNote={() => this.unindentNote(index)}
                                                onFocused={() => {
                                                    // After we have requested a note to focused, clear the field.
                                                    note.hasFocus = false;
                                                }}
                                                onFocusNext={() => this.onFocusNext(index)}
                                                onFocusPrev={() => this.onFocusPrev(index)}
                                                />}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }

}