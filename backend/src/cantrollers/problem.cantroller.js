import {db} from "../libs/db.js"
import { getJudge0LanguageId } from "../libs/judge0.lib.js"

export const createProblem =async (req,res )=>{

    //take credentials
    //check admin
    //loop through each and every solution

    const {title,description,difficulty,tags,examples,constraints,testCases,codeSnippets,referenceSolutions}=req.body

    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            error:"You are not allowed to create a problem"
        })
    }


    try {

        for(const [language,solutionCode] of Object.entries(codeSnippets)){
        const languageId= getJudge0LanguageId(language)

        if(!languageId){
            return res.status(400).json({
                error:`Language ${language} is not supported`
            })
        }
        
        //implicit return else i have to write return statement  
        const submission= testCases.map(({input,output})=>({
            source_code : solutionCode,
            language_id : languageId,
            stdin: input,
            expected_output: output,


        }))
        //tokens for every test case
        const submissionResults= await submitBatch(submission);
        
        const tokens=submissionResults.map((res)=> res.token);

        const results =await poolBatchResult(tokens);

        for(let i=0;i<results.length;i++){
            const result=results[i];
             
            if(result.status.id!==3){
                return res.status(400).json({
                    error:`Test case ${i+1} failed with language ${result.language} ` 
                })
            }
        }

        const newProblem =await db.problem.create( 
            {
                data:{
                    title,description,difficulty,tags,examples,constraints,testCases,codeSnippets,referenceSolutions,
                    userId:req.user.id,
                }   
            }
        )

        res.status(201).json(newProblem)

    }
    } catch (error) {
        
    }
     
}

export const getAllProblems =async (req,res )=>{
     
}

export const getProblemById =async (req,res )=>{}

export const updateProblem =async (req,res )=>{}

export const deleteProblem =async (req,res )=>{}

export const getSolvedProblemsByUser =async (req,res )=>{}
