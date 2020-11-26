import { v4 } from "node-uuid";
import * as React from "react";
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";

//
// Represents a note in the outliner.
//
export interface INote {
    //
    // Unique id for the note.
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

function makeNote(text: string, indentLevel: number): INote {
    return {
        id: v4(),
        text: text,
        indentLevel: indentLevel,
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
    // Reorders a list of notes that has been drag and drop rearranged.
    //
    private reorder(notes: INote[], startIndex: number, endIndex: number) {
        const result = Array.from(notes);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    }     

    //
    // Event raised when drag and drop has completed.
    //
    private onDragEnd(result: DropResult, provided: ResponderProvided): void {
        if (!result.destination) {
            return; // Dropped outside the list.
        }

        const siblingNote = this.state.notes[result.destination.index];
        const childNote = this.state.notes[result.source.index];
        childNote.indentLevel = siblingNote.indentLevel;
      
        const notes = this.reorder(
            this.state.notes,
            result.source.index,
            result.destination.index
        );
      
        this.setState({
            notes: notes,
        });                    
    }

    //
    // Creates a new note.
    //
    private createNote(noteIndex: number): void {
        const existingNote = this.state.notes[noteIndex];
        const newNote = makeNote("", existingNote.indentLevel);
        const notes = this.state.notes.slice();
        notes.splice(noteIndex+1, 0, newNote);
        this.setState({
            notes: notes,
        });
    }

    //
    // Deletes a note.
    //
    private deleteNote(noteIndex: number): void {
        const notes = this.state.notes.slice();
        const noteToDelete = this.state.notes[noteIndex];
        const parentIndentLevel = noteToDelete.indentLevel;
        const childNoteIndex = noteIndex + 1;
        while (childNoteIndex < notes.length) {
            const childNote = notes[childNoteIndex];
            if (childNote.indentLevel <= parentIndentLevel) {
                break;
            }

            notes.splice(childNoteIndex, 1);
        }
        
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

        note.indentLevel += 1;

        this.setState({
            notes: this.state.notes,
        });
    }

    //
    // Unindents a note one level.
    //
    private unindentNote(noteIndex: number): void {
        const note = this.state.notes[noteIndex];
        if (note.indentLevel > 0) {
            note.indentLevel -= 1;
        }

        this.setState({
            notes: this.state.notes,
        });
    }

    //
    // Event raise on key down.
    //
    private onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>, noteIndex: number) {

        if (evt.key === "Enter") {
            this.createNote(noteIndex);
            evt.preventDefault();
        }

        if (evt.key === "Delete" && evt.ctrlKey) {
            this.deleteNote(noteIndex);
            evt.preventDefault();
        }

        if (evt.key === "Tab") {
            if (evt.shiftKey) {
                this.unindentNote(noteIndex);
            }
            else {
                this.indentNote(noteIndex);
            }
            evt.preventDefault();
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
                                            <div
                                                className="note"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onKeyDown={evt => this.onKeyDown(evt, index)}
                                                style={{
                                                    marginLeft: "15px",
                                                    marginRight: "5px",
                                                    flexGrow: 1,
                                                }}
                                                >
                                                {note.text}
                                            </div>
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