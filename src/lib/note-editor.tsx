//
// The UI compoent for a single note.
//

import * as React from "react";

export interface INoteEditorProps {
    //
    // The text for the note.
    //
    text: string;

    //
    // Set to true to give this note the input focus.
    //
    hasFocus?: boolean;

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

    //
    // Event raised when note was focused.
    //
    onFocused: () => void;
}

export interface INoteEditorState {
}

export class NoteEditor extends React.Component<INoteEditorProps, INoteEditorState> {

    //
    // References the div element for the note editor.
    //
    private noteRef: React.RefObject<HTMLDivElement>;

    constructor(props: INoteEditorProps) {
        super(props);

        this.state = {};

        this.onKeyDown = this.onKeyDown.bind(this);

        this.noteRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        if (this.props.hasFocus) {
            if (this.noteRef.current) {
                // TypeScript won't let me call "focus" on a div.
                // I have to be sneaky and force it.
                (this.noteRef.current as any).focus();

                this.props.onFocused();
            }
        }
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
                ref={this.noteRef}
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
                {this.props.text}
            </div>
        );
    }
}