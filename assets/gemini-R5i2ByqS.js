import{G as g}from"./index-CPNm2nni.js";const I=async(n,s,r=null,o=10)=>{if(!n)throw new Error("API Key is required");const t=new g(n);t.getGenerativeModel({model:"gemini-1.5-flash"});const c=`
    You are an expert exam creator.
    Generate exactly ${o} multiple-choice questions based on the provided text.
    ${r?`FOCUS EXCLUSIVELY ON THE TOPIC: "${r}".`:""}
    
    CRITICAL RULES:
    1.  **Format**: Return ONLY a valid JSON array.
    2.  **Structure**:
        [
          {
            "epigrafe": "${r||"General"}",
            "question": "Question?",
            "options": ["A", "B", "C"],
            "answer": 0,
            "explanation": "Exp"
          }
        ]
    3.  **Options**: Exactly 3 (A, B, C). One correct.
    4.  **No Meta-Options**: No "All of the above".
    5.  **Difficulty**: High.
    6.  **Language**: Spanish.
    7.  **Quantity**: Exactly ${o}.
    
    CONTEXT TEXT:
    ${s.substring(0,4e4)}
  `,d="gemini-1.5-flash";try{console.log(`Attempting fast path with: ${d}`);const p=(await t.getGenerativeModel({model:d}).generateContent(c)).response;return JSON.parse(p.text().replace(/```json/g,"").replace(/```/g,"").trim())}catch(e){console.warn("Fast path failed, switching to Smart Auto-Discovery...",e.message)}let u=[];try{u=(await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${n}`)).json()).models||[]}catch{throw new Error("No se pudo conectar con Google para ver tus modelos. Revisa tu conexión.")}const a=u.map(e=>e.name.replace("models/","")).filter(e=>e.includes("gemini"));if(a.length===0)throw new Error("Tu API Key es válida pero no tiene acceso a ningún modelo Gemini. Verifica tu proyecto de Google Cloud.");console.log("Found available models:",a);let i=null;for(const e of a)if(!(e.includes("vision")||e.includes("embedding")))try{console.log(`Auto-trying available model: ${e}`);const h=(await t.getGenerativeModel({model:e}).generateContent(c)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(h)}catch(l){console.warn(`Failed with ${e}`,l.message),i=l}throw new Error(`No se pudo generar con ninguno de tus modelos (${a.length} probados). Error: ${i?.message}`)},m=async(n,s)=>{const r=["gemini-1.5-flash","gemini-1.5-pro","gemini-1.5-flash-8b","gemini-2.0-flash-exp","gemini-pro"];for(const o of r)try{return await n.getGenerativeModel({model:o}).generateContent(s)}catch{}throw new Error("No model available for analysis.")},N=async(n,s)=>{const r=s.substring(0,15e3);let o;const t=[],c=/(\d+(?:\.\d+)*\.?)\s+([^0-9\n\r]+?)(?=\s*\d+(?:\.\d+)*\.?|\s*$)/g;for(;(o=c.exec(r))!==null;){const a=o[1].trim(),i=o[2].trim();if(i.length>3&&i.length<150){const l=a.split(".").length-1<2?10:5;t.push({topic:`${a} ${i}`,count:l})}}if(t.length>5)return console.log("Regex Index Detection Successful:",t.length,"topics found."),t;console.log("Regex failed (too few topics), falling back to Gemini...");const d=new g(n),u=`
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
    ${s.substring(0,4e4)}
  `;try{const e=(await m(d,u)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(e)}catch(a){return console.error("Topic Analysis Failed:",a),[{topic:"General Content",count:15}]}},T=async n=>{try{return((await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${n}`)).json()).models||[]).map(o=>o.name)}catch(s){return["Error conectando: "+s.message]}},f=async(n,s)=>{const r=new g(n),o=`
    Analyze the provided text deeply.
    **GOAL:** Create a comprehensive Table of Contents (Index) for this document, even if one doesn't exist explicitly.
    
    1. Read the content to identify logical sections, chapters, or headers.
    2. Give each section a clear title and a number (1, 1.1, 2, ...).
    3. Estimate how many multiple-choice questions (5-15) could be generated from that section based on its length/density.
    
    **OUTPUT FORMAT:**
    Return ONLY a valid JSON array:
    [
      { "topic": "1. Introduction to Subject", "count": 10 },
      { "topic": "2. Main Concepts", "count": 15 },
      { "topic": "2.1. Detailed Subconcept", "count": 5 }
    ]

    TEXT START:
    ${s.substring(0,5e4)}
  `;try{const d=(await m(r,o)).response.text().replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(d)}catch(t){throw console.error("Structural Index Generation Failed:",t),new Error("No se pudo generar el índice inteligente: "+t.message)}};export{N as analyzeTopics,I as generateQuestions,f as generateStructuralIndex,T as validateModels};
