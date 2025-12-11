import{G as m}from"./index-DiBihr-9.js";const x=async(s,r,t=[],o=10,n="Spanish")=>{if(!s)throw new Error("API Key is required");let a=[];Array.isArray(t)?a=t:typeof t=="string"&&t?a=[{topic:t,count:o}]:a=[{topic:"General Evaluation",count:o}];const l=new m(s);l.getGenerativeModel({model:"gemini-1.5-flash"});const d=a.reduce((e,u)=>e+(u.count||5),0),i=`
    You are an expert exam creator.
    Generate a total of approx ${d} multiple-choice questions based on the provided text.
    
    **TASK:** You must generate a specific set of questions for EACH of the following topics:
    
    ${a.map(e=>`- TOPIC: "${e.topic}" (Generate exactly ${e.count} questions)`).join(`
`)}
    
    **CRITICAL RULES:**
    1.  **Format**: Return ONLY a SINGLE valid JSON array containing ALL questions.
    2.  **Structure**:
        [
          {
            "epigrafe": "[Exact Topic Name from the list]",
            "question": "Question?",
            "options": ["A", "B", "C"],
            "answer": 0,
            "explanation": "Exp"
          },
          ...
        ]
    3.  **Strictness**: Stick strictly to the "epigrafe" requests. If I asked for 5 questions for "Topic A", output 5 objects with "epigrafe": "Topic A".
    4.  **Quantity**: The array length must be exactly the sum of requested counts (${d}).
    5.  **Language**: Output ALL content (questions, options, explanations) in ${n}.
    
    CONTEXT TEXT:
    ${r.substring(0,5e4)}
  `,c="gemini-1.5-flash";try{console.log(`Attempting fast path with: ${c}`);const A=(await l.getGenerativeModel({model:c}).generateContent(i)).response;return JSON.parse(A.text().replace(/```json/g,"").replace(/```/g,"").trim())}catch(e){console.warn("Fast path failed, switching to Smart Auto-Discovery...",e.message)}let g=[];try{g=(await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${s}`)).json()).models||[]}catch{throw new Error("No se pudo conectar con Google para ver tus modelos. Revisa tu conexión.")}const p=g.map(e=>e.name.replace("models/","")).filter(e=>e.includes("gemini"));if(p.length===0)throw new Error("Tu API Key es válida pero no tiene acceso a ningún modelo Gemini. Verifica tu proyecto de Google Cloud.");console.log("Found available models:",p);let h=null;for(const e of p)if(!(e.includes("vision")||e.includes("embedding")))try{console.log(`Auto-trying available model: ${e}`);const E=(await l.getGenerativeModel({model:e}).generateContent(i)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(E)}catch(u){console.warn(`Failed with ${e}`,u.message),h=u}throw new Error(`No se pudo generar con ninguno de tus modelos (${p.length} probados). Error: ${h?.message}`)},f=async(s,r)=>{const t=["gemini-1.5-flash","gemini-1.5-pro","gemini-1.5-flash-8b","gemini-2.0-flash-exp","gemini-pro"];for(const o of t)try{return await s.getGenerativeModel({model:o}).generateContent(r)}catch{}throw new Error("No model available for analysis.")},y=async(s,r)=>{const t=r.substring(0,15e3);let o;const n=[],a=/(\d+(?:\.\d+)*\.?)\s+([^0-9\n\r]+?)(?=\s*\d+(?:\.\d+)*\.?|\s*$)/g;for(;(o=a.exec(t))!==null;){const i=o[1].trim(),c=o[2].trim();if(c.length>3&&c.length<150){const p=i.split(".").length-1<2?10:5;n.push({topic:`${i} ${c}`,count:p})}}if(n.length>5)return console.log("Regex Index Detection Successful:",n.length,"topics found."),n;console.log("Regex failed (too few topics), falling back to Gemini...");const l=new m(s),d=`
    Analyze the provided text.
    **CRITICAL TASK:** Extract the Table of Contents (Index) VERY PRECISELY.
    
    **OBSERVATION:** The user's index is formatted as "Dense Blocks". 
    Multiple topics are compacted into SINGLE LINES.
    
    **EXAMPLE FROM TEXT:**
    "1. MARCO NORMATIVO 1.1. ORGANIZACIÓN... 1.1.1. EL CONVENIO..."
    
    **YOUR JOB:**
    You must programmatically SPLIT these lines by looking for the Numbering Patterns (1., 1.1, 1.1.1, etc.).
    Every time you see a number followed by a dot (e.g. " 1.2. " or " 3.1.5. "), that is a NEW TOPIC.
    
    **OUTPUT REQUIREMENT:**
    Expand these dense lines into a full vertical JSON list.
    
    RETURN ONLY A VALID JSON ARRAY:
    [
      { "topic": "1. MARCO NORMATIVO", "count": 10 },
      { "topic": "1.1. ORGANIZACIÓN DE AVIACIÓN CIVIL INTERNACIONAL (OACI)", "count": 10 },
      { "topic": "1.1.1. EL CONVENIO DE CHICAGO", "count": 5 },
      { "topic": "1.1.2. ACUERDO DE LA SEGUNDA LIBERTAD", "count": 5 },
      ...
    ]
    
    TEXT START:
    ${r.substring(0,4e4)}
  `;try{const g=(await f(l,d)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(g)}catch(i){return console.error("Topic Analysis Failed:",i),[{topic:"General Content",count:15}]}},O=async s=>{try{return((await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${s}`)).json()).models||[]).map(o=>o.name)}catch(r){return["Error conectando: "+r.message]}},R=async(s,r)=>{const t=new m(s),o=`
    Analyze the provided text deeply to discover its internal structure.
    **GOAL:** Create a comprehensive Table of Contents (Index) for this document.
    
    **STRATEGY:**
    1.  **Look for Explicit Numbering**: Chapters like "1.", "1.1.", "2." are the strongest signal.
    2.  **Look for Implicit Headers**: If no numbering exists, look for ALL CAPS LINES, lines surrounded by whitespace, or short bold-like lines that introduce new topics.
    3.  **Ignore Noise**: Do not include page numbers, running headers (like "Chapter 1... Chapter 1..."), or random fragments as topics.
    
    **OUTPUT FORMAT:**
    Return ONLY a valid JSON array.
    Example:
    [
      { "topic": "1. Introduction to the Legal Framework", "count": 10 },
      { "topic": "2. The Concept of Liability", "count": 15 },
      { "topic": "2.1. Strict Liability vs. Negligence", "count": 5 },
      { "topic": "3. Case Studies and Examples", "count": 10 }
    ]
    
    **ESTIMATION RULE:**
    -   Assign "count": 15 for Main Chapters (dense, long text).
    -   Assign "count": 5 for Sub-chapters (short sections).
    
    TEXT START:
    ${r.substring(0,5e4)}
  `;try{const l=(await f(t,o)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(l)}catch(n){throw console.error("Structural Index Generation Failed:",n),new Error("No se pudo generar el índice inteligente: "+n.message)}};export{y as analyzeTopics,x as generateQuestions,R as generateStructuralIndex,O as validateModels};
