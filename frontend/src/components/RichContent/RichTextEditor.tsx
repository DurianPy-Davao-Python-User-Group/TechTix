import { forwardRef } from 'react';
import './RichContent.css';
import RichEditorMenu from './RichEditorMenu';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor, EditorContent, Content } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content: Content;
  placeholder?: string;
  setContent: (value: string) => void;
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(({ content, placeholder, setContent }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Placeholder.configure({
        emptyEditorClass: 'emptyEditor',
        placeholder
      })
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'min-h-[100px] w-full rounded-md border border-border bg-input px-3 py-1 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-5'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
    onCreate: ({ editor }) => {
      editor.commands.setContent(content);
    },
    immediatelyRender: false
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <RichEditorMenu editor={editor} />
      <EditorContent editor={editor} ref={ref} />
    </div>
  );
});

export default RichTextEditor;
