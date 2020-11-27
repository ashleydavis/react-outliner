import { chdir } from "process";
import * as React from "react";
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot, DragStart, DragUpdate } from "react-beautiful-dnd";
import { NoteEditor } from "./lib/note-editor";
import { INote, INoteTree, NoteTree } from "./lib/note-tree";

export interface IOutlinerProps {
    //
    // Initial notes to be displayed in the outliner.
    //
    notes?: INote[];

    //
    // Event raised when notes have been updated.
    //
    onNotesUpdated?: (notes: INote[]) => void;
}

export interface IOutlinerState {
    //
    // Notes that are currently displayed in the outliner.
    //
    noteTree: INoteTree; // A synthesized root note + an abstraction helps simplify the code.
}

//
// The ID of the next note to create.
// This is just to make sure that new notes have an locally unique id.
//
let nextNoteId = 0;

export function makeNote(text: string, hasFocus?: boolean, children?: INote[]): INote {
    nextNoteId += 1;
    return {
        id: nextNoteId.toString(),
        text: text,
        hasFocus: hasFocus,
        children: children || [],
    };
}

const INDENT_STEP = 35;

export class Outliner extends React.Component<IOutlinerProps, IOutlinerState> {

    constructor(props: IOutlinerProps) {
        super(props);

        this.state = {
            noteTree: new NoteTree({
                id: "root",
                text: "",
                children: this.props.notes || [],
            }),
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

        // Find the location of the dragged note.
        let sourceNotes: INote[];
        let sourceIndex: number;

        const sourceParentNote = this.state.noteTree.getNote(result.source.droppableId);
        if (sourceParentNote) {
            sourceNotes = sourceParentNote.children;
            sourceIndex = result.source.index;
        }
        else {
            throw new Error(`Failed to find source parent note ${result.source.droppableId}`)
        }

        // Find the location where the note was dropped.
        let destNotes: INote[];
        let destIndex: number;

        const destParentNote = this.state.noteTree.getNote(result.destination.droppableId);
        if (destParentNote) {
            destNotes = destParentNote.children;
            destIndex = result.destination.index;
        }
        else {
            throw new Error(`Failed to find dest parent note ${result.destination.droppableId}`)
        }

        // Remove dragged note (and children).
        const [ removed ] = sourceNotes.splice(sourceIndex, 1);

        // Put the note back at the position where it was dropped.
        destNotes.splice(destIndex, 0, removed);

        this.forceUpdate();
    }

    //
    // Creates a new note.
    //
    private createNote(parentNote: INote, noteIndex: number): void {
        const newNote = makeNote("", true);
        this.state.noteTree.addNote(parentNote, noteIndex, newNote);
        this.forceUpdate();

        if (this.props.onNotesUpdated) {
            this.props.onNotesUpdated(this.state.noteTree.getRootNote().children);
        }
    }

    //
    // Deletes a note.
    //
    private deleteNote(parentNote: INote, noteIndex: number): void {

        const prevNote = this.state.noteTree.getPrevNote(parentNote, noteIndex);
       
        // Remove the note the user wants to delete.
        this.state.noteTree.removeNote(parentNote, noteIndex);

        if (prevNote) {
            prevNote.hasFocus = true; // Focus the previous note.
        }

        this.forceUpdate();

        if (this.props.onNotesUpdated) {
            this.props.onNotesUpdated(this.state.noteTree.getRootNote().children);
        }
    }

    //
    // Indents a note one level.
    //
    private indentNote(parentNote: INote, noteIndex: number): void {
        if (noteIndex <= 0) {
            return; // Can't indent the first note!
        }

        const newParentNote = parentNote.children[noteIndex-1];
        this.state.noteTree.moveNote(parentNote, noteIndex, newParentNote, 0);

        this.forceUpdate();

        if (this.props.onNotesUpdated) {
            this.props.onNotesUpdated(this.state.noteTree.getRootNote().children);
        }
    }

    //
    // Unindents a note one level.
    //
    private unindentNote(parentNote: INote, childIndex: number, grandParent: INote | undefined): void {
        if (grandParent) {
            this.state.noteTree.moveNote(parentNote, childIndex, grandParent, 0);
            
            this.forceUpdate();

            if (this.props.onNotesUpdated) {
                this.props.onNotesUpdated(this.state.noteTree.getRootNote().children);
            }
        }
    }

    //
    // Event raised to focus the next note.
    //
    private onFocusNext(parentNote: INote, noteIndex: number, grandParent: INote | undefined, parentIndex: number | undefined): void {
        const nextNote = this.state.noteTree.getNextNote(parentNote, noteIndex, grandParent, parentIndex);
        if (nextNote) {
            nextNote.hasFocus = true;
            this.forceUpdate();
        } 
    }

    //
    // Event raised to focus the prev note.
    //
    private onFocusPrev(parentNote: INote, noteIndex: number): void {
        const prevNote = this.state.noteTree.getPrevNote(parentNote, noteIndex);
        if (prevNote) {
            prevNote.hasFocus = true;
            this.forceUpdate();
        } 
    }

    //
    // Renders children of a note.
    //
    private renderChildren(parentNote: INote, indentLevel: number, grandParent: INote | undefined, parentIndex: number | undefined) {
        return (
            <Droppable 
                droppableId={parentNote.id}
                >
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        >
                            
                        {parentNote.children.map((child, childIndex) => (
                            this.renderNote(child, childIndex, indentLevel, parentNote, grandParent, parentIndex)
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    }

    //
    // Renders a note.
    //
    private renderNote(note: INote, noteIndex: number, indentLevel: number, parent: INote, grandParent: INote | undefined, parentIndex: number | undefined) {
        // For debugging.
        // const colors = [ "red", "blue", "green", "yellow" ];

        return (
            <div 
                key={note.id}
                style={{
                    // backgroundColor: colors[indentLevel], // For debugging.
                }}
                >
                <Draggable 
                    key={note.id} 
                    draggableId={note.id} 
                    index={noteIndex}
                    >
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                            key={note.id}
                            {...provided.draggableProps}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                
                                ...provided.draggableProps.style,
                            }}
                            >
                            <div 
                                ref={provided.innerRef}
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginLeft: `${indentLevel * INDENT_STEP}px`,
                                }}
                                >
                                <div
                                    {...provided.dragHandleProps}
                                    >
                                    <svg 
                                        width="20" height="20" >
                                        <circle cx="10" cy="10" r="10" fill="#5c6062"></circle>
                                    </svg>
                                </div>
                                <div
                                    style={{
                                        marginLeft: "15px",
                                        marginRight: "5px",
                                        flexGrow: 1,
                                        outline: "none",
                                        cursor: "text",
                                    }}                               
                                    >
                                    <NoteEditor
                                        text={note.text}
                                        hasFocus={note.hasFocus}
                                        onCreateNote={() => this.createNote(parent, noteIndex)}
                                        onDeleteNote={() => this.deleteNote(parent, noteIndex)}
                                        onIndentNote={() => this.indentNote(parent, noteIndex)}
                                        onUnindentNote={() => this.unindentNote(parent, noteIndex, grandParent)}
                                        onFocused={() => {
                                            // After we have requested a note to focused, clear the field.
                                            note.hasFocus = false;
                                        }}
                                        onFocusNext={() => this.onFocusNext(parent, noteIndex, grandParent, parentIndex)}
                                        onFocusPrev={() => this.onFocusPrev(parent, noteIndex)}
                                        onTextChange={text => {
                                            note.text = text;
                                            if (this.props.onNotesUpdated) {
                                                this.props.onNotesUpdated(this.state.noteTree.getRootNote().children);
                                            }
                                        }}
                                        />
                                </div>
                            </div>

                            {note.children.length > 0
                                && this.renderChildren(note, indentLevel + 1, parent, noteIndex)
                            }
                        </div>
                    )}
                </Draggable>
            </div>
        );     
    }

    render() {
        return (
            <DragDropContext 
                onDragEnd={this.onDragEnd}
                >
                {this.renderChildren(this.state.noteTree.getRootNote(), 0, undefined, undefined)}
            </DragDropContext>
        );
    }

}