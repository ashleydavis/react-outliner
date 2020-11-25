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

const DEFAULT_NOTE: INote = {
    id: v4(),
    text: "",
};

function makeNote(text: string): INote {
    return {
        id: v4(),
        text: text,
    };
}

export class Outliner extends React.Component<IOutlinerProps, IOutlinerState> {

    constructor(props: IOutlinerProps) {
        super(props);

        let notes = this.props.notes;
        if (notes === undefined) {
            notes = [ makeNote("Note 1"), makeNote("Note 2"), makeNote("Note 3") ];
        }
        else if (notes.length === 0) {
            notes = [ makeNote("Note 1"), makeNote("Note 2"), makeNote("Note 3") ];
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
    // Event raise on key down.
    //
    private onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>, index: number) {
        if (evt.key === "Enter") {
            this.setState({
                notes: this.state.notes.concat([DEFAULT_NOTE]),
            });
            evt.preventDefault();
        }

        if (evt.key === "Delete" && evt.ctrlKey) {
            const notes = this.state.notes.slice();
            notes.splice(index, 1);
            this.setState({
                notes: notes,
            });
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