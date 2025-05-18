import axios from "axios";

 export const getJudge0LanguageId =(language) =>{
    const languageMap={
        "PHYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
        "CPP":54,
    }

    return languageMap[language.toUpperCase()] || null;
 }

 export const submitBatch=async (submissions) =>{
    const {data} =await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?batch64_encoded=false`,{ 
        submissions
    })

    console.log("Submission Results: ",data);
    return data; //[{token},{token},{token}]

    
 }

 const sleep =(ms) => new Promise((resolve)=> setTimeout(resolve,ms));

 export const poolBatchResult=async (tokens)=>{

    while(true){
        const {data}=await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
             params:{
                tokens:tokens.join(","),
                base64_encoded:false,
             }
        })

        const results=data.submissions; //status code like[ {"run time error"},{"time limit exceeded"}]
        
        //every => when all submissions true returns true else false
        const isAllDone=results.every(
            (r)=>r.status.id !== 1 && r.starus.id !== 2
        )

        if(isAllDone){
            return results
        }

        await sleep(1000);


    }
 }