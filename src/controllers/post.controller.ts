import { Request, Response } from "express";
import { Post } from "../models/post.model";
import { AUthRequest } from "../middleware/auth";
// import cloudinary from "../config/cloudinary";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req: AUthRequest, resp: Response) => {
  try {
    const { title, content, tags } = req.body;
    const author = req.user.sub;

    let imageURL = "";

// ================== first option
    if (req.file) {

        const result:any = await new Promise((resole, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                {folder: "posts"},
                (error, result) => {
                    if(error) {
                        return reject(error)
                    }
                    resole(result) // success return
                }
            )
            upload_stream.end(req.file?.buffer)
        })
        imageURL = result.secure_url
    }

    const newPost = new Post({
        title, 
        content, 
        tags: tags.split(","),
        imageURL,
        author: req.user.sub // from auth midleware
    })

    await newPost.save()
// ================== second option
    // if (req.file) {
    //   const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    //   // Upload to Cloudinary
    //   const uploadResult = await cloudinary.uploader.upload(base64Image, {
    //     resource_type: "image",
    //     folder: "posts",
    //   });

    //   imageUrl = uploadResult.secure_url;
    // }

    resp.status(201).json({
      message: "Post created successfully!",
      data: newPost,
    });
  } catch (error) {
    console.error(error);
    resp.status(500).json({
      message: "Internal server error occurred",
    });
  }
};


// api/v1/post/
export const getAllPost = async(req: Request , resp: Response) => {

    try {

        //pagination
        const page = parseInt(req.query.page as string) | 1
        const limit = parseInt(req.query.limit as string) | 10

        const skip = (page - 1)* limit

        const posts = await Post
            .find()
            .populate("author" , "firstName email")  //related model data
            . sort({ createAt: -1})  // change order
            .skip(skip)  //ignore data for pagination
            .limit(limit)  //data  count currently need

        const total =  await Post.countDocuments()
        resp.status(200).json({
            message: "Posts data",
            data: posts,
            totalPages: Math.ceil(total / limit),
            totalCount:total
        })

    }catch (error) {
        console.error(error)
        resp
            .status(500)
            .json({
                message: "failed to fetch post"
            })
    }
    
}

// api/v1/post/me
export const getMyPost = async (req: AUthRequest, resp: Response) => {
    try {
        const author = req.user.sub;
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const skip = (page - 1) * limit;
        
        const posts = await Post
            .find({ author: author })
            .populate("author", "firstName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Post.countDocuments({ author: author });
        
        resp.status(200).json({
            message: "My posts data",
            data: posts,
            totalPages: Math.ceil(total / limit),
            totalCount: total
        });
        
    } catch (error) {
        console.error(error);
        resp
            .status(500)
            .json({
                message: "Failed to get my posts data"
            });
    }
};