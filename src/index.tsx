import { v4 } from "node-uuid";
import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
    }

    render() {
        const getListStyle = (isDraggingOver: boolean) => ({
            background: isDraggingOver ? "lightblue" : "lightgrey",
            padding: 8,
            width: 250,
        });

        const getItemStyle = (isDragging: any, draggableStyle: any) => ({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",

            // some basic styles to make the items look a bit nicer
            userSelect: "none",
            padding: 8 * 2,
            margin: `0 0 ${8}px 0`,
          
            // change background colour if dragging
            background: isDragging ? "lightgreen" : "grey",
          
            // styles we need to apply on draggables
            ...draggableStyle,
        });        

        const reorder = (list: INote[], startIndex: number, endIndex: number) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };        

        return (
            <DragDropContext 
                onDragEnd={(result: any) => {
                    if (!result.destination) {
                        return; // Dropped outside the list.
                    }
                  
                    const notes = reorder(
                        this.state.notes,
                        result.source.index,
                        result.destination.index
                    );
                  
                    this.setState({
                        notes: notes,
                    });                    
                }}
                >
                <Droppable droppableId="droppable">
                    {(provided: any, snapshot: any) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            >
                            {this.state.notes.map((note, index) => (
                                <Draggable 
                                    key={note.id} 
                                    draggableId={note.id} 
                                    index={index}
                                    >
                                    {(provided: any, snapshot: any) => (
                                        <div 
                                            key={index}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                              )}
                                            >
                                            <svg width="20" height="20" >
                                                <circle cx="10" cy="10" r="10" fill="#5c6062"></circle>
                                            </svg>
                                            <div
                                                className="note"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onKeyDown={evt => {
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
                                                }}
                                                style={{
                                                    marginLeft: "15px",
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