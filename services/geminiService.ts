import { GoogleGenAI, Type } from "@google/genai";
import { Story } from '../types';

// Initialize Gemini Client
// Note: process.env.API_KEY is assumed to be available as per instructions.
console.log('[geminiService] Initializing Gemini client');
console.log('[geminiService] API_KEY check:', {
  hasAPI_KEY: !!process.env.API_KEY,
  apiKeyLength: process.env.API_KEY?.length || 0,
  apiKeyPreview: process.env.API_KEY ? `${process.env.API_KEY.substring(0, 10)}...` : 'undefined'
});

if (!process.env.API_KEY) {
  console.error('[geminiService] ERROR: API_KEY is not defined! Please set GEMINI_API_KEY in .env file');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStory = async (topic: string): Promise<Story> => {
  console.log('[geminiService] generateStory called with topic:', topic);
  const modelName = 'gemini-3-flash-preview';
  console.log('[geminiService] Using model:', modelName);

  try {
    console.log('[geminiService] Sending request to Gemini API...');
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Generate a short story (5-7 sentences) about "${topic}". 
      The story should be simple, suitable for an English learner (CEFR B1 level). 
      For each sentence, identify ONE key vocabulary word to test.
      
      Return a JSON object with:
      - title: Story title
      - sentences: Array of objects, each containing:
        - english: Full English sentence.
        - korean: Full Korean translation.
        - targetWordEnglish: The key word from the English sentence (exactly as written in the english sentence).
        - targetWordKorean: The corresponding Korean translation of that specific key word (exactly as written in the korean sentence).
      `,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4000, // Increased to prevent truncation
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy title for the story" },
            sentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  korean: { type: Type.STRING },
                  targetWordEnglish: { type: Type.STRING, description: "The word to hide in the english sentence" },
                  targetWordKorean: { type: Type.STRING, description: "The corresponding word to underline in the korean sentence" },
                }
              }
            }
          }
        }
      }
    });

    console.log('[geminiService] Response received from API');
    console.log('[geminiService] Response object keys:', Object.keys(response));
    console.log('[geminiService] Response type:', typeof response);
    
    // Check response structure - Google GenAI SDK might have different response format
    let jsonText: string;
    
    try {
      // Try direct access first (most common case)
      jsonText = response.text as string;
      
      // If text is not available, try alternative structures
      if (!jsonText && (response as any).response?.text) {
        jsonText = (response as any).response.text;
      } else if (!jsonText && (response as any).candidates?.[0]?.content?.parts?.[0]?.text) {
        jsonText = (response as any).candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.error('[geminiService] Error accessing response.text:', e);
      // Try alternative access methods
      if ((response as any).response?.text) {
        jsonText = (response as any).response.text;
      } else if ((response as any).candidates?.[0]?.content?.parts?.[0]?.text) {
        jsonText = (response as any).candidates[0].content.parts[0].text;
      } else {
        console.error('[geminiService] ERROR: Unable to extract text from response');
        console.error('[geminiService] Full response object:', response);
        throw new Error("Unable to extract text from API response. Response structure may have changed.");
      }
    }
    
    if (!jsonText || jsonText.trim().length === 0) {
      console.error('[geminiService] ERROR: Empty response from AI');
      console.error('[geminiService] Response object:', response);
      throw new Error("Empty response from AI. Please check your API key and try again.");
    }

    console.log('[geminiService] Raw response length:', jsonText.length, 'characters');
    console.log('[geminiService] Raw response preview (first 200 chars):', jsonText.substring(0, 200));
    console.log('[geminiService] Raw response preview (last 200 chars):', jsonText.substring(Math.max(0, jsonText.length - 200)));

    // Sanitize JSON string to handle potential markdown fences
    jsonText = jsonText.trim();
    if (jsonText.startsWith('```json')) {
      console.log('[geminiService] Removing ```json markers');
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (jsonText.startsWith('```')) {
      console.log('[geminiService] Removing ``` markers');
      jsonText = jsonText.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    // Extract JSON from text that may contain extra metadata/descriptions
    // This handles cases where the API returns JSON embedded in explanatory text
    function extractJSON(text: string): string {
      // Strategy 1: Find all positions where JSON objects might start
      // Look for patterns like {"title" or { "title"
      const titlePattern = /["\s]\{[\s]*"title"/g;
      const titleMatches: number[] = [];
      let match;
      while ((match = titlePattern.exec(text)) !== null) {
        // Find the actual start of the object (the { before "title")
        let startPos = match.index;
        while (startPos > 0 && text[startPos] !== '{') {
          startPos--;
        }
        if (text[startPos] === '{') {
          titleMatches.push(startPos);
        }
      }
      
      // Also check for standalone { followed by "title"
      const standalonePattern = /\{"title"/g;
      while ((match = standalonePattern.exec(text)) !== null) {
        if (!titleMatches.includes(match.index)) {
          titleMatches.push(match.index);
        }
      }
      
      // Try to extract and parse JSON starting from each potential position
      // Start from the end (usually the most complete JSON)
      titleMatches.sort((a, b) => b - a);
      
      for (const startPos of titleMatches) {
        // Try to extract a complete JSON object starting from this position
        let braceDepth = 0;
        let bracketDepth = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;
        
        for (let i = startPos; i < text.length; i++) {
          const char = text[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            continue;
          }
          
          if (inString) {
            continue;
          }
          
          if (char === '{') {
            braceDepth++;
          } else if (char === '}') {
            braceDepth--;
            if (braceDepth === 0 && bracketDepth === 0) {
              jsonEnd = i + 1;
              break;
            }
          } else if (char === '[') {
            bracketDepth++;
          } else if (char === ']') {
            bracketDepth--;
          }
        }
        
        if (jsonEnd > startPos) {
          const candidate = text.substring(startPos, jsonEnd);
          try {
            const parsed = JSON.parse(candidate);
            // Check if it has the expected structure
            if (parsed.title && parsed.sentences && Array.isArray(parsed.sentences)) {
              console.log('[geminiService] Found valid JSON object with expected structure at position', startPos);
              return candidate;
            }
          } catch (e) {
            // Continue to next candidate
          }
        }
      }
      
      // Strategy 2: If pattern matching didn't work, find all JSON objects
      // by tracking braces and brackets from the beginning
      const jsonCandidates: Array<{ start: number; end: number; text: string }> = [];
      let braceDepth2 = 0;
      let bracketDepth2 = 0;
      let inString2 = false;
      let escapeNext2 = false;
      let jsonStart2 = -1;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (escapeNext2) {
          escapeNext2 = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext2 = true;
          continue;
        }
        
        if (char === '"') {
          inString2 = !inString2;
          continue;
        }
        
        if (inString2) {
          continue;
        }
        
        if (char === '{') {
          if (braceDepth2 === 0 && bracketDepth2 === 0) {
            jsonStart2 = i;
          }
          braceDepth2++;
        } else if (char === '}') {
          braceDepth2--;
          if (braceDepth2 === 0 && bracketDepth2 === 0 && jsonStart2 >= 0) {
            const candidate = text.substring(jsonStart2, i + 1);
            // Check if it looks like our expected JSON structure
            if (candidate.includes('"title"') && candidate.includes('"sentences"')) {
              jsonCandidates.push({ start: jsonStart2, end: i + 1, text: candidate });
            }
            jsonStart2 = -1;
          }
        } else if (char === '[') {
          bracketDepth2++;
        } else if (char === ']') {
          bracketDepth2--;
        }
      }
      
      // Try to parse each candidate, starting from the last one
      for (let i = jsonCandidates.length - 1; i >= 0; i--) {
        const candidate = jsonCandidates[i];
        try {
          const parsed = JSON.parse(candidate.text);
          if (parsed.title && parsed.sentences && Array.isArray(parsed.sentences)) {
            console.log('[geminiService] Found valid JSON object at position', candidate.start);
            return candidate.text;
          }
        } catch (e) {
          // Continue to next candidate
        }
      }
      
      // Strategy 3: If we found JSON candidates but couldn't parse them, return the last one
      // The error handling below will try to fix it
      if (jsonCandidates.length > 0) {
        const lastCandidate = jsonCandidates[jsonCandidates.length - 1];
        console.log('[geminiService] Extracted JSON object from response (will attempt to fix)');
        return lastCandidate.text;
      }
      
      // If all else fails, return the original text
      console.warn('[geminiService] Could not extract JSON, using original text');
      return text;
    }
    
    // Extract JSON from the response text
    const originalLength = jsonText.length;
    jsonText = extractJSON(jsonText);
    if (jsonText.length < originalLength) {
      console.log('[geminiService] Extracted JSON from response (reduced from', originalLength, 'to', jsonText.length, 'characters)');
    }

    // Check for common JSON issues
    const openBraces = (jsonText.match(/\{/g) || []).length;
    const closeBraces = (jsonText.match(/\}/g) || []).length;
    const openBrackets = (jsonText.match(/\[/g) || []).length;
    const closeBrackets = (jsonText.match(/\]/g) || []).length;
    console.log('[geminiService] JSON structure check:', {
      openBraces,
      closeBraces,
      openBrackets,
      closeBrackets,
      balanced: openBraces === closeBraces && openBrackets === closeBrackets
    });

    // Try to find and fix common issues
    // Check for unclosed strings near the error position
    if (jsonText.length > 5089) {
      const errorRegion = jsonText.substring(Math.max(0, 5080), Math.min(jsonText.length, 5100));
      console.log('[geminiService] Error region (position 5080-5100):', errorRegion);
      console.log('[geminiService] Character codes around error:', 
        Array.from(errorRegion).map((c, i) => `${5080 + i}: '${c}' (${c.charCodeAt(0)})`).join(', '));
    }

    console.log('[geminiService] Parsing JSON response...');
    let data: Omit<Story, 'topic'>;
    try {
      data = JSON.parse(jsonText) as Omit<Story, 'topic'>;
    } catch (parseError) {
      console.error('[geminiService] JSON parse error details:', parseError);
      if (parseError instanceof SyntaxError) {
        // Try to extract more information about the error
        const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || '0');
        if (errorPos > 0) {
          const contextStart = Math.max(0, errorPos - 50);
          const contextEnd = Math.min(jsonText.length, errorPos + 50);
          const errorContext = jsonText.substring(contextStart, contextEnd);
          console.error('[geminiService] Error context (position', errorPos, '):', errorContext);
          console.error('[geminiService] Character at error position:', jsonText[errorPos], 'code:', jsonText.charCodeAt(errorPos));
        }
        
        // Try to fix common issues: unclosed strings, unescaped quotes
        console.log('[geminiService] Attempting to fix JSON...');
        let fixedJson = jsonText;
        
        // Check if response might be truncated
        if (errorPos >= fixedJson.length - 10) {
          console.warn('[geminiService] Error near end of response - response may be truncated');
          console.warn('[geminiService] Response might have been cut off. Consider increasing maxOutputTokens.');
        }
        
        // Try to find and fix unclosed strings
        // Look for the last complete JSON structure
        let lastValidJson = '';
        let braceDepth = 0;
        let bracketDepth = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < fixedJson.length; i++) {
          const char = fixedJson[i];
          
          if (escapeNext) {
            escapeNext = false;
            lastValidJson += char;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            lastValidJson += char;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            lastValidJson += char;
            continue;
          }
          
          if (inString) {
            lastValidJson += char;
            continue;
          }
          
          if (char === '{') {
            braceDepth++;
            lastValidJson += char;
          } else if (char === '}') {
            braceDepth--;
            lastValidJson += char;
            // If we've closed all braces and brackets, this might be a valid JSON
            if (braceDepth === 0 && bracketDepth === 0 && i < errorPos) {
              // Try to parse what we have so far
              try {
                const partialJson = fixedJson.substring(0, i + 1);
                const parsed = JSON.parse(partialJson);
                console.log('[geminiService] Found valid JSON ending at position', i);
                fixedJson = partialJson;
                break;
              } catch (e) {
                // Continue searching
              }
            }
          } else if (char === '[') {
            bracketDepth++;
            lastValidJson += char;
          } else if (char === ']') {
            bracketDepth--;
            lastValidJson += char;
          } else {
            lastValidJson += char;
          }
        }
        
        // Try parsing again with the fixed JSON
        try {
          data = JSON.parse(fixedJson) as Omit<Story, 'topic'>;
          console.log('[geminiService] Successfully parsed after fix attempt');
        } catch (retryError) {
          console.error('[geminiService] Failed to fix JSON');
          console.error('[geminiService] Full JSON response (first 1000 chars):', jsonText.substring(0, 1000));
          console.error('[geminiService] Full JSON response (last 1000 chars):', jsonText.substring(Math.max(0, jsonText.length - 1000)));
          throw new Error(`JSON 파싱 오류: ${parseError.message}. 응답이 완전하지 않거나 잘못된 형식일 수 있습니다. API 응답을 확인해주세요.`);
        }
      } else {
        throw parseError;
      }
    }
    console.log('[geminiService] JSON parsed successfully. Story title:', data.title, 'Sentences:', data.sentences?.length);
    
    // Validate the parsed data structure
    if (!data.title || typeof data.title !== 'string') {
      console.error('[geminiService] Invalid or missing title in response');
      throw new Error('API 응답에 제목이 없거나 잘못된 형식입니다.');
    }
    
    if (!data.sentences || !Array.isArray(data.sentences)) {
      console.error('[geminiService] Invalid or missing sentences array in response');
      console.error('[geminiService] Data structure:', JSON.stringify(data, null, 2));
      throw new Error('API 응답에 문장 배열이 없거나 잘못된 형식입니다.');
    }
    
    if (data.sentences.length === 0) {
      console.error('[geminiService] Empty sentences array in response');
      throw new Error('API 응답에 문장이 없습니다.');
    }
    
    // Validate each sentence structure
    for (let i = 0; i < data.sentences.length; i++) {
      const sentence = data.sentences[i];
      if (!sentence || typeof sentence !== 'object') {
        console.error(`[geminiService] Invalid sentence at index ${i}:`, sentence);
        throw new Error(`문장 ${i + 1}번이 잘못된 형식입니다.`);
      }
      
      const requiredFields = ['english', 'korean', 'targetWordEnglish', 'targetWordKorean'];
      for (const field of requiredFields) {
        if (!sentence[field] || typeof sentence[field] !== 'string') {
          console.error(`[geminiService] Missing or invalid field '${field}' in sentence ${i}:`, sentence);
          throw new Error(`문장 ${i + 1}번에 필수 필드 '${field}'가 없거나 잘못된 형식입니다.`);
        }
      }
    }
    
    const result: Story = {
      title: data.title,
      sentences: data.sentences,
      topic
    };
    
    console.log('[geminiService] generateStory completed successfully');
    return result;

  } catch (error) {
    console.error("[geminiService] Gemini Generation Error:", error);
    
    if (error instanceof Error) {
      console.error("[geminiService] Error message:", error.message);
      console.error("[geminiService] Error stack:", error.stack);
      
      // Provide more helpful error messages
      if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('403')) {
        throw new Error("API 인증 오류: API 키를 확인해주세요. .env 파일에 GEMINI_API_KEY를 설정했는지 확인하세요.");
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error("네트워크 오류: 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.");
      } else if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error("API 할당량 초과: API 사용 한도를 확인해주세요.");
      } else if (error.message.includes('model')) {
        throw new Error("모델 오류: 모델 이름을 확인해주세요. 현재 모델: " + modelName);
      }
    }
    
    // If error is not an Error instance, convert it
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`스토리 생성 실패: ${errorMessage}`);
  }
};