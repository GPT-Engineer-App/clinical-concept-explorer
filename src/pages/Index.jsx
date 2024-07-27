import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://ii.nlm.nih.gov/metamaplite/rest/annotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: new URLSearchParams({
          inputtext: inputText,
          docformat: "freetext",
          resultformat: "json",
          apiKey: "ea95a1ba-a529-42af-a2d4-468363f4e3f7"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Clinical Named Entity Extraction</h1>
      </header>
      <main>
        <div className="mb-6">
          <label htmlFor="clinicalText" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Clinical Text
          </label>
          <Textarea
            id="clinicalText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full"
            rows={6}
            placeholder="Enter clinical text here..."
          />
        </div>
        <div className="text-center mb-8">
          <Button onClick={handleSubmit} disabled={isLoading || !inputText.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Extract Entities"
            )}
          </Button>
        </div>
        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}
        <div className="results-area">
          {results.length > 0 ? (
            results.map((result, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{result.matchedtext}</h3>
                  {result.evlist.map((ev, evIndex) => (
                    <div key={evIndex} className="mb-2">
                      <p><strong>CUI:</strong> {ev.conceptinfo.cui}</p>
                      <p><strong>Name:</strong> {ev.conceptinfo.preferredname}</p>
                      <p><strong>Position:</strong> {result.start}-{result.start + result.length}</p>
                      <p><strong>Semantic Types:</strong> {ev.conceptinfo.semantictypes.join(", ")}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No results to display. Enter clinical text and click "Extract Entities" to begin.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;