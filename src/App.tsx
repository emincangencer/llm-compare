import { useState, useEffect } from 'react';
import './App.css';
import ollama from 'ollama'; 
import ReactMarkdown from 'react-markdown'; 

interface Prompt {
  id: string;
  name: string; 
  text: string;
}

interface LLMOutput {
  id: string; 
  modelName: string;
  promptText: string;
  text: string[]; 
}

interface Model {
  id: string;
  name: string;
}

function App() {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [llmOutputs, setLLMOutputs] = useState<LLMOutput[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [outputCounter, setOutputCounter] = useState(0); 

  useEffect(() => {
    const fetchPrompts = async () => {
      const promptsData: Prompt[] = [];
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      const promptFiles = manifest.prompts;

      for (const file of promptFiles) {
        try {
          const response = await fetch(`/prompts/${file}`); 
          if (!response.ok) throw new Error(`Failed to fetch ${file}`);
          const text = await response.text();
          promptsData.push({ id: file.replace('.md', ''), name: file, text });
        } catch (error) {
          console.error(error);
        }
      }
      setPrompts(promptsData);
    };

    fetchPrompts();

    ollama.list().then((modelList) => {
      if (modelList && modelList.models && Array.isArray(modelList.models)) {
        const modelsData = modelList.models.map((model: any) => ({
          id: model.name,
          name: model.name,
        }));
        setModels(modelsData);
      } else {
        console.error("Error: modelList is not in the expected format", modelList);
      }
    });
  }, []);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'prompt' | 'model') => {
    const selectedIds = Array.from(e.target.selectedOptions).map((option) => option.value);
    if (type === 'prompt') {
      setSelectedPrompts(selectedIds);
    } else {
      setSelectedModels(selectedIds);
    }
  };

  const handleSubmit = async () => {
    if (selectedPrompts.length === 0 || selectedModels.length === 0) {
      return;
    }

    setIsLoading(true);
    setLLMOutputs([]); 
    const newLLMOutputs: LLMOutput[] = []; 

    try {
      for (const modelId of selectedModels) {
        const model = models.find(m => m.id === modelId);
        if (!model) continue;
        for (const promptId of selectedPrompts) {
          const prompt = prompts.find(p => p.id === promptId);
          if (!prompt) continue;
          const response = await ollama.chat({
            model: model.id,
            messages: [{ role: 'user', content: prompt.text }],
          });

          setOutputCounter((prev) => prev + 1); 
          const paragraphs = response.message.content.split('\n\n');
          newLLMOutputs.push({
            id: `${model.id}-${outputCounter}`, 
            modelName: model.name,
            promptText: prompt.text,
            text: paragraphs, 
          });
        }
      }
      setLLMOutputs(newLLMOutputs); 
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App"> 
      <h1 className="center-text">LLM Output Comparison</h1>
      <div className="center-content">
        <div className="select-container">
          <div>
            <h2 className="center-text">Prompts</h2>
            <select multiple onChange={(e) => handleSelectionChange(e, 'prompt')}>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name} 
                </option>
              ))}
            </select>
          </div>
          <div>
            <h2 className="center-text">Models</h2>
            <select multiple onChange={(e) => handleSelectionChange(e, 'model')}>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={selectedPrompts.length === 0 || selectedModels.length === 0 || isLoading}>
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>
      <div> 
        <h2 className="center-text">Outputs</h2>
        {selectedModels.map((modelId, modelIndex) => {
          const model = models.find(m => m.id === modelId);
          if (!model) return null;
          return (
            <div key={model.id}>
              <h3 className="center-text">{model.name}</h3>
              {llmOutputs.filter(output => output.modelName === model.name).map((output) => (
                <div key={output.id} className="output-container"> 
                  <div><strong>Prompt:</strong> 
                    {output.promptText.split('\n\n').map((paragraph, index) => (
                      <ReactMarkdown key={index} children={paragraph}  /> 
                    ))}
                  </div>
                  <hr /> 
                  <div>
                    {output.text.map((paragraph, index) => (
                      <ReactMarkdown key={index} children={paragraph} />
                    ))}
                  </div>
                </div>
              ))}
              {modelIndex < selectedModels.length - 1 && <hr />} 
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App; 
