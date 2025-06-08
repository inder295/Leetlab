import axios from "axios";
import dotenv from "dotenv";
dotenv.config("../../.env");

 export const getJudge0LanguageId = (language) =>{
    const languageMap = {
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
    }

    return languageMap[language.toUpperCase()]
 }

 export const submitBatch=async (submissions) =>{
   
    try {
         const {data} =await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{ 
        submissions
    })

    console.log("Submission Results: ",data);
    return data; //[{token},{token},{token}]
    } catch (error) {
        console.log(`error in submitBatch`,error);
        
        
    }

    
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
        const isAllDone = results.every(
            (r)=> r.status.id !== 1 && r.status.id !== 2
        )


        if(isAllDone){
            return results
        }

        await sleep(1000);


    }
 }