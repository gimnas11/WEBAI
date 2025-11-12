import { useEffect, useRef, useState } from 'react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

// Lazy load Monaco Editor
let monacoEditor: any = null;
let monacoLoader: Promise<any> | null = null;

const loadMonacoFromCDN = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    const win = window as any;
    if (win.monaco && win.monaco.editor) {
      console.log('✅ Monaco already loaded from CDN');
      resolve(win.monaco);
      return;
    }

    // Load Monaco Editor from CDN
    console.log('🔄 Loading Monaco Editor from CDN...');
    
    const loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs/loader.js';
    loaderScript.onload = () => {
      const require = (window as any).require;
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs' } });
      require(['vs/editor/editor.main'], () => {
        console.log('✅ Monaco Editor loaded from CDN');
        resolve((window as any).monaco);
      });
    };
    loaderScript.onerror = () => {
      reject(new Error('Failed to load Monaco Editor from CDN'));
    };
    document.head.appendChild(loaderScript);
  });
};

const loadMonaco = async (): Promise<any> => {
  if (monacoEditor) return monacoEditor;
  if (monacoLoader) return monacoLoader;
  
  console.log('🔄 Loading Monaco Editor...');
  
  // Try dynamic import first, fallback to CDN
  monacoLoader = Promise.race([
    import('monaco-editor').then((module) => {
      console.log('📦 Monaco Editor module loaded:', Object.keys(module));
      
      let monaco: any = null;
      
      // Method 1: Check window.monaco (set by some loaders)
      const win = window as any;
      if (win.monaco && win.monaco.editor) {
        console.log('✅ Found Monaco on window.monaco');
        monaco = win.monaco;
      }
      // Method 2: Check module.editor (named export)
      else if (module.editor) {
        console.log('✅ Found Monaco in module.editor');
        monaco = { editor: module.editor };
      }
      // Method 3: Check default export
      else if (module.default) {
        const defaultExport = module.default;
        if (defaultExport && defaultExport.editor) {
          console.log('✅ Found Monaco in module.default.editor');
          monaco = defaultExport;
        } else if (typeof defaultExport === 'object' && defaultExport !== null) {
          // Try to access editor property
          if ('editor' in defaultExport) {
            console.log('✅ Found Monaco in module.default[editor]');
            monaco = defaultExport;
          }
        }
      }
      // Method 4: Check for monaco property
      else if ((module as any).monaco) {
        console.log('✅ Found Monaco in module.monaco');
        monaco = (module as any).monaco;
      }
      // Method 5: Try accessing directly from module
      else if (typeof (module as any).create === 'function') {
        console.log('✅ Found Monaco create function directly');
        monaco = { editor: module };
      }
      
      if (monaco && monaco.editor && typeof monaco.editor.create === 'function') {
        console.log('✅ Monaco Editor API found and ready');
        return monaco;
      }
      
      // Log all available keys for debugging
      console.warn('⚠️ Monaco Editor API not found in module, trying CDN...');
      console.log('Available keys:', Object.keys(module));
      // Fallback to CDN
      throw new Error('Module load failed, will try CDN');
    }).catch((error) => {
      console.warn('⚠️ Dynamic import failed, trying CDN fallback:', error.message);
      return loadMonacoFromCDN();
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Monaco Editor load timeout after 30s')), 30000)
    )
  ]).then((monaco: any) => {
    if (monaco && monaco.editor && typeof monaco.editor.create === 'function') {
      monacoEditor = monaco;
      console.log('✅ Monaco Editor ready to use');
      return monaco;
    }
    throw new Error('Monaco Editor not properly loaded - editor.create is not a function');
  }).catch((error) => {
    console.error('❌ Monaco Editor load error:', error);
    // Try CDN as last resort
    if (error.message.includes('timeout') || error.message.includes('not found')) {
      console.log('🔄 Attempting CDN fallback...');
      return loadMonacoFromCDN().then((monaco) => {
        if (monaco && monaco.editor && typeof monaco.editor.create === 'function') {
          monacoEditor = monaco;
          console.log('✅ Monaco Editor loaded from CDN successfully');
          return monaco;
        }
        throw new Error('CDN load also failed');
      });
    }
    monacoLoader = null; // Reset loader on error
    throw error;
  });
  
  return monacoLoader;
};

const languageMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  sh: 'shell',
  bash: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  md: 'markdown',
  sql: 'sql',
  vue: 'vue',
  svelte: 'svelte',
};

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    let editor: any = null;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    setIsLoading(true);

    // Set timeout to show error if loading takes too long (increased to 60s for large bundle)
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Monaco Editor still loading after 60s - this is normal for first load on slow connections');
        // Don't set loading to false yet, let it continue
      }
    }, 60000);

    loadMonaco()
      .then((monaco) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!editorRef.current || !isMounted) return;

        // Check if monaco.editor exists
        if (!monaco || !monaco.editor || !monaco.editor.create) {
          throw new Error('Monaco Editor API not available');
        }

        // Dispose existing editor if any
        if (editorInstanceRef.current) {
          try {
            editorInstanceRef.current.dispose();
          } catch (e) {
            console.warn('Error disposing editor:', e);
          }
          editorInstanceRef.current = null;
        }

        // Initialize Monaco Editor
        try {
          editor = monaco.editor.create(editorRef.current, {
            value: value || '',
            language: languageMap[language] || language || 'plaintext',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
          });

          editorInstanceRef.current = editor;
          
          if (isMounted) {
            setIsLoading(false);
          }

          // Handle content changes
          editor.onDidChangeModelContent(() => {
            if (isMounted && editor) {
              try {
                const newValue = editor.getValue();
                onChange(newValue);
              } catch (e) {
                console.warn('Error getting editor value:', e);
              }
            }
          });
        } catch (createError) {
          console.error('Error creating Monaco Editor:', createError);
          if (isMounted) {
            setIsLoading(false);
          }
          throw createError;
        }
      })
      .catch((error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        console.error('Failed to load Monaco Editor:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        if (isMounted) {
          setIsLoading(false);
          setLoadError('Failed to load Monaco Editor. Using fallback editor.');
        }
      });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (editor) {
        try {
          editor.dispose();
        } catch (e) {
          console.warn('Error disposing editor on cleanup:', e);
        }
      }
    };
  }, [language]);

  // Update editor value when prop changes (only if different)
  useEffect(() => {
    if (editorInstanceRef.current && !isLoading) {
      const currentValue = editorInstanceRef.current.getValue();
      if (currentValue !== value) {
        // Preserve cursor position
        const position = editorInstanceRef.current.getPosition();
        editorInstanceRef.current.setValue(value || '');
        if (position) {
          editorInstanceRef.current.setPosition(position);
        }
      }
    }
  }, [value, isLoading]);

  // Check for loading timeout (increased to 90s for large bundle)
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading && !editorInstanceRef.current) {
          console.warn('⚠️ Monaco Editor loading timeout after 90s - switching to fallback');
          setLoadError('Monaco Editor is taking too long to load. Using fallback editor.');
          setIsLoading(false);
        }
      }, 90000); // 90 second timeout for large bundle
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (isLoading && !loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-chat-darker">
        <div className="text-center text-gray-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm">Loading editor...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  // Fallback to textarea if Monaco fails to load
  if (loadError || (!isLoading && !editorInstanceRef.current)) {
    return (
      <div className="w-full h-full flex flex-col bg-chat-darker">
        {loadError && (
          <div className="p-2 bg-yellow-900/20 border-b border-yellow-800 text-yellow-400 text-xs">
            {loadError} Check browser console for details.
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 w-full p-4 bg-chat-darker text-white font-mono text-sm resize-none focus:outline-none"
          style={{ minHeight: '400px' }}
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}

