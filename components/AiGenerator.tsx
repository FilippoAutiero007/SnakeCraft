import React, { useState } from 'react';
import { ArrowLeft, Loader, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AiGeneratorProps {
  onBack: () => void;
}

export const AiGenerator: React.FC<AiGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
             // @ts-ignore
             if (window.aistudio.openSelectKey) {
                 // @ts-ignore
                 await window.aistudio.openSelectKey();
             }
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: imageSize
                }
            }
        });

        let imgData = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imgData = part.inlineData.data;
                    break;
                }
            }
        }
        
        if (imgData) {
            setGeneratedImage(`data:image/png;base64,${imgData}`);
        } else {
            console.error("No image data found in response", response);
        }

    } catch (e) {
        console.error("Generation failed", e);
        // @ts-ignore
        if (e.message && e.message.includes("Requested entity was not found") && window.aistudio && window.aistudio.openSelectKey) {
             // @ts-ignore
             await window.aistudio.openSelectKey();
        }
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative z-20">
      <div className="w-full max-w-4xl h-full md:h-[90vh] bg-[#1a1a1a] md:rounded-3xl border border-white/10 overflow-hidden flex flex-col animate-slide-up shadow-2xl">
        <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-md shrink-0">
            <button onClick={onBack} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">AI STUDIO</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-[#1a1a1a] to-black flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Image Description</label>
                <textarea 
                    id="ai-prompt"
                    name="prompt"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none h-32"
                    placeholder="Describe a snake skin, a fantasy world background, or an item..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Quality / Size</label>
                <div className="grid grid-cols-3 gap-4">
                    {(['1K', '2K', '4K'] as const).map(size => (
                        <button 
                            key={size}
                            onClick={() => setImageSize(size)}
                            className={`py-3 rounded-xl font-bold border transition-all ${imageSize === size ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-black text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isGenerating ? <Loader className="animate-spin" /> : <Sparkles />}
                {isGenerating ? 'GENERATING...' : 'GENERATE ASSET'}
            </button>

            {generatedImage && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group bg-black/50 aspect-video flex items-center justify-center">
                    <img src={generatedImage} alt="Generated Asset" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">Download</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};