import { poolBatchResult, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {


    try {
        const {source_code,language_id,stdin, expected_output,problemId} = req.body;
        const userId=req.user.id;

       // validated the test cases

       if(!Array.isArray(stdin) ||  stdin.length === 0 || !Array.isArray(expected_output) || expected_output.length !== stdin.length){
            return res.status(400).json({
                error:"Invalid or missing test cases"
            })
       }

       //prepare test cases for batch submissions

       const submissions=stdin.map((input)=>({
        source_code,
        language_id,
        stdin:input
        // base64_encoded:false,
        // wait:false

       }))

       //3. submit the batch of test cases  to judge0

       const submitResponse =await submitBatch(submissions)

       const tokens = submitResponse.map((res)=> res.token)

       //poll judge0 for results for all submittes test cases

       const results = await poolBatchResult(tokens)

       console.log("results--");
       console.log(results);
       

       res.status(200).json({
         message: "code executed"
       })
       


       


    } catch (error) {

        console.log(`error in executeCode controller: ${error.message}`);
        res.status(500).json({
            error:"error in executing code ",
            success:false
        })
        
    }
}