import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, RotateCcw, Settings, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const languages = [
  { value: 'javascript', label: 'JavaScript', template: '// Write your solution here\nfunction solution() {\n    \n}' },
  { value: 'python', label: 'Python', template: '# Write your solution here\ndef solution():\n    pass' },
  { value: 'java', label: 'Java', template: 'public class Solution {\n    public void solution() {\n        \n    }\n}' },
  { value: 'cpp', label: 'C++', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}' },
  { value: 'c', label: 'C', template: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}' },
  { value: 'go', label: 'Go', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n}' },
];

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  isFullscreen = false,
  onFullscreenToggle,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Fira Code, Monaco, Menlo, monospace',
      minimap: { enabled: window.innerWidth > 1024 },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      theme: 'vs-dark',
    });
  };

  const resetCode = () => {
    const template = languages.find(lang => lang.value === language)?.template || '';
    onChange(template);
  };

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(newLanguage);
    const template = languages.find(lang => lang.value === newLanguage)?.template || '';
    onChange(template);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [isFullscreen]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-background/50">
        <div className="flex items-center space-x-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 glass border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border border-white/20">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCode}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreenToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'Fira Code, Monaco, Menlo, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            folding: true,
            lineNumbers: 'on',
            glyphMargin: false,
            selectOnLineNumbers: true,
            matchBrackets: 'always',
            cursorStyle: 'line',
            renderWhitespace: 'selection',
            contextmenu: true,
            mouseWheelZoom: true,
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-3 border-t border-white/10 bg-background/50">
        <div className="text-xs text-muted-foreground">
          Press Ctrl+S to save • Ctrl+/ to comment
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onRun}
            disabled={isRunning || isSubmitting || !value.trim()}
            className="btn-secondary"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
