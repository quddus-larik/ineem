// CAG PIPELINE (IF IT FITS IN MODEL CONTEXT)
import { ChatGroq } from "@langchain/groq";
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import {
  SystemMessage,
  HumanMessage,
  BaseMessage,
} from "@langchain/core/messages";

const LLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const GraphState = Annotation.Root({
  corpus: Annotation(),
  message: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

async function callModelNode(state) {
  const PROPMT = new SystemMessage(
    `You are an enterprise AI assistant. Answer queries using strictly the provided reference context.\n\n` +
      `__________________ KNOWLEDGE BASE BASELINE ________________\n` +
      `${state.corpus}\n` +
      `_____________________________________________________________`,
  );

  const fullMessage = [PROPMT, ...state.messages];
  const response = await LLM.invoke(fullMessage);

  return {
    messages: [response],
  }
}

const workflow = new StateGraph(GraphState)
  .addNode("agent", callModelNode)
  .addEdge(START, "agent")
  .addEdge("agent", END);

export const CAGProcess = workflow.compile();
