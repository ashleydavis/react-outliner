//
// The UI compoent for a single note.
//

import * as React from "react";
import ContentEditable from "react-contenteditable";

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
    onCreateNote?: () => void;

    //
    // Event raised to delete the current note.
    //
    onDeleteNote?: () => void;

    //
    // Event raised to indent this note.
    //
    onIndentNote?: () => void;

    //
    // Event raised to unindent this note.
    //
    onUnindentNote?: () => void;

    //
    // Event raised when note was focused.
    //
    onFocused?: () => void;

    //
    // Event raised to focus the prev note.
    //
    onFocusPrev?: () => void;

    //
    // Event raised to focus the next note.
    //
    onFocusNext?: () => void;

    //
    // Event raised when text has changed.
    //
    onTextChange?: (text: string) => void;
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
            this.giveFocus();
        }
    }

    shouldComponentUpdate(nextProps: INoteEditorProps, nextState: INoteEditorState) {
        if (nextProps.hasFocus) {
            this.giveFocus();
        }
        return true;
    }

    //
    // Gives input focus to this note.
    //
    private giveFocus() {
        if (this.noteRef.current) {
            // TypeScript won't let me call "focus" on a div.
            // I have to be sneaky and force it.
            (this.noteRef.current as any).focus();

            if (this.props.onFocused) {
                this.props.onFocused();
            }
        }
    }

    //
    // Event raise on key down.
    //
    private onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>) {

        if (this.props.onCreateNote && evt.key === "Enter") {
            this.props.onCreateNote();
            evt.preventDefault();
            return;
        }

        if (this.props.onDeleteNote && evt.key === "Delete" && evt.ctrlKey) {
            this.props.onDeleteNote();
            evt.preventDefault();
            return;
        }

        if (evt.key === "Tab") {
            if (evt.shiftKey) {
                if (this.props.onUnindentNote) {
                    this.props.onUnindentNote();
                }
            }
            else {
                if (this.props.onIndentNote) {
                    this.props.onIndentNote();
                }
            }
            evt.preventDefault();
            return;
        }

        if (this.props.onFocusNext && evt.key === "ArrowDown") {
            this.props.onFocusNext();
            evt.preventDefault();
            return;
        }

        if (this.props.onFocusPrev && evt.key === "ArrowUp") {
            this.props.onFocusPrev();
            evt.preventDefault();
            return;
        }
    }

    render() {
        return (
            <ContentEditable
                innerRef={this.noteRef}
                onKeyDown={this.onKeyDown}
                html={this.props.text}
                onChange={evt => {
                    if (this.props.onTextChange) {
                        this.props.onTextChange(evt.target.value);
                    }
                }}
                />
        );
    }
}