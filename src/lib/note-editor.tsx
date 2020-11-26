//
// The UI compoent for a single note.
//

import * as React from "react";

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
}

export interface INoteEditorProps {
    //
    // The note currently being edited.
    //
    note: INote;

    //
    // Event raised to create a new note after this one.
    //
    onCreateNote: () => void;

    //
    // Event raised to delete the current note.
    //
    onDeleteNote: () => void;

    //
    // Event raised to indent this note.
    //
    onIndentNote: () => void;

    //
    // Event raised to unindent this note.
    //
    onUnindentNote: () => void;
}

export interface INoteEditorState {
}

export class NoteEditor extends React.Component<INoteEditorProps, INoteEditorState> {

    constructor(props: INoteEditorProps) {
        super(props);

        this.state = {};

        this.onKeyDown = this.onKeyDown.bind(this);
    }

    //
    // Event raise on key down.
    //
    private onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>) {

        if (evt.key === "Enter") {
            this.props.onCreateNote();
            evt.preventDefault();
        }

        if (evt.key === "Delete" && evt.ctrlKey) {
            this.props.onDeleteNote();
            evt.preventDefault();
        }

        if (evt.key === "Tab") {
            if (evt.shiftKey) {
                this.props.onUnindentNote();
            }
            else {
                this.props.onIndentNote();
            }
            evt.preventDefault();
        }
    }

    render() {
        return (
            <div
                className="note"
                contentEditable
                suppressContentEditableWarning
                onKeyDown={this.onKeyDown}
                style={{
                    marginLeft: "15px",
                    marginRight: "5px",
                    flexGrow: 1,
                    outline: "none",
                    cursor: "text",
                }}
                >
                {this.props.note.text}
            </div>
        );
    }
}