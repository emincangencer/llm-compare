import { useState, useEffect } from 'react';
import './App.css';
import ollama from 'ollama'; // Changed import

interface Prompt {
  id: string;
  text: string;
}

interface LLMOutput {
  id: string; // Changed to a unique identifier
  modelName: string;
  promptText: string;
  text: string[]; // Changed to an array of strings
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
  // const [currentOutput, setCurrentOutput] = useState<string>(""); // Removed
  const [outputCounter, setOutputCounter] = useState(0); // Added counter for unique IDs

  useEffect(() => {
    fetch('/prompts.json')
      .then((response) => response.json())
      .then((data) => setPrompts(data));

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

  const handlePromptSelect = (promptId: string) => {
    if (selectedPrompts.includes(promptId)) {
      setSelectedPrompts(selectedPrompts.filter((p) => p !== promptId));
    } else {
      setSelectedPrompts([...selectedPrompts, promptId]);
    }
  };

  const handleModelSelect = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((m) => m !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedPrompts.length === 0 || selectedModels.length === 0) {
      return;
    }

    setIsLoading(true);
    setLLMOutputs([]); // Reset the output state to clear old responses
    const newLLMOutputs: LLMOutput[] = []; // Create a new array

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

          setOutputCounter((prev) => prev + 1); // Increment counter
          // Split the response into paragraphs
          const paragraphs = response.message.content.split('\n\n');
          newLLMOutputs.push({
            id: `${model.id}-${outputCounter}`, // Generate unique ID
            modelName: model.name,
            promptText: prompt.text,
            text: paragraphs, // Store paragraphs in the array
          });
        }
      }
      setLLMOutputs(newLLMOutputs); // Update the state with the new array
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>LLM Output Comparison</h1>
      <div>
        <h2>Prompts</h2>
        <select multiple onChange={(e) => {
          const selectedPromptIds = Array.from(e.target.selectedOptions).map((option) => option.value);
          setSelectedPrompts(selectedPromptIds);
        }}>
          {prompts.map((prompt) => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.text}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h2>Models</h2>
        <select multiple onChange={(e) => {
          const selectedModelIds = Array.from(e.target.selectedOptions).map((option) => option.value);
          setSelectedModels(selectedModelIds);
        }}>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
      {/* <div>
        <h2>Output</h2> 
        <pre>{currentOutput}</pre> 
      </div> */} {/* Removed */}
      {llmOutputs.length > 0 && (
        <div>
          <h2>Outputs</h2>
          {selectedModels.map((modelId) => {
            const model = models.find(m => m.id === modelId);
            if (!model) return null;
            return (
              <div key={model.id}>
                <h3>{model.name}</h3>
                {llmOutputs.filter(output => output.modelName === model.name).map((output) => (
                  <div key={output.id}>
                    <p><strong>Prompt:</strong> {output.promptText}</p>
                    {output.text.map((paragraph, index) => (
                      <p key={index} style={{textAlign: 'left'}}>{paragraph}</p> // Added style to remove justification
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
