import { Request, Response } from "express";
import axios from "axios"

export const generateContent = async (req:Request, resp:Response)=> {
   const { text, maxToken } = req.body

   const aiResponse = await axios.post(
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
     {
       contents: [
         {
           parts: [{ text }]
         }
       ],
       generationConfig: {
         maxOutputTokens: maxToken || 150
       }
     },
     {
       headers: {
         "Content-Type": "application/json",
         "X-goog-api-key": "AIzaSyC2cZ285tSnoT2leiNIgPU5LJLf5KBq7-Y"
       }
     }
   )

   const genratedContent =
     aiResponse.data?.candidates?.[0]?.content?.[0]?.text ||
     aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
     "No data"

   console.log(resp)

   resp.status(200).json({
     data: genratedContent
   })

    // text ->
    //token-word

    //can use API or SDK
}