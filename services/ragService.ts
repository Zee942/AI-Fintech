import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";

let vectorStore: MemoryVectorStore | null = null;
let embeddings: GoogleGenerativeAIEmbeddings | null = null;

// Create a singleton getter for the Embeddings model to lazy-load it
const getEmbeddings = (): GoogleGenerativeAIEmbeddings => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    if (!embeddings) {
        embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.API_KEY,
            model: "text-embedding-004", // A powerful and efficient model for embeddings
        });
    }
    return embeddings;
};


// Create a singleton instance of the Vector Store to avoid re-creating it on every call.
// It now accepts the rules as a parameter, which will be used on the first call.
const getVectorStore = async (rules: Array<{ text: string, ruleId: string, category: string }>): Promise<MemoryVectorStore> => {
    if (!vectorStore) {
        console.log("Creating vector store for the first time...");
        // Prepare the documents just-in-time inside the lazy-loaded function
        const documents = rules.map(rule => new Document({
            pageContent: rule.text,
            metadata: { ruleId: rule.ruleId, category: rule.category },
        }));
        const embeddingsInstance = getEmbeddings();
        vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddingsInstance);
        console.log("Vector store created successfully.");
    }
    return vectorStore;
};

/**
 * Retrieves the most relevant regulatory rules from the vector store
 * based on the content of the startup's documents.
 * @param query The combined text of the startup's documents.
 * @param rules The list of QCB rules to populate the vector store with on first run.
 * @returns A promise that resolves to an array of relevant Document objects.
 */
export const retrieveRelevantRules = async (query: string, rules: Array<{ text: string, ruleId: string, category: string }>): Promise<Document[]> => {
    try {
        const store = await getVectorStore(rules);
        // Retrieve the top 4 most relevant documents. This number can be tuned.
        const relevantDocs = await store.similaritySearch(query, 4);
        console.log("Retrieved relevant documents:", relevantDocs);
        return relevantDocs;
    } catch (error) {
        console.error("Error during similarity search in RAG service:", error);
        // Return empty array on error to allow the main process to continue
        return [];
    }
};