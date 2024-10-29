# LLM Output Comparison Tool

This project provides a web application that allows you to compare the outputs of different LLMs (Large Language Models) on a set of prompts. 

## Features

- **Select Prompts:** Choose from a list of predefined prompts to use as input for the LLMs.
- **Select Models:** Choose from a list of available LLMs (currently using the `ollama` library).
- **Generate Outputs:** Submit the selected prompts and models to generate outputs from each LLM.
- **View Outputs:** The application displays the outputs of each LLM, organized by model and prompt.
- **Clear Outputs:** Clears the old responses from the page every time the "Submit" button is clicked.
- **Abort Requests:** Includes an "Abort" button to cancel the LLM request in progress.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/emincangencer/llm-compare.git
   ```
2. **Install dependencies:**
   ```bash
   cd emincangencer/llm-compare
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Access the application:**
   Open your browser and navigate to `http://localhost:5173/`.

## Configuration

- **Prompts:** The prompts are defined in the `prompts.json` file. You can modify this file to add or remove prompts.
- **Models:** The application automatically detects the available LLMs using the `ollama` library. You can configure the `ollama` settings in your code.

## Technologies

- React
- TypeScript
- Vite
- ollama

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
