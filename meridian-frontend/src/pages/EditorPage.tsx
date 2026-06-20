import Editor from '@monaco-editor/react';
import { Image, Link as LinkIcon, Send, Sigma, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const starterCode = `pub fn coordinate_meridian() {\n    // Initializing network parity\n    let state = SystemParity::new();\n}`;

export function EditorPage() {
  return (
    <main className="min-h-screen bg-neutral-500 p-4 text-[#EAECEC] sm:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col border border-[#333] bg-black shadow-panel">
        <header className="flex h-16 items-center justify-between border-b border-[#333] px-5">
          <div className="flex items-center gap-4 text-neutral-600">
            <Link to="/feed" className="inline-flex items-center gap-2 font-mono">
              <X size={18} />
              Cancel
            </Link>
            <span className="h-6 w-px bg-surface" />
            <span className="bg-surface px-3 py-1 font-mono text-sm">v1.0.0</span>
          </div>
          <div className="flex items-center gap-5">
            <button className="font-mono text-neutral-600">Drafts</button>
            <button className="inline-flex h-10 items-center gap-2 bg-verified px-6 font-bold text-black">
              Publish
              <Send size={16} />
            </button>
          </div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[1fr_400px]">
          <section className="min-w-0 p-6 lg:p-8">
            <input
              className="w-full border-0 bg-transparent text-4xl font-black outline-none placeholder:text-[#d0c5c8]"
              placeholder="Give your breakthrough a name..."
              aria-label="Post title"
            />
            <div className="my-12 h-px bg-surface" />
            <textarea
              className="min-h-[360px] w-full resize-none bg-transparent text-2xl leading-10 outline-none placeholder:text-[#d0c5c8]"
              placeholder="Documentation starts here. Use Markdown to structure your engineering deep-dive, paste code blocks, or insert mathematical proofs..."
              aria-label="Post body"
            />
            <div className="mt-8 overflow-hidden border border-black bg-black">
              <Editor
                height="180px"
                defaultLanguage="rust"
                defaultValue={starterCode}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>
          </section>

          <aside className="border-t border-[#333] bg-[#f8fafa] p-6 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-[0.18em] text-neutral-600">Stack Tags</h2>
              <button className="text-2xl text-neutral-600" aria-label="Add tag">+</button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Rust', 'Distributed Systems'].map((tag) => (
                <span key={tag} className="border border-[#333] bg-black px-3 py-2 font-mono text-sm">{tag} ×</span>
              ))}
              <button className="border border-dashed border-[#333] px-3 py-2 font-mono text-sm text-muted">+ Add Tag</button>
            </div>

            <h2 className="mt-12 font-mono text-sm uppercase tracking-[0.18em] text-neutral-600">Audience</h2>
            <div className="mt-5 space-y-3">
              {['Global Network', 'Organization Only', 'Private Draft'].map((item, index) => (
                <label key={item} className="flex h-14 items-center justify-between border border-[#333] bg-black px-4 text-lg">
                  {item}
                  <input type="radio" name="audience" defaultChecked={index === 0} className="h-5 w-5 accent-black" />
                </label>
              ))}
            </div>

            <div className="mt-12 border border-verified/40 bg-verified/15 p-5">
              <label className="flex gap-4">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-verified" />
                <span>
                  <span className="block text-xl font-bold">Mentored Track</span>
                  <span className="mt-2 block leading-6">Flag this breakthrough for technical review by the Meridian Senior Fellows.</span>
                </span>
              </label>
            </div>

            <div className="mt-12 grid h-44 place-items-center border border-dashed border-[#333] bg-surface text-neutral-500">
              <div className="text-center">
                <Image className="mx-auto" />
                <p className="mt-2">Cover Image</p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex h-16 flex-wrap items-center gap-5 border-t border-[#333] px-6 text-sm text-neutral-600">
          <button aria-label="Code block"><span className="font-mono text-xl">&lt;&gt;</span></button>
          <button aria-label="Image"><Image size={19} /></button>
          <button aria-label="Citation"><LinkIcon size={19} /></button>
          <button aria-label="Formula"><Sigma size={19} /></button>
          <span className="h-6 w-px bg-surface" />
          <span>1,240 words</span>
          <span>Saved at 14:02</span>
          <span className="ml-auto hidden sm:inline">2 Active Collaborators</span>
        </footer>
      </section>
    </main>
  );
}
