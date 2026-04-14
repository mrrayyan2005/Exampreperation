import { Mark, mergeAttributes } from '@tiptap/core';
   import { Plugin, PluginKey } from '@tiptap/pm/state';

   export interface NoteLinkOptions {
       HTMLAttributes: Record<string, unknown>;
       onNoteClick: (noteId: string) => void;
       onOpenSuggestions: (query: string, pos: number) => void;
   }

   declare module '@tiptap/core' {
       interface Commands<ReturnType> {
           noteLink: {
               setNoteLink: (attributes: { noteId: string; title: string }) => ReturnType;
               unsetNoteLink: () => ReturnType;
           };
       }
   }

   export const NoteLink = Mark.create<NoteLinkOptions>({
       name: 'noteLink',

       addOptions() {
           return {
               HTMLAttributes: {
                   class: 'note-link',
               },
               onNoteClick: () => {},
               onOpenSuggestions: () => {},
           };
       },

       addAttributes() {
           return {
               noteId: {
                   default: null,
                   parseHTML: element => element.getAttribute('data-note-id'),
                   renderHTML: attributes => {
                       if (!attributes.noteId) {
                           return {};
                       }
                       return {
                           'data-note-id': attributes.noteId,
                       };
                   },
               },
               title: {
                   default: null,
                   parseHTML: element => element.getAttribute('data-title'),
                   renderHTML: attributes => {
                       if (!attributes.title) {
                           return {};
                       }
                       return {
                           'data-title': attributes.title,
                       };
                   },
               },
           };
       },

       parseHTML() {
           return [
               {
                   tag: 'a[data-note-id]',
               },
           ];
       },

       renderHTML({ HTMLAttributes }) {
           return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
       },

       addCommands() {
           return {
               setNoteLink:
                   attributes =>
                   ({ chain }) => {
                       return chain()
                           .setMark(this.name, attributes)
                           .run();
                   },
               unsetNoteLink:
                   () =>
                   ({ chain }) => {
                       return chain().unsetMark(this.name).run();
                   },
           };
       },

       addProseMirrorPlugins() {
           const plugins: Plugin[] = [];

           // Plugin to detect [[ pattern and open suggestions
           plugins.push(
               new Plugin({
                   key: new PluginKey('noteLinkSuggestion'),
                   handleTextInput: (view, from, to, text) => {
                       // Check if user typed [[
                       if (text === '[') {
                           const { state } = view;
                           const $pos = state.doc.resolve(from);
                           const nodeBefore = $pos.nodeBefore;
                           
                           if (nodeBefore && nodeBefore.text && nodeBefore.text.endsWith('[')) {
                               // User typed [[, open suggestions
                               this.options.onOpenSuggestions('', from);
                           }
                       }
                       return false;
                   },
               })
           );

           // Plugin to handle clicks on note links
           plugins.push(
               new Plugin({
                   key: new PluginKey('noteLinkClick'),
                   props: {
                       handleClick: (view, pos, event) => {
                           const target = event.target as HTMLElement;
                           if (target.tagName === 'A' && target.hasAttribute('data-note-id')) {
                               const noteId = target.getAttribute('data-note-id');
                               if (noteId) {
                                   this.options.onNoteClick(noteId);
                                   return true;
                               }
                           }
                           return false;
                       },
                   },
               })
           );

           return plugins;
       },
   });