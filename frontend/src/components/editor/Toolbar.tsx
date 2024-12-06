import React from 'react';
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    FormatListBulleted,
    FormatListNumbered,
    FormatQuote,
    Code,
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatAlignJustify,
    InsertComment,
} from '@mui/icons-material';
import { EditorState, RichUtils, Modifier } from 'draft-js';

interface ToolbarProps {
    editorState: EditorState;
    onStyleChange: (editorState: EditorState) => void;
    onAddComment: () => void;
}

const BLOCK_TYPES = [
    { label: 'Normal', style: 'unstyled' },
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
];

const FONT_SIZES = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

export const Toolbar: React.FC<ToolbarProps> = ({
    editorState,
    onStyleChange,
    onAddComment,
}) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    const toggleInlineStyle = (style: string) => {
        onStyleChange(RichUtils.toggleInlineStyle(editorState, style));
    };

    const toggleBlockType = (type: string) => {
        onStyleChange(RichUtils.toggleBlockType(editorState, type));
    };

    const handleFontSizeChange = (size: string) => {
        const contentState = editorState.getCurrentContent();
        const contentWithFontSize = Modifier.applyInlineStyle(
            contentState,
            selection,
            `FONTSIZE_${size}`
        );
        onStyleChange(EditorState.push(editorState, contentWithFontSize, 'change-inline-style'));
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 1, bgcolor: 'background.paper' }}>
            <Box display="flex" alignItems="center" gap={1}>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                        value={BLOCK_TYPES.find(type => type.style === blockType)?.label || 'Normal'}
                        onChange={(e) => toggleBlockType(
                            BLOCK_TYPES.find(type => type.label === e.target.value)?.style || 'unstyled'
                        )}
                    >
                        {BLOCK_TYPES.map((type) => (
                            <MenuItem key={type.style} value={type.label}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 60 }}>
                    <Select
                        value="12"
                        onChange={(e) => handleFontSizeChange(e.target.value)}
                    >
                        {FONT_SIZES.map((size) => (
                            <MenuItem key={size} value={size}>
                                {size}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Divider orientation="vertical" flexItem />

                <ToggleButtonGroup size="small">
                    <ToggleButton
                        value="BOLD"
                        selected={currentStyle.has('BOLD')}
                        onClick={() => toggleInlineStyle('BOLD')}
                    >
                        <FormatBold />
                    </ToggleButton>
                    <ToggleButton
                        value="ITALIC"
                        selected={currentStyle.has('ITALIC')}
                        onClick={() => toggleInlineStyle('ITALIC')}
                    >
                        <FormatItalic />
                    </ToggleButton>
                    <ToggleButton
                        value="UNDERLINE"
                        selected={currentStyle.has('UNDERLINE')}
                        onClick={() => toggleInlineStyle('UNDERLINE')}
                    >
                        <FormatUnderlined />
                    </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem />

                <ToggleButtonGroup size="small">
                    <ToggleButton
                        value="unordered-list-item"
                        selected={blockType === 'unordered-list-item'}
                        onClick={() => toggleBlockType('unordered-list-item')}
                    >
                        <FormatListBulleted />
                    </ToggleButton>
                    <ToggleButton
                        value="ordered-list-item"
                        selected={blockType === 'ordered-list-item'}
                        onClick={() => toggleBlockType('ordered-list-item')}
                    >
                        <FormatListNumbered />
                    </ToggleButton>
                    <ToggleButton
                        value="blockquote"
                        selected={blockType === 'blockquote'}
                        onClick={() => toggleBlockType('blockquote')}
                    >
                        <FormatQuote />
                    </ToggleButton>
                    <ToggleButton
                        value="code-block"
                        selected={blockType === 'code-block'}
                        onClick={() => toggleBlockType('code-block')}
                    >
                        <Code />
                    </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem />

                <ToggleButtonGroup size="small">
                    <ToggleButton
                        value="left"
                        selected={blockType === 'align-left'}
                        onClick={() => toggleBlockType('align-left')}
                    >
                        <FormatAlignLeft />
                    </ToggleButton>
                    <ToggleButton
                        value="center"
                        selected={blockType === 'align-center'}
                        onClick={() => toggleBlockType('align-center')}
                    >
                        <FormatAlignCenter />
                    </ToggleButton>
                    <ToggleButton
                        value="right"
                        selected={blockType === 'align-right'}
                        onClick={() => toggleBlockType('align-right')}
                    >
                        <FormatAlignRight />
                    </ToggleButton>
                    <ToggleButton
                        value="justify"
                        selected={blockType === 'align-justify'}
                        onClick={() => toggleBlockType('align-justify')}
                    >
                        <FormatAlignJustify />
                    </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem />

                <Tooltip title="Add Comment">
                    <IconButton onClick={onAddComment} size="small">
                        <InsertComment />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};
