// MTak Begin
import { NextResponse } from "next/server";
import excuteQuery from '@/app/api/connect_m'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import {getCurrentTimeStamp} from "@/libs/common_function"
import { sendNotification ,notificationTypeType} from "@/app/api/auth/notification/sendNotification";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import { writeFile } from "fs/promises";
import { fileTypeFromBuffer } from 'file-type';
//Type Begin
type Data = {

};

type ReqData = {
}

type createPostFunType = (login_user_id:number,post_type:string,message:string,gr_class:string) => Promise<unknown>;
type createPostTagTransFunType = (login_user_id:number,post_id:number,userIdArr:any[]) => Promise<unknown>;
type createPostShareTransFunType = (login_user_id:number,post_id:number,userIdArr:any[]) => Promise<unknown>;
type createPostImageTransFunType = (login_user_id:number,post_id:number,imageArr:any[]) => Promise<unknown>;
type uploadImagesFunType = (login_user_id:number,post_id:number,imageArr:any[]) => Promise<unknown>;
type imageObject = {
  original_name : string;
  disk_name : string;
}
//Type End

//constants begin
const posts_base_path : string = 'public/images/user_posts';
const maxFileSize : number = 5;
const maxFileSizeBytes : number = maxFileSize*1024*1024;
//constans end
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Post Created";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    //-------------------------BEGIN TRANSACTION start
    let result_start_transaction = await excuteQuery('START TRANSACTION',[]);
    //-------------------------BEGIN TRANSACTION end

    let login_user_id : number =  await getLoggedInUserId(request);
    const formData = await request.formData();
    const message : string = (formData.get('message') ?? "") as string;
    const gr_class : string = (formData.get('post_class') ?? "") as string;
    const post_type : string =  (formData.get('post_type') ?? "") as string; 
    const imagesArr : any =  formData.getAll('imagesArr') ?? [];
    const userIds : any =  formData.getAll('userIds') ?? [];
    const privateUserIds : any = formData.getAll('privateUserIds') ?? [];
    let post_id :number = await createPost(login_user_id,post_type,message,gr_class) as number;
    let response_create_post_tag_trans : any =  await createPostTagTrans(login_user_id,post_id,userIds);
    let response_create_post_share_trans : any = await createPostShareTrans(login_user_id,post_id,privateUserIds);
    let response_create_post_image_trans :any =  await createPostImageTrans(login_user_id,post_id,imagesArr);
    let response_send_notification : any = await sendNotification(login_user_id,'P' as notificationTypeType,{'postType':post_type,'userIds':privateUserIds} );
    // console.log(response_send_notification);
    //----------------------COMMIT transaction start
    let result_commit = await excuteQuery('COMMIT',[]);
    //----------------------COMMIT transaction end
  }
  catch(error)
  {
    //----------------------ROLLBACK TRANSACTION start
    let result_rollback = await excuteQuery('ROLLBACK',[]);
    //----------------------ROLLBACK TRANSACTION end
    console.log(error);
    apiStatus = false;
  }
  if(apiStatus)
  {
    return NextResponse.json(
      {
        'message': successMessage,
        'data' : data,
        'error' : ''
      },
      {
        'status':200,
        'statusText':"Response Ok"
      }
    );
  }
  else{
    return NextResponse.json(
      {
        'message': errorMessage,
        'data' : {},
        'error' : ''
      },
      {
        'status':401,
        'statusText':"Error Occur"
      }
    );
  }
}

const createPost : createPostFunType = async (login_user_id,type,message,gr_class) : Promise<unknown> => {
  let post_id : number = 0;
  let removed : "Y"|"N" = "N";  
  let current_time_stamp : string = getCurrentTimeStamp();
  try{
    let q_param : any[] = [login_user_id,message,removed,type,gr_class,current_time_stamp,current_time_stamp,current_time_stamp]
    let query : string = `
      INSERT INTO posts(user_id,message,removed,type,gr_class,created,modified,last_updated)
      VALUES(
        ${ "?,".repeat(q_param.length).replace(/,*\s*$/,"") }
      )
    `;
    let qry_response = await excuteQuery(query,q_param);
    let q_res : any = qry_response?.q_res;
    if(q_res)
    {
      post_id = q_res?.insertId;
    }
    else
    {
      throw new Error("create posts query error");
    }
  } 
  catch(error:any)
  {
    throw new Error("create posts query error");
  }
  return post_id;
}

