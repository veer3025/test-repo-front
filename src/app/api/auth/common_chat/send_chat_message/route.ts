// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import { format } from 'date-fns'
import excuteQuery from '@/app/api/connect_m'
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import { writeFile } from "fs/promises";
import { fileTypeFromBuffer } from 'file-type';
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  chat_record? : any
};
interface uploadFilesArrTemplate {
  disk_name : string;
  original_name : string;
}
const user_chats_base_path : string = 'public/images/user_chats';
const maxFileSize : number = 5;
const maxFileSizeBytes : number = maxFileSize*1024*1024;
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Message Sent";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let upload_files_arr : uploadFilesArrTemplate[] = [];
    let login_user_id : number =  await getLoggedInUserId(request);
    let formData =  await request.formData();
    let to_user_id  = formData.get('to_user_id');
    let message = formData.get('message');
    let chat_type = formData.get('chat_type');
    let file_type = formData.get('file_type');
    let files = formData.getAll('files[]');
    let created :string = getCurrentTimeStamp();
    let modified :string = getCurrentTimeStamp();
    let removed : string = "N";
    let file_system_name = "";
    let file_original_name = "";
    let seen_by_to_user = null;

    // console.log(files);
    //Upload files Begin
    if(files.length)
    {
      upload_files_arr = await uploadAttachments(login_user_id,to_user_id,files);
    }

    if(upload_files_arr?.length)
    {
      file_system_name = upload_files_arr[0].disk_name;
      file_original_name = upload_files_arr[0].original_name;
    }
    //Upload files End
    const q_param : any = [login_user_id,to_user_id,message,chat_type,file_type,file_system_name,file_original_name,seen_by_to_user,removed,created,modified];
    const query = `
      INSERT INTO 
        user_chats(from_user_id,to_user_id,message,chat_type,file_type,file_system_name,file_original_name,seen_by_to_user,removed,created,modified)
      VALUES(
        ${"?,".repeat(q_param.length).replace(/,*$/,"")}
      )
    `;
    let qry_response = await excuteQuery(query,q_param);

    if(Boolean(qry_response.q_res))
    {
      let chatId : number = qry_response.q_res.insertId;
      let chat_record = await getChatByChatId(chatId);
      data.chat_record = chat_record;
    }
    else
    {
      throw new Error("Insert Query Error");
    }
  }
  catch(error)
  {
    //console.log(error);
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

const getChatByChatId = async (id:number) : Promise<any> => {
  let response : any = null;
  let current_time_stamp : string = getCurrentTimeStamp();
  try{
    let qry : string = `
      SELECT
        temp.*,
        (
          CASE 
            WHEN snd_dte_secnds_diff < 60 THEN 
              CONCAT(ROUND(snd_dte_secnds_diff)," second ago")
            WHEN snd_dte_secnds_diff < 60 * 60 THEN
              CONCAT(ROUND(snd_dte_secnds_diff / 60)," minute ago")
            WHEN snd_dte_secnds_diff < 60 * 60 * 24 THEN
              CONCAT(ROUND(snd_dte_secnds_diff / (60 * 60)) ," hour ago")
            ELSE send_date
          END
        ) AS send_text
        FROM
          (
            SELECT 
              uc.id,
              uc.from_user_id,
              uc.to_user_id,
              uc.message,
              uc.chat_type,
              uc.file_type,
              uc.file_system_name,
              uc.file_original_name,
              uc.seen_by_to_user,
              DATE_FORMAT(uc.created,"%d %b %y %h:%i %p") as send_date,
              ABS(TIMESTAMPDIFF(SECOND,uc.created,'${current_time_stamp}')) AS snd_dte_secnds_diff,
              IF(uc.seen_by_to_user IS NULL,'N','Y') as is_seen 
            FROM user_chats uc
              WHERE uc.id = ${id}
          ) temp
    `;
  
    const q_param : any = [];
    const q_result : any = await excuteQuery(qry,q_param);
    console.log(q_result);
    if(q_result?.q_res)
    {
      response = q_result?.q_res[0] ?? [];
    }
    else{
      throw new Error("QRY Error");
    }
  }
  catch(error)
  {
   
  }
  return response;
} 


const uploadAttachments = async (from_user_id:number,to_user_id:any,files:any) : Promise<uploadFilesArrTemplate[]> => {
  let upload_files_arr : uploadFilesArrTemplate[] = [];
  try{
    if(files?.length)
    {
      await Promise.all(
        files.map(async (file : any,index : any)=>{
          const original_file_name = file.name;
          const buffer : any = Buffer.from(await file.arrayBuffer());
          const fileType : any = await fileTypeFromBuffer(buffer);
          const fileSize : number = file.size;
          if(fileSize > maxFileSizeBytes)
          {
            throw new Error("error occur");
          }
          const file_name = `user_chat_${from_user_id}_${to_user_id}_${uuidv4()}_${index}.${fileType?.ext ?? ""}`;
          await writeFile(
            path.join(process.cwd(), `${user_chats_base_path}/${file_name}`),
            buffer
          );
          upload_files_arr.push({'disk_name':file_name,'original_name':original_file_name});
        })
      );
    }
  }
  catch(error){
    throw error;
  }
  finally{

  }
  return upload_files_arr;
}
