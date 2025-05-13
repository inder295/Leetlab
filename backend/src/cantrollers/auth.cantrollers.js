import bcrypt from 'bcryptjs';
import {db} from '../libs/db.js';
import jwt from 'jsonwebtoken';
import { UserRole } from '../generated/prisma/index.js';


export const register =async (req,res)=>{
    
    const {email,password,name}=req.body;

    try {
        
        const existingUser=await db.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({
                message :"User already exists"
            })
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=await db.user.create({
            data:{
                email,
                password:hashedPassword,
                name,
                role: UserRole.USER
            }

        })

        const token=jwt.sign({id:newUser.id},process.env.JWT_SECRET,{
            expiresIn:'7d'
        })

        res.cookie("jwt",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV!=='development',
            samesite:'strict',
            maxAge:7*24*60*60*1000
        })

        res.status(201).json({
            message:"User created successfully",
            user:{
                id:newUser.id,
                email:newUser.email,
                name:newUser.name,
                role:newUser.role,
                image:newUser.image,
            }
                
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Error in register cantroller"
        })
        
    }

}

export const login =async (req,res)=>{

    const {email,password}=req.body;

    try{
        const existingUser=await db.user.findUnique({
            where:{
                email
            }

        })

        if(!existingUser){
            return res.status(400).json({
                message:"User not found"
            })
        }

        const isMatch=await bcrypt.compare(password,existingUser.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid credentials"
            })
        }
        
        const token=jwt.sign({id:existingUser.id},process.env.JWT_SECRET,{
            expiresIn:"7d"
        })

        res.cookie("jwt",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV!=='development',
            samesite:'strict',
            maxAge:7*24*60*60*1000
        })

        res.status(200).json({
            message:"User logged in successfully",
            user:{
                id:existingUser.id,
                email:existingUser.email,
                name:existingUser.name,
                role:existingUser.role,
                image:existingUser.image,
            }
        })



    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Error in login cantroller"
        })
    }


}

export const logout =async (req,res)=>{

    try {
        res.clearCookie("jwt",{
            httpOnly:true,
            secure:process.env.NODE_ENV!=='development',
            samesite:'strict',
        })

        res.status(200).json({
            message:"User logout successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Error in logout cantroller"
        })   
    }
}

export const check =async (req,res)=>{

    try {
        res.status(200).json({
            success:true,
            message:"User authenticated successfully",
            user:req.user
        })
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            message:"Error in check cantroller"
        })
        
        
    }
}