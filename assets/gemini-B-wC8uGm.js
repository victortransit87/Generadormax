import{G as m}from"./index-BC74xVhU.js";const R=async(n,a,s=[],i=10,o="Spanish")=>{if(!n)throw new Error("API Key is required");let r=[];Array.isArray(s)?r=s:typeof s=="string"&&s?r=[{topic:s,count:i}]:r=[{topic:"General Evaluation",count:i}];const c=new m(n);c.getGenerativeModel({model:"gemini-1.5-flash"});const d=r.reduce((e,u)=>e+(u.count||5),0),t=`
    You are an expert exam creator.
    Generate a total of approx ${d} multiple-choice questions based on the provided text.
    
    **TASK:** You must generate a specific set of questions for EACH of the following topics:
    
    ${r.map(e=>`- TOPIC: "${e.topic}" (Generate exactly ${e.count} questions)`).join(`
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
    5.  **Language**: Output ALL content (questions, options, explanations) in ${o}.
    
    CONTEXT TEXT:
    ${a.substring(0,5e4)}
  `,l="gemini-1.5-flash";try{console.log(`Attempting fast path with: ${l}`);const f=(await c.getGenerativeModel({model:l}).generateContent(t)).response;return JSON.parse(f.text().replace(/```json/g,"").replace(/```/g,"").trim())}catch(e){console.warn("Fast path failed, switching to Smart Auto-Discovery...",e.message)}let p=[];try{p=(await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${n}`)).json()).models||[]}catch{throw new Error("No se pudo conectar con Google para ver tus modelos. Revisa tu conexión.")}const g=p.map(e=>e.name.replace("models/","")).filter(e=>e.includes("gemini"));if(g.length===0)throw new Error("Tu API Key es válida pero no tiene acceso a ningún modelo Gemini. Verifica tu proyecto de Google Cloud.");console.log("Found available models:",g);let h=null;for(const e of g)if(!(e.includes("vision")||e.includes("embedding")))try{console.log(`Auto-trying available model: ${e}`);const E=(await c.getGenerativeModel({model:e}).generateContent(t)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(E)}catch(u){console.warn(`Failed with ${e}`,u.message),h=u}throw new Error(`No se pudo generar con ninguno de tus modelos (${g.length} probados). Error: ${h?.message}`)},A=async(n,a,s)=>{const i=["gemini-1.5-flash","gemini-1.5-pro","gemini-1.5-flash-8b","gemini-2.0-flash-exp","gemini-pro"];let o=null;for(const r of i)try{return await a.getGenerativeModel({model:r}).generateContent(s)}catch(c){o=c}console.warn("Fast models failed. Auto-discovering models for this key...");try{const d=((await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${n}`)).json()).models||[]).map(t=>t.name.replace("models/","")).filter(t=>t.includes("gemini")&&!t.includes("vision")&&!t.includes("embedding"));if(d.length===0)throw new Error("Key valid but API returns no text models.");for(const t of d)try{return console.log(`Trying discovered model: ${t}`),await a.getGenerativeModel({model:t}).generateContent(s)}catch(l){o=l}}catch(r){console.error("Auto-discovery failed:",r)}throw new Error(`No model available for analysis. Last error: ${o?.message}`)},N=async(n,a)=>{const s=a.substring(0,15e3);let i;const o=[],r=/(\d+(?:\.\d+)*\.?)\s+([^0-9\n\r]+?)(?=\s*\d+(?:\.\d+)*\.?|\s*$)/g;for(;(i=r.exec(s))!==null;){const t=i[1].trim(),l=i[2].trim();if(l.length>3&&l.length<150){const g=t.split(".").length-1<2?10:5;o.push({topic:`${t} ${l}`,count:g})}}if(o.length>5)return console.log("Regex Index Detection Successful:",o.length,"topics found."),o;console.log("Regex failed (too few topics), falling back to Gemini...");const c=new m(n),d=`
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
    ${a.substring(0,4e4)}
  `;try{const p=(await A(n,c,d)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(p)}catch(t){return console.error("Topic Analysis Failed:",t),[{topic:"General Content",count:15}]}},w=async n=>{try{return((await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${n}`)).json()).models||[]).map(i=>i.name)}catch(a){return["Error conectando: "+a.message]}},O=async(n,a)=>{const s=new m(n),i=`
    Analyze the provided text deeply.
    **GOAL:** Create a comprehensive and LOGICAL Table of Contents (Index) based on the *semantic content flow*.
    
    **CRITICAL INSTRUCTION:** 
    Do NOT just look for bold lines or existing headers. 
    Act as a **Human Editor**: Read the text, understand what topics are discussed, and CREATE titles for them if they are missing or unclear.
    
    **STRATEGY:**
    1.  **Analyze Content Density**: If a block of text (approx 500+ words) discusses a specific concept (e.g. "Aerodynamics"), create a topic "1. Aerodynamics" even if there is no explicit header.
    2.  **Ignore Bad Formatting**: The text might be unstructured. Your job is to STRUCTURE it.
    3.  **Hierarchy**: Group related concepts. Use 1, 1.1, 1.2 structure to show depth.
    4.  **Titles**: Use professional, descriptive titles. (e.g. instead of "Part 1", use "1. Introduction to AI").
    
    **OUTPUT FORMAT:**
    Return ONLY a valid JSON array:
    [
      { "topic": "1. Introduction to the Subject", "count": 10 },
      { "topic": "2. Main Theoretical Concepts", "count": 15 },
      { "topic": "2.1. Concept A: Definitions", "count": 5 },
      { "topic": "2.2. Concept B: Applications", "count": 5 }
    ]
    
    **ESTIMATION RULE:**
    -   "count": 15 for major topics (dense content).
    -   "count": 5 for sub-topics.
    
    TEXT START:
    ${a.substring(0,5e4)}
  `;try{const c=(await A(n,s,i)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(c)}catch(o){throw console.error("Structural Index Generation Failed:",o),new Error("No se pudo generar el índice inteligente: "+o.message)}};export{N as analyzeTopics,R as generateQuestions,O as generateStructuralIndex,w as validateModels};
