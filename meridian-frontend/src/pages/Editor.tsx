import { useState } from 'react';
import Editor from '@monaco-editor/react';

export function ComposeEditor() {
  const [content, setContent] = useState('# Title here\n\nWrite your post...');
  const [isMentored, setIsMentored] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 bg-primary/90 backdrop-blur-sm z-10 border-b border-surface/20 px-6 py-4 flex items-center justify-between">
        <input 
          type="text" 
          placeholder="Post Title..." 
          className="bg-transparent text-xl font-bold outline-none flex-1 mr-4"
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={isMentored} 
              onChange={e => setIsMentored(e.target.checked)}
              className="mr-2 accent-accent-amber"
            />
            Submit to Mentored Track
          </label>
          <button className="px-4 py-2 text-sm text-surface border border-surface/20 rounded-pill hover:bg-surface/10">
            Save Draft
          </button>
          <button className="px-4 py-2 text-sm bg-surface text-primary font-medium rounded-pill hover:opacity-90">
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 relative">
        {/* Mock Monaco instance */}
        <div className="h-[600px] border border-surface/20 rounded-xl overflow-hidden">
          <Editor 
            height="100%" 
            defaultLanguage="markdown" 
            theme="vs-dark" 
            value={content}
            onChange={(val) => setContent(val || '')}
            options={{ minimap: { enabled: false }, wordWrap: 'on' }}
          />
        </div>
      </div>
    </div>
  );
}
