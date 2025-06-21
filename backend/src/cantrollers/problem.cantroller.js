import {db} from "../libs/db.js"
import { getJudge0LanguageId,submitBatch,poolBatchResult } from "../libs/judge0.lib.js"

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
        console.log("languageId----",languageId);
        

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
            console.log("results----",result);
             
            if(result.status.id!==3){
                return res.status(400).json({
                    error:`Test case ${i+1} failed with language ${result.language} ` 
                })
            }
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

        console.log("Problem created successfuly");
        

        res.status(201).json({
            message:"Problem created successfully",
            problem:newProblem,
            success:true
        })

    
    } catch (error) {

        console.log(error);

        res.status(500).json({
            error:"Error in creating problem",
            success:false
        })
        
        
    }  
     
}

export const getAllProblems =async (req,res )=>{

    try {
        const problems=await db.problem.findMany({
            orderBy:{
                createdAt:"desc"
            },
            select:{
                id:true,
                title:true,
                difficulty:true,
                tags:true,
                createdAt:true,
            }
        })

        res.status(200).json({
            message:"Problem fetched successfully",
            problems,
            success:true
        })

    } catch (error) {
        console.log(`error in fetching all problems: ${error}`);
        res.status(500).json({
            error:"error in fetching problems",
            success:false
        })        
    }
     
}

export const getProblemById =async (req,res )=>{

    const {id}=req.params;

    if(!id){
        return res.status(400).json({
            error:"Problem id is required"
        })
    }

    try {
        const problem=await db.problem.findUnique({
            where:{
                id
            }
        })

        if(!problem){
            res.status(404).json({
                error:"Problem not found"
            })

        }

        res.status(200).json({
            message:"Problem fetched successfully",
            problem,
            success:true
        })

    } catch (error) {

        console.log(`error in get problem by id route: ${error}`);
        
        res.status(500).json({
            error:"Error in fetching problem",
            success:false
        })

        
    }    
}

export const updateProblem =async (req,res )=>{
    const problemId=req.params.id;
    
    if(!problemId){
        res.status(400).json({
            error:"Problem id is required"
        })
    }

    if(req.user.role !=="ADMIN"){
        res.status(403).json({
            error:"You are not allowed to update the problem"
        })
    }

    const {title,description,difficulty,tags,examples,constraints,testCases,codeSnippets,referenceSolutions}=req.body;

    try {
            const existingProblem =await db.problem.findUnique({
            where:{
                id: problemId
            }
        })

        if(!existingProblem){
            res.status(404).json({
                error:"Problem not found"
            })
        }

    if(codeSnippets && testCases){
        for(const [language,solutionCode] of Object.entries(codeSnippets)){
            const languageId= getJudge0LanguageId(language);

            if(!languageId){
                return res.status(400).json({
                    error:`Language ${language} is not supported`
                })
            }

            const submission=testCases.map(({input,output})=>({
                source_code:solutionCode,
                language_id:languageId,
                stdin:input,
                expected_output:output
            }))

            const submissionResult=await submitBatch(submission);
            const tokens=submissionResult.map((res)=> res.token)
            const results=await poolBatchResult(tokens);

            for(let i=0;i<results.length;i++){
                const result=results[i];
                if(result.status.id !==3){
                    return res.status(400).json({
                        error:`Test case ${i+1} failed with languager ${result.language}`
                    })
                }
            }


        }

        const updateProblem=await db.problem.update({
            where:{
                id: problemId
            },
            data:{
                title,description,difficulty,tags,examples,constraints,testCases,codeSnippets,referenceSolutions,
            }
        })

        return res.status(200).json({
            message:"Problem updated successfully",
            success:true,
            problem:updateProblem
        })



    }
    } catch (error) {

        console.log(`error in update problem route: ${error}`);
        res.status(500).json({
            error:"Error in updating problem",
            success:false
        })        
    }
}

export const deleteProblem =async (req,res )=>{

    const {id}=req.params;
    
    if(!id){
        return res.status(400).json({
            error:"Problem id is required"
        })
    }

    if(req.user.role !=="ADMIN"){
        return res.status(403).json({
            error:"You are not allowed to delete the problem"
        })
    }

    try {

        const existingProblem=await db.problem.findUnique({
            where:{id}
        })

        if(!existingProblem){
            res.status(404).json({
                error:"Problem not found"
            })

        }

        await db.problem.deleteProblem({
            where:{id}
        })

        res.status(200).json({
            message:"problem deleted successfully",
            success:true
        })

        
    } catch (error) {

        console.log(`error in delete problem route: ${error}`);
        res.status(500).json({
            error:"Error in deleting problem",
            success:false
        })
        
        
    }
}

export const getSolvedProblemsByUser =async (req,res )=>{
    
}