const createPostTagTrans : createPostTagTransFunType = async(login_user_id,post_id,userIdArr) : Promise<unknown> => {
  let response = null;
  let removed : "Y"|"N" = "N";  
  let current_time_stamp : string = getCurrentTimeStamp();
  let values : string = "";
  try{
    if(userIdArr?.length)
    {
      for(let user_id of userIdArr)
      {
        values = values + `
          (${post_id},${user_id},'${removed}','${current_time_stamp}','${current_time_stamp}'),
        `;
      }
      
      values = values.replace(/,*\s*$/,"");

      let qry = `
        INSERT INTO post_tag_trans(post_id,user_id,removed,created,modified)
        VALUES ${values}
      `;

      let qry_response =  await excuteQuery(qry,[]);
      let q_res : any = qry_response?.q_res;
      
      if(!Boolean(q_res))
      {
        throw new Error("create post_tag_trans query error");
      }
    }
  }
  catch(error:any){
    throw new Error("create post_tag_trans query error");
  }
  return response;
}

const createPostShareTrans : createPostShareTransFunType = async(login_user_id,post_id,userIdArr) : Promise<unknown> => {
  let response = null;
  let removed : "Y"|"N" = "N";  
  let current_time_stamp : string = getCurrentTimeStamp();
  let values : string = "";
  try{
    if(userIdArr?.length)
    {
      for(let user_id of userIdArr)
      {
        values = values + `
          (${post_id},${user_id},'${removed}','${current_time_stamp}','${current_time_stamp}'),
        `;
      }
      
      values = values.replace(/,*\s*$/,"");

      let qry = `
        INSERT INTO post_share_trans(post_id,user_id,removed,created,modified)
        VALUES ${values}
      `;

      let qry_response =  await excuteQuery(qry,[]);
      let q_res : any = qry_response?.q_res;
      
      if(!Boolean(q_res))
      {
        throw new Error("create post_share_trans query error");
      }
    }
  }
  catch(error:any){
    throw new Error("create post_share_trans query error");
  }
  return response;
}

const createPostImageTrans : createPostImageTransFunType = async(login_user_id,post_id,imageArr) : Promise<unknown> => {
  let response = null;
  let removed : "Y"|"N" = "N";  
  let current_time_stamp : string = getCurrentTimeStamp();
  let values : string = "";
  try{
    let imagesNamesArr : imageObject[] = await uploadImages(login_user_id,post_id,imageArr) as imageObject[];
    if(imagesNamesArr?.length)
    {
      imagesNamesArr.map((record:imageObject,index:number)=>{
        values = values + `
          (${post_id},'${record.disk_name}','${record.original_name}','${removed}','${current_time_stamp}','${current_time_stamp}'),
        `;
      });
      
      values = values.replace(/,*\s*$/,"");

      let qry : string = `
        INSERT INTO post_image_trans(post_id,image_system_name,image_origional_name,removed,created,modified)
        VALUES ${values}
      `;

      let qry_response =  await excuteQuery(qry,[]);
      let q_res = qry_response?.q_res;
      if(!Boolean(q_res))
      {
        throw new Error("create post_image_trans query error");
      }
    }
  }
  catch(error:any){
    throw new Error(error);
  }
  return response;
}

const uploadImages : uploadImagesFunType = async (login_user_id,post_id,imageArr) : Promise<any[]> =>{
  let uploadFilesArr : imageObject[] = [];
  try{
    if(imageArr?.length)
    {
      await Promise.all(
        imageArr.map(async (file : any,index : any)=>{
          const original_file_name = file.name;
          const buffer : any = Buffer.from(await file.arrayBuffer());
          const fileType : any = await fileTypeFromBuffer(buffer);
          const fileSize : number = file.size;
          if(fileSize > maxFileSizeBytes)
          {
            throw new Error("error occur");
          }
          const file_name = `post_${post_id}_${uuidv4()}_${index}.${fileType?.ext ?? ""}`;
          await writeFile(
            path.join(process.cwd(), `${posts_base_path}/${file_name}`),
            buffer
          );
          uploadFilesArr.push({'disk_name':file_name,'original_name':original_file_name});
        })
      );
    }
  }
  catch(error:any){
    throw new Error("File Upload Error");
  }
  return uploadFilesArr;
} 
