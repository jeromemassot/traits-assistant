const API_BASE_URL = import.meta.env.API_BASE_URL;

export const search = async (query: string, type: 'species' | 'phylo', isScientific: boolean): Promise<any> => {
    const API_URL = `${API_BASE_URL}/api/search`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, type, isScientific }),
        });

        console.log("Query to Firstore: ", JSON.stringify({ query, type, isScientific }))
        console.log("Response from Firestore: ", response)

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend Error:", response.status, data);
            throw new Error(data.message || `Server responded with status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("Firestore Service Error:", error);
        const message = error instanceof Error ? error.message : "An unknown network error occurred.";
        throw new Error(`Sorry, I encountered an error. ${message}`);
    }
};
